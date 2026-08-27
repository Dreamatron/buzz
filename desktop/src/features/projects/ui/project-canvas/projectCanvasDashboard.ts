export type ProjectCanvasDashboard = "default" | "dev" | "home" | "support";

function normalizeProjectCanvasName(name: string) {
  return name.trim().replace(/^#/, "").toLowerCase();
}

export function resolveProjectCanvasDashboard(
  projectNames: readonly string[],
): ProjectCanvasDashboard {
  const names = new Set(projectNames.map(normalizeProjectCanvasName));
  if (names.has("my-home")) return "home";
  if (names.has("my-dev-team")) return "dev";
  if (names.has("my-support-channel")) return "support";
  return "default";
}
