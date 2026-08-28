mod manifest;
mod path_security;
mod protocol;
mod storage;

#[cfg(test)]
mod tests;

use std::{
    collections::{BTreeSet, HashMap},
    path::PathBuf,
    sync::{Arc, Mutex},
};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_opener::OpenerExt;

use manifest::ValidatedManifest;
use storage::{
    active_snapshot, commit_snapshot, prepare_snapshot, project_source_location, prune_revisions,
    record_source_binding, ProjectBinding, ProjectCanvasSourceLocation,
};

const MAX_ACTIVE_LOADS: usize = 64;

#[derive(Clone)]
pub(crate) struct ProjectCanvasRuntime {
    root: Option<PathBuf>,
    loads: Arc<Mutex<HashMap<String, ActiveLoad>>>,
    activation_lock: Arc<Mutex<()>>,
}

impl Default for ProjectCanvasRuntime {
    fn default() -> Self {
        Self {
            // Resolve the nest lazily: setup selects `.buzz` or `.buzz-dev`
            // after managed state is constructed.
            root: None,
            loads: Arc::new(Mutex::new(HashMap::new())),
            activation_lock: Arc::new(Mutex::new(())),
        }
    }
}

impl ProjectCanvasRuntime {
    #[cfg(test)]
    fn with_root(root: PathBuf) -> Self {
        Self {
            root: Some(root),
            loads: Arc::new(Mutex::new(HashMap::new())),
            activation_lock: Arc::new(Mutex::new(())),
        }
    }

    fn root(&self) -> Result<PathBuf, String> {
        self.root
            .clone()
            .or_else(|| crate::managed_agents::nest_dir().map(|root| root.join("CANVASES")))
            .ok_or_else(|| "cannot resolve the nest directory for project canvases".to_string())
    }

    fn get_or_activate(
        &self,
        request: ProjectCanvasPackageRequest,
        template: &std::path::Path,
    ) -> Result<ProjectCanvasPackageDescriptor, String> {
        let binding = ProjectBinding::parse(request)?;
        ensure_supported_platform()?;
        let _guard = self
            .activation_lock
            .lock()
            .map_err(|_| "project canvas activation lock is unavailable".to_string())?;

        let root = self.root()?;
        let snapshot = match active_snapshot(&root, &binding)? {
            Some(snapshot) => snapshot,
            None => prepare_snapshot(&root, &binding, Some(template))?,
        };
        let mut retained = self.referenced_revisions(&binding)?;
        retained.insert(snapshot.revision.clone());
        prune_revisions(&root, &binding, &retained)?;
        // The index is agent-facing discovery metadata, not runtime authority. A
        // malformed or manually edited index must not block a validated package.
        let _ = record_source_binding(&root, &binding);
        self.issue_load(binding, snapshot)
    }

    fn activate(
        &self,
        request: ProjectCanvasPackageRequest,
        template: &std::path::Path,
    ) -> Result<ProjectCanvasPackageDescriptor, String> {
        let binding = ProjectBinding::parse(request)?;
        ensure_supported_platform()?;
        let _guard = self
            .activation_lock
            .lock()
            .map_err(|_| "project canvas activation lock is unavailable".to_string())?;
        let root = self.root()?;
        let snapshot = prepare_snapshot(&root, &binding, Some(template))?;
        let mut retained = self.referenced_revisions(&binding)?;
        retained.insert(snapshot.revision.clone());
        prune_revisions(&root, &binding, &retained)?;
        let _ = record_source_binding(&root, &binding);
        self.issue_load(binding, snapshot)
    }

    fn commit(&self, load_id: &str) -> Result<(), String> {
        let load = self
            .load(load_id)?
            .ok_or_else(|| "project canvas load not found".to_string())?;
        let _guard = self
            .activation_lock
            .lock()
            .map_err(|_| "project canvas activation lock is unavailable".to_string())?;
        let root = self.root()?;
        commit_snapshot(&root, &load.binding, &load.revision)?;
        let retained = self.referenced_revisions(&load.binding)?;
        prune_revisions(&root, &load.binding, &retained)
    }

    fn source_location(
        &self,
        request: ProjectCanvasPackageRequest,
    ) -> Result<ProjectCanvasSourceLocation, String> {
        let binding = ProjectBinding::parse(request)?;
        ensure_supported_platform()?;
        let _guard = self
            .activation_lock
            .lock()
            .map_err(|_| "project canvas activation lock is unavailable".to_string())?;
        let root = self.root()?;
        let location = project_source_location(&root, &binding)?;
        let _ = record_source_binding(&root, &binding);
        Ok(location)
    }

    fn issue_load(
        &self,
        binding: ProjectBinding,
        snapshot: storage::ValidatedSnapshot,
    ) -> Result<ProjectCanvasPackageDescriptor, String> {
        let load_id = uuid::Uuid::new_v4().simple().to_string();
        let nonce = uuid::Uuid::new_v4().simple().to_string();
        let manifest = snapshot.manifest.clone();
        let data = snapshot.data.clone();
        let revision = snapshot.revision.clone();
        let scope = binding.scope();
        let load = ActiveLoad {
            binding,
            files: snapshot.files,
            nonce: nonce.clone(),
            scope,
            granted_capabilities: manifest.capabilities.clone(),
            manifest,
            revision: revision.clone(),
        };

        let mut loads = self
            .loads
            .lock()
            .map_err(|_| "project canvas load registry is unavailable".to_string())?;
        if loads.len() >= MAX_ACTIVE_LOADS {
            if let Some(oldest) = loads.keys().next().cloned() {
                loads.remove(&oldest);
            }
        }
        loads.insert(load_id.clone(), load);

        Ok(ProjectCanvasPackageDescriptor {
            url: protocol_url(&load_id),
            load_id,
            revision,
            nonce,
            capabilities: snapshot.manifest.capabilities,
            data,
        })
    }

