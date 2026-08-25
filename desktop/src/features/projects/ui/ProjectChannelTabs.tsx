import type { ChannelProjectFeature } from "@/features/projects/channelProjectFeatures";
import type { ProjectHomeWorkspaceSheetTab } from "@/features/projects/lib/projectHomeWorkspaceSheet";
import { cn } from "@/shared/lib/cn";

export type ProjectChannelView =
  | "chat"
  | ProjectHomeWorkspaceSheetTab
  | "channels"
  | "codebase";

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
    feature: "repositories",
    label: "Reviews",
    testId: "project-channel-tab-reviews",
    value: "prs",
  },
  {
    feature: "repositories",
    label: "Commits",
    testId: "project-channel-tab-commits",
    value: "commits",
  },
  {
    feature: "repositories",
    label: "Files",
    testId: "project-channel-tab-files",
    value: "files",
  },
  {
    feature: "repositories",
    label: "People",
    testId: "project-channel-tab-people",
    value: "contributors",
  },
  {
    feature: "breakouts",
    label: "Channels",
    testId: "project-channel-tab-channels",
    value: "channels",
  },
  {
    feature: "repositories",
    label: "Codebase",
    testId: "project-channel-tab-codebase",
    value: "codebase",
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
