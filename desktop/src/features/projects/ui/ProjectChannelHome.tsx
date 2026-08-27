import { useSearch } from "@tanstack/react-router";
import { ArrowLeft, Maximize2, Plus } from "lucide-react";
import * as React from "react";

import { useAppNavigation } from "@/app/navigation/useAppNavigation";
import { useChannelsQuery } from "@/features/channels/hooks";
import { ChannelScreenLoadingFallback } from "@/features/channels/ui/ChannelScreenLoadingFallback";
import { ChannelViewOverrideProvider } from "@/features/channels/ui/ChannelViewOverrideContext";
import { useCommunities } from "@/features/communities/useCommunities";
import { useProfileQuery } from "@/features/profile/hooks";
import type { Project } from "@/features/projects/hooks";
import {
  projectHomeWorkspaceSheetExpandTab,
  projectHomeWorkspaceSheetTitle,
} from "@/features/projects/lib/projectHomeWorkspaceSheet";
import { ProjectSelectionProvider } from "@/features/projects/lib/useProjectSelection";
import { useChannelProjectFeatures } from "@/features/projects/useChannelProjectFeatures";
import { useHealProjectHomeRepositories } from "@/features/projects/useHealProjectHomeRepositories";
import { useIdentityQuery } from "@/shared/api/hooks";
import type { Channel, RelayEvent } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { ViewLoadingFallback } from "@/shared/ui/ViewLoadingFallback";
import { ProjectChannelResourcesView } from "./ProjectChannelResourcesView";
import { ProjectCanvasSurface } from "./project-canvas/ProjectCanvasSurface";
import {
  ProjectChannelTabs,
  projectChannelViewEnabled,
  type ProjectChannelView,
} from "./ProjectChannelTabs";
import { ProjectDetailChrome } from "./ProjectDetailChrome";
import {
  ProjectHomeWorkspaceSheet,
  type ProjectHomeWorkspaceCreateAction,
  type ProjectHomeWorkspaceDetail,
} from "./ProjectHomeWorkspaceSheet";
import { ProjectRepositoryManagement } from "./ProjectRepositoryManagement";

const EMPTY_TARGET_MESSAGE_EVENTS: RelayEvent[] = [];

const ChannelScreenView = React.lazy(async () => {
  const module = await import("@/features/channels/ui/ChannelScreen");
  return { default: module.ChannelScreen };
});

function ignoreForumPost() {}
function ignoreForumPostSelect() {}