    fn load(&self, load_id: &str) -> Result<Option<ActiveLoad>, String> {
        let loads = self
            .loads
            .lock()
            .map_err(|_| "project canvas load registry is unavailable".to_string())?;
        let load = loads.get(load_id).cloned();
        if let Some(load) = &load {
            if !load.scope.is_valid() || load.granted_capabilities != load.manifest.capabilities {
                return Err("project canvas load binding is invalid".to_string());
            }
        }
        Ok(load)
    }

    fn referenced_revisions(&self, binding: &ProjectBinding) -> Result<BTreeSet<String>, String> {
        let loads = self
            .loads
            .lock()
            .map_err(|_| "project canvas load registry is unavailable".to_string())?;
        Ok(loads
            .values()
            .filter(|load| load.binding.matches(binding))
            .map(|load| load.revision.clone())
            .collect())
    }

    fn release(&self, load_id: &str) -> Result<(), String> {
        let parsed = uuid::Uuid::parse_str(load_id)
            .map_err(|_| "invalid project canvas load id".to_string())?;
        let key = parsed.simple().to_string();
        let mut loads = self
            .loads
            .lock()
            .map_err(|_| "project canvas load registry is unavailable".to_string())?;
        loads.remove(&key);
        Ok(())
    }
}

#[derive(Clone)]
struct ActiveLoad {
    binding: ProjectBinding,
    files: Arc<std::collections::BTreeMap<String, Vec<u8>>>,
    nonce: String,
    scope: storage::CanvasScope,
    granted_capabilities: Vec<String>,
    manifest: ValidatedManifest,
    revision: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct ProjectCanvasPackageRequest {
    community_id: String,
    project_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProjectCanvasPackageDescriptor {
    load_id: String,
    url: String,
    revision: String,
    nonce: String,
    capabilities: Vec<String>,
    data: serde_json::Value,
}

#[tauri::command]
pub(crate) async fn get_project_canvas_package(
    request: ProjectCanvasPackageRequest,
    app: AppHandle,
    runtime: State<'_, ProjectCanvasRuntime>,
) -> Result<ProjectCanvasPackageDescriptor, String> {
    let template = template_path(&app)?;
    let runtime = runtime.inner().clone();
    run_blocking(move || runtime.get_or_activate(request, &template)).await
}

#[tauri::command]
pub(crate) async fn activate_project_canvas_package(
    request: ProjectCanvasPackageRequest,
    app: AppHandle,
    runtime: State<'_, ProjectCanvasRuntime>,
) -> Result<ProjectCanvasPackageDescriptor, String> {
    let template = template_path(&app)?;
    let runtime = runtime.inner().clone();
    run_blocking(move || runtime.activate(request, &template)).await
}

#[tauri::command]
pub(crate) fn release_project_canvas_package(
    load_id: String,
    runtime: State<'_, ProjectCanvasRuntime>,
) -> Result<(), String> {
    runtime.release(&load_id)
}

#[tauri::command]
pub(crate) async fn commit_project_canvas_package(
    load_id: String,
    runtime: State<'_, ProjectCanvasRuntime>,
) -> Result<(), String> {
    let runtime = runtime.inner().clone();
    run_blocking(move || runtime.commit(&load_id)).await
}

#[tauri::command]
pub(crate) async fn open_project_canvas_source(
    request: ProjectCanvasPackageRequest,
    app: AppHandle,
    runtime: State<'_, ProjectCanvasRuntime>,
) -> Result<(), String> {
    let runtime = runtime.inner().clone();
    let location = run_blocking(move || runtime.source_location(request)).await?;
    app.opener()
        .open_path(&location.source_path, None::<&str>)
        .map_err(|error| format!("open project canvas source: {error}"))
}

#[tauri::command]
pub(crate) async fn get_project_canvas_source(
    request: ProjectCanvasPackageRequest,
    runtime: State<'_, ProjectCanvasRuntime>,
) -> Result<ProjectCanvasSourceLocation, String> {
    let runtime = runtime.inner().clone();
    run_blocking(move || runtime.source_location(request)).await
}

pub(crate) fn handle_request(
    app: &AppHandle,
    request: &tauri::http::Request<Vec<u8>>,
) -> tauri::http::Response<Vec<u8>> {
    let runtime = app.state::<ProjectCanvasRuntime>();
    protocol::handle(&runtime, request)
}

fn template_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .resource_dir()
        .map(|path| path.join("resources").join("project-canvas-template"))
        .map_err(|error| format!("resolve project canvas template: {error}"))
}

async fn run_blocking<T, F>(task: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, String> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(task)
        .await
        .map_err(|error| format!("project canvas task failed: {error}"))?
}

fn protocol_url(load_id: &str) -> String {
    if cfg!(target_os = "windows") {
        format!("http://buzz-canvas.localhost/{load_id}/")
    } else {
        format!("buzz-canvas://localhost/{load_id}/")
    }
}

fn ensure_supported_platform() -> Result<(), String> {
    if !cfg!(target_os = "macos") {
        return Err(
            "sandboxed project canvases are macOS-only until iframe IPC isolation is proven on this platform"
                .to_string(),
        );
    }
    Ok(())
}

pub(crate) fn allow_webview_navigation(url: &tauri::Url) -> bool {
    match url.scheme() {
        "about" => url.as_str() == "about:blank",
        "buzz-canvas" => url.host_str() == Some("localhost"),
        "tauri" => url.host_str() == Some("localhost"),
        "http" if cfg!(debug_assertions) => {
            url.host_str() == Some("localhost") && url.port() == Some(1420)
        }
        _ => false,
    }
}
