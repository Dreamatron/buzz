import type { ChannelProjectFeature } from "@/features/projects/channelProjectFeatures";
import { cn } from "@/shared/lib/cn";

export type ProjectChannelView = "chat" | "issues" | "channels" | "repos";

export type ProjectChannelRepositoryView =
  | "repos"
  | "prs"
  | "commits"
  | "files";

const PROJECT_CHANNEL_TABS: Array<{
  feature: ChannelProjectFeature;
  label: string;
  testId: string;
  value: Exclude<ProjectChannelView, "chat">;
}> = [
  {
    feature: "tasks",
    label: "Tasks",
    testId: "project-channel-tab-tasks",
    value: "issues",
  },
  {
    feature: "breakouts",
    label: "Channels",
    testId: "project-channel-tab-channels",
    value: "channels",
  },
  {
    feature: "repositories",
    label: "Repos",
    testId: "project-channel-tab-repos",
    value: "repos",
  },
];

const PROJECT_CHANNEL_REPOSITORY_TABS: Array<{
  label: string;
  testId: string;
  value: ProjectChannelRepositoryView;
}> = [
  {
    label: "Repos",
    testId: "project-channel-repos-tab-repos",
    value: "repos",
  },
  {
    label: "Reviews",
    testId: "project-channel-repos-tab-reviews",
    value: "prs",
  },
  {
    label: "Commits",
    testId: "project-channel-repos-tab-commits",
    value: "commits",
  },
  {
    label: "Files",
    testId: "project-channel-repos-tab-files",
    value: "files",
  },
];

export function projectChannelViewEnabled(
  view: ProjectChannelView,
  enabledFeatures: Record<ChannelProjectFeature, boolean>,
) {
  if (view === "chat") return true;
  const tab = PROJECT_CHANNEL_TABS.find(
    (candidate) => candidate.value === view,
  );
  return tab ? enabledFeatures[tab.feature] : false;
}

export function ProjectChannelTabs({
  activeView,
  enabledFeatures,
  onSelect,
}: {
  activeView: ProjectChannelView;
  enabledFeatures: Record<ChannelProjectFeature, boolean>;
  onSelect: (view: ProjectChannelView) => void;
}) {
  return (
    <div
      className="flex h-9 min-w-max items-stretch"
      data-testid="project-channel-tabs"
    >
      {PROJECT_CHANNEL_TABS.map((tab) =>
        enabledFeatures[tab.feature] ? (
          <button
            aria-selected={activeView === tab.value}
            className={cn(
              "relative h-9 shrink-0 px-2 text-xs font-medium text-muted-foreground outline-hidden transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-transparent after:content-[''] hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              activeView === tab.value && "text-foreground after:bg-foreground",
            )}
            data-testid={tab.testId}
            key={tab.value}
            onClick={() => onSelect(tab.value)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ) : null,
      )}
    </div>
  );
}

export function ProjectChannelRepositoryTabs({
  activeView,
  onSelect,
}: {
  activeView: ProjectChannelRepositoryView;
  onSelect: (view: ProjectChannelRepositoryView) => void;
}) {
  return (
    <div
      aria-label="Repository views"
      className="flex h-10 shrink-0 items-stretch overflow-x-auto border-b border-border/60 px-2 scrollbar-none"
      data-testid="project-channel-repos-tabs"
      role="tablist"
    >
      {PROJECT_CHANNEL_REPOSITORY_TABS.map((tab) => (
        <button
          aria-selected={activeView === tab.value}
          className={cn(
            "relative h-10 shrink-0 px-2 text-xs font-medium text-muted-foreground outline-hidden transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-transparent after:content-[''] hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            activeView === tab.value && "text-foreground after:bg-foreground",
          )}
          data-testid={tab.testId}
          key={tab.value}
          onClick={() => onSelect(tab.value)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