export function ProjectChannelHome({
  autoSendDraftKey,
  channel,
  project,
  projects,
  targetMessageEvents = EMPTY_TARGET_MESSAGE_EVENTS,
  targetMessageId,
}: {
  autoSendDraftKey?: string | null;
  channel: Channel;
  project: Project;
  projects: Project[];
  targetMessageEvents?: RelayEvent[];
  targetMessageId?: string | null;
}) {
  const { goChannel, goProject } = useAppNavigation();
  const { activeCommunity } = useCommunities();
  const identityQuery = useIdentityQuery();
  const profileQuery = useProfileQuery();
  const channelsQuery = useChannelsQuery();
  const search = useSearch({ strict: false }) as {
    autoSend?: string;
    messageId?: string;
  };
  const [activeView, setActiveView] =
    React.useState<ProjectChannelView>("chat");
  const [addRepositoryOpen, setAddRepositoryOpen] = React.useState(false);
  const [workspaceRepositoryId, setWorkspaceRepositoryId] = React.useState<
    string | null
  >(null);
  const [workspaceCreateAction, setWorkspaceCreateAction] =
    React.useState<ProjectHomeWorkspaceCreateAction | null>(null);
  const [workspaceDetail, setWorkspaceDetail] =
    React.useState<ProjectHomeWorkspaceDetail | null>(null);
  const channelFeatures = useChannelProjectFeatures({
    channel,
    currentPubkey: identityQuery.data?.pubkey,
    relayUrl: activeCommunity?.relayUrl,
  });
  const homeChannel =
    channelsQuery.data?.find(
      (candidate) => candidate.id === project.projectChannelId,
    ) ?? null;
  const waitingForChannel = channelsQuery.isPending && !homeChannel;
  const workspaceTab =
    activeView === "issues"
      ? "issues"
      : activeView === "reviews"
        ? "prs"
        : null;
  const workspaceRepository =
    project.repositories.find(
      (repository) => repository.id === workspaceRepositoryId,
    ) ??
    project.repositories[0] ??
    null;

  const selectView = React.useCallback(
    (view: ProjectChannelView) => {
      if ((view === "issues" || view === "reviews") && !workspaceRepository) {
        setAddRepositoryOpen(true);
        return;
      }
      setWorkspaceCreateAction(null);
      setWorkspaceDetail(null);
      setActiveView(view);
    },
    [workspaceRepository],
  );
  React.useEffect(() => {
    if (!projectChannelViewEnabled(activeView, channelFeatures.enabled)) {
      selectView("chat");
    }
  }, [activeView, channelFeatures.enabled, selectView]);

  const handleOpenRepository = React.useCallback(
    (repositoryId: string) => {
      void goProject(project.id, { repositoryId });
    },
    [goProject, project.id],
  );
  const handleAddFiles = React.useCallback(() => {
    setAddRepositoryOpen(true);
  }, []);
  const handleFilesAdded = React.useCallback(
    (repositoryId: string) => {
      void goProject(project.id, { repositoryId, tab: "files" });
    },
    [goProject, project.id],
  );
  const handleWorkspaceRepositoryChange = React.useCallback(
    (repositoryId: string) => {
      setWorkspaceCreateAction(null);
      setWorkspaceDetail(null);
      setWorkspaceRepositoryId(repositoryId);
    },
    [],
  );
  useHealProjectHomeRepositories(project, identityQuery.data?.pubkey);

  const handleOpenCommit = React.useCallback(
    (commitHash: string) => {
      if (!workspaceRepository) return;
      void goProject(project.id, {
        commitHash,
        repositoryId: workspaceRepository.id,
        tab: "commits",
      });
    },
    [goProject, project.id, workspaceRepository],
  );
  const handleExpandWorkspace = React.useCallback(() => {
    if (!workspaceRepository || !workspaceTab) return;
    void goProject(project.id, {
      repositoryId: workspaceRepository.id,
      ...workspaceDetail?.navigation,
      tab: projectHomeWorkspaceSheetExpandTab(workspaceTab),
    });
  }, [
    goProject,
    project.id,
    workspaceDetail?.navigation,
    workspaceRepository,
    workspaceTab,
  ]);

  const workspaceContent =
    workspaceTab && workspaceRepository ? (
      <div
        className="flex min-h-0 flex-1 flex-col"
        data-testid="project-channel-workspace"
      >
        <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4">
          <div className="flex min-w-0 items-center gap-2">
            {workspaceDetail ? (
              <Button
                aria-label={workspaceDetail.backLabel}
                className="h-7 w-7 shrink-0"
                onClick={workspaceDetail.onBack}
                size="icon"
                title={workspaceDetail.backLabel}
                type="button"
                variant="ghost"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <span className="truncate text-sm font-medium">
              {projectHomeWorkspaceSheetTitle(workspaceTab)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {workspaceCreateAction ? (
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={workspaceCreateAction.label}
                    className="h-7 w-7"
                    data-testid="project-home-workspace-sheet-create"
                    disabled={workspaceCreateAction.disabled}
                    onClick={workspaceCreateAction.onClick}
                    size="icon"
                    title={
                      workspaceCreateAction.title ?? workspaceCreateAction.label
                    }
                    type="button"
                    variant="ghost"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{workspaceCreateAction.label}</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  aria-label={`Open ${projectHomeWorkspaceSheetTitle(workspaceTab)} in repository`}
                  className="h-7 w-7"
                  data-testid="project-home-workspace-sheet-expand"
                  onClick={handleExpandWorkspace}
                  size="icon"
                  title={`Open ${projectHomeWorkspaceSheetTitle(workspaceTab)} in repository`}
                  type="button"
                  variant="ghost"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in repository</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <ProjectHomeWorkspaceSheet
            key={`${workspaceTab}:${workspaceRepository.id}`}
            identityPubkey={identityQuery.data?.pubkey}
            onCreateActionChange={setWorkspaceCreateAction}
            onDetailChange={setWorkspaceDetail}
            onOpenCommit={handleOpenCommit}
            onRepositoryAdded={handleFilesAdded}
            onSelectRepository={handleWorkspaceRepositoryChange}
            project={project}
            projects={projects}
            repository={workspaceRepository}
            tab={workspaceTab}
          />
        </div>
      </div>
    ) : null;
  const mainContent =
    activeView === "channels" ? (
      <ProjectChannelResourcesView
        channels={channelsQuery.data ?? []}
        identityPubkey={identityQuery.data?.pubkey}
        onOpenChannel={(channelId) => void goChannel(channelId)}
        onOpenRepository={handleOpenRepository}
        onSelectChat={() => selectView("chat")}
        project={project}
        projects={projects}
        relatedChannelIds={channelFeatures.breakoutChannelIds}
        view="channels"
      />
    ) : activeView === "repos" ? (
      <ProjectChannelResourcesView
        channels={channelsQuery.data ?? []}
        identityPubkey={identityQuery.data?.pubkey}
        onOpenChannel={(channelId) => void goChannel(channelId)}
        onOpenRepository={handleOpenRepository}
        onSelectChat={() => selectView("chat")}
        project={project}
        projects={projects}
        view="repos"
      />
    ) : (
      workspaceContent
    );

  return (
    <ProjectSelectionProvider resetKey={`${project.id}:${activeView}`}>
      <div
        className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background"
        data-project-detail-screen
        data-testid="project-channel-home"
      >
        <div className="relative flex min-h-0 min-w-60 flex-1 flex-col overflow-hidden">
          <ProjectDetailChrome
            activeTabCrumb={null}
            activeWorkItemCrumb={null}
            onGoProjectHome={() => undefined}
            onGoRootChannel={() => {
              if (project.projectChannelId) {
                void goChannel(project.projectChannelId);
              }
            }}
            project={project}
          />
          {waitingForChannel ? (
            <ViewLoadingFallback kind="channel" />
          ) : homeChannel ? (
            <div
              className="flex min-h-0 min-w-0 flex-1 flex-col"
              data-testid="project-channel-canvas-layout"
            >
              <div
                className="flex min-h-0 min-w-0 flex-1"
                data-testid="project-channel-chat-pane"
              >
                <React.Suspense
                  fallback={
                    <ChannelScreenLoadingFallback isHuddleTranscript={false} />
                  }
                >
                  <ChannelViewOverrideProvider
                    value={{
                      headerNavigation: (
                        <ProjectChannelTabs
                          activeView={activeView}
                          enabledFeatures={channelFeatures.enabled}
                          onSelect={selectView}
                        />
                      ),
                      hideMainColumnBody: activeView === "canvas",
                      isChannelViewActive: activeView === "chat",
                      mainColumnHeader: (
                        <ProjectCanvasSurface
                          full={activeView === "canvas"}
                          onShowFullCanvas={() => selectView("canvas")}
                          projectNames={[channel.name, project.name]}
                        />
                      ),
                      mainContent,
                      onSelectChannelView: () => selectView("chat"),
                    }}
                  >
                    <ChannelScreenView
                      activeChannel={homeChannel}
                      autoSendDraftKey={
                        autoSendDraftKey === undefined
                          ? (search.autoSend ?? null)
                          : autoSendDraftKey
                      }
                      currentIdentity={identityQuery.data}
                      currentProfile={profileQuery.data}
                      onAddFiles={
                        channelFeatures.enabled.repositories
                          ? handleAddFiles
                          : undefined
                      }
                      onCloseForumPost={ignoreForumPost}
                      onSelectForumPost={ignoreForumPostSelect}
                      selectedForumPostId={null}
                      targetForumReplyId={null}
                      targetMessageEvents={targetMessageEvents}
                      targetMessageId={
                        targetMessageId === undefined
                          ? (search.messageId ?? null)
                          : targetMessageId
                      }
                    />
                  </ChannelViewOverrideProvider>
                </React.Suspense>
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-8">
              <p className="text-sm text-muted-foreground">
                This project's channel could not be found.
              </p>
            </div>
          )}
        </div>
        <ProjectRepositoryManagement
          createOpen={addRepositoryOpen}
          hideTriggers
          identityPubkey={identityQuery.data?.pubkey}
          onChange={handleFilesAdded}
          onCreateOpenChange={setAddRepositoryOpen}
          project={project}
          projects={projects}
        />
      </div>
    </ProjectSelectionProvider>
  );
}
