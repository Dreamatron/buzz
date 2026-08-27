import {
  Bug,
  Camera,
  Clock3,
  GitPullRequest,
  ListChecks,
  LocateFixed,
  MapPinned,
  MessageSquareText,
  RadioTower,
  ScrollText,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/cn";
import { ProjectCanvasGloopie } from "./ProjectCanvasGloopie";
import { ProjectCanvasHenryGloopie } from "./ProjectCanvasHenryGloopie";
import { ProjectCanvasWidgetFrame } from "./ProjectCanvasWidgetFrame";
import {
  PROJECT_CANVAS_HOME_TRANSLATION,
  snapProjectCanvasPoint,
  type ProjectCanvasPoint,
} from "./projectCanvasLayout";
import {
  resolveProjectCanvasDashboard,
  type ProjectCanvasDashboard,
} from "./projectCanvasDashboard";
import { ActiveChannelsWidget } from "./widgets/ActiveChannelsWidget";
import { BugReporterWidget } from "./widgets/BugReporterWidget";
import { ChoreBoardWidget } from "./widgets/ChoreBoardWidget";
import { ContractorTimeTrackingWidget } from "./widgets/ContractorTimeTrackingWidget";
import { FamilyLocationsWidget } from "./widgets/FamilyLocationsWidget";
import { FrontYardCameraWidget } from "./widgets/FrontYardCameraWidget";
import { HomeClockWidget } from "./widgets/HomeClockWidget";
import { KnownIssuesWidget } from "./widgets/KnownIssuesWidget";
import { ReleaseNotesWidget } from "./widgets/ReleaseNotesWidget";
import { ReviewsWidget } from "./widgets/ReviewsWidget";
import { SupportBugReporterWidget } from "./widgets/SupportBugReporterWidget";
import { SupportChannelWidget } from "./widgets/SupportChannelWidget";

type ProjectCanvasWidgetId = string;

const CHORE_GLOOPIE_SIZE = 176;
const HOME_SCHEDULE_GLOOPIE_SIZE = 144;

type WidgetLayout = {
  position: ProjectCanvasPoint;
  size: { height: number; width: number };
};

type CanvasWidgetDefinition = {
  content: React.ReactNode;
  hideHeader?: boolean;
  icon: LucideIcon;
  id: ProjectCanvasWidgetId;
  title: string;
};

const DASHBOARD_WIDGET_LAYOUTS: Record<
  ProjectCanvasDashboard,
  Record<ProjectCanvasWidgetId, WidgetLayout>
> = {
  default: {
    "active-channels": {
      position: { x: 0, y: 0 },
      size: { height: 336, width: 336 },
    },
    "bug-reporter": {
      position: { x: 384, y: 24 },
      size: { height: 264, width: 384 },
    },
    chores: {
      position: { x: 864, y: 0 },
      size: { height: 360, width: 360 },
    },
    "support-channel": {
      position: { x: 408, y: 336 },
      size: { height: 360, width: 384 },
    },
    "time-tracking": {
      position: { x: 0, y: 384 },
      size: { height: 320, width: 360 },
    },
  },
  dev: {
    "active-channels": {
      position: { x: 0, y: 0 },
      size: { height: 336, width: 336 },
    },
    reviews: {
      position: { x: 384, y: 0 },
      size: { height: 320, width: 456 },
    },
    "time-tracking": {
      position: { x: 888, y: 0 },
      size: { height: 320, width: 360 },
    },
  },
  home: {
    "home-clock": {
      position: { x: 48, y: 0 },
      size: { height: 264, width: 264 },
    },
    "family-locations": {
      position: { x: 336, y: 0 },
      size: { height: 336, width: 384 },
    },
    "front-yard-camera": {
      position: { x: 744, y: 0 },
      size: { height: 264, width: 264 },
    },
    chores: {
      position: { x: 1032, y: 0 },
      size: { height: 336, width: 264 },
    },
  },
  support: {
    "bug-reporter": {
      position: { x: 960, y: 24 },
      size: { height: 280, width: 384 },
    },
    "known-issues": {
      position: { x: 456, y: 0 },
      size: { height: 360, width: 456 },
    },
    "release-notes": {
      position: { x: 0, y: 0 },
      size: { height: 320, width: 408 },
    },
  },
};

function getDashboardWidgets(
  dashboard: ProjectCanvasDashboard,
): CanvasWidgetDefinition[] {
  if (dashboard === "home") {
    return [
      {
        content: <ChoreBoardWidget />,
        icon: ListChecks,
        id: "chores",
        title: "Chore board",
      },
      {
        content: <HomeClockWidget />,
        hideHeader: true,
        icon: Clock3,
        id: "home-clock",
        title: "Today at home",
      },
      {
        content: <FrontYardCameraWidget />,
        hideHeader: true,
        icon: Camera,
        id: "front-yard-camera",
        title: "Front yard",
      },
      {
        content: <FamilyLocationsWidget />,
        hideHeader: true,
        icon: MapPinned,
        id: "family-locations",
        title: "Family locations",
      },
    ];
  }

  if (dashboard === "dev") {
    return [
      {
        content: <ActiveChannelsWidget />,
        icon: RadioTower,
        id: "active-channels",
        title: "Active channels",
      },
      {
        content: <ReviewsWidget />,
        icon: GitPullRequest,
        id: "reviews",
        title: "Reviews",
      },
      {
        content: <ContractorTimeTrackingWidget />,
        icon: Clock3,
        id: "time-tracking",
        title: "Client time",
      },
    ];
  }

  if (dashboard === "support") {
    return [
      {
        content: <ReleaseNotesWidget />,
        hideHeader: true,
        icon: ScrollText,
        id: "release-notes",
        title: "Latest release",
      },
      {
        content: <KnownIssuesWidget />,
        hideHeader: true,
        icon: StickyNote,
        id: "known-issues",
        title: "Known issues",
      },
      {
        content: <SupportBugReporterWidget />,
        hideHeader: true,
        icon: Bug,
        id: "bug-reporter",
        title: "Bug reporter",
      },
    ];
  }

  return [
    {
      content: <ActiveChannelsWidget />,
      icon: RadioTower,
      id: "active-channels",
      title: "Active channels",
    },
    {
      content: <BugReporterWidget />,
      icon: Bug,
      id: "bug-reporter",
      title: "Bug reporter",
    },
    {
      content: <ChoreBoardWidget />,
      icon: ListChecks,
      id: "chores",
      title: "Chore board",
    },
    {
      content: <ContractorTimeTrackingWidget />,
      icon: Clock3,
      id: "time-tracking",
      title: "Client time",
    },
    {
      content: <SupportChannelWidget />,
      icon: MessageSquareText,
      id: "support-channel",
      title: "Support pulse",
    },
  ];
}

type PointerDragOptions = {
  cursor: string;
  onEnd: (delta: ProjectCanvasPoint) => void;
  onMove: (delta: ProjectCanvasPoint) => void;
};

function startPointerDrag(
  event: React.PointerEvent<HTMLElement>,
  { cursor, onEnd, onMove }: PointerDragOptions,
): () => void {
  const node = event.currentTarget;
  const pointerId = event.pointerId;
  const start = { x: event.clientX, y: event.clientY };
  const previousCursor = document.body.style.cursor;
  const previousUserSelect = document.body.style.userSelect;
  let latestDelta = { x: 0, y: 0 };
  let closed = false;

  document.body.style.cursor = cursor;
  document.body.style.userSelect = "none";
  node.setPointerCapture(pointerId);

  const handleMove = (moveEvent: PointerEvent) => {
    if (moveEvent.pointerId !== pointerId) return;
    latestDelta = {
      x: moveEvent.clientX - start.x,
      y: moveEvent.clientY - start.y,
    };
    onMove(latestDelta);
  };

  const cleanup = () => {
    if (closed) return;
    closed = true;
    document.body.style.cursor = previousCursor;
    document.body.style.userSelect = previousUserSelect;
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleEnd);
    window.removeEventListener("pointercancel", handleEnd);
    if (node.hasPointerCapture(pointerId))
      node.releasePointerCapture(pointerId);
  };

  const handleEnd = (endEvent: PointerEvent) => {
    if (endEvent.pointerId !== pointerId) return;
    cleanup();
    onEnd(latestDelta);
  };

  window.addEventListener("pointermove", handleMove);
  window.addEventListener("pointerup", handleEnd);
  window.addEventListener("pointercancel", handleEnd);
  return cleanup;
}

export function ProjectCanvas({
  projectNames,
}: {
  projectNames: readonly string[];
}) {
  const dashboard = resolveProjectCanvasDashboard(projectNames);

  return <ProjectDashboardCanvas dashboard={dashboard} key={dashboard} />;
}

function ProjectDashboardCanvas({
  dashboard,
}: {
  dashboard: ProjectCanvasDashboard;
}) {
  const widgets = getDashboardWidgets(dashboard);
  const initialWidgetLayout = DASHBOARD_WIDGET_LAYOUTS[dashboard];
  const [translation, setTranslation] = React.useState<ProjectCanvasPoint>(
    PROJECT_CANVAS_HOME_TRANSLATION,
  );
  const [widgetLayout, setWidgetLayout] = React.useState(initialWidgetLayout);
  const [activeWidgetId, setActiveWidgetId] =
    React.useState<ProjectCanvasWidgetId | null>(null);
  const [panning, setPanning] = React.useState(false);
  const cleanupPointerDragRef = React.useRef<() => void>(() => {});

  React.useEffect(
    () => () => {
      cleanupPointerDragRef.current();
    },
    [],
  );

  const startCanvasPan = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || event.target !== event.currentTarget) return;
      event.preventDefault();
      cleanupPointerDragRef.current();
      const startTranslation = translation;
      setPanning(true);
      cleanupPointerDragRef.current = startPointerDrag(event, {
        cursor: "grabbing",
        onEnd: (delta) => {
          setTranslation({
            x: startTranslation.x + delta.x,
            y: startTranslation.y + delta.y,
          });
          setPanning(false);
        },
        onMove: (delta) => {
          setTranslation({
            x: startTranslation.x + delta.x,
            y: startTranslation.y + delta.y,
          });
        },
      });
    },
    [translation],
  );

  const startWidgetDrag = React.useCallback(
    (event: React.PointerEvent<HTMLElement>, id: string) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      cleanupPointerDragRef.current();
      const widgetId = id as ProjectCanvasWidgetId;
      const startPosition = widgetLayout[widgetId].position;
      setActiveWidgetId(widgetId);
      cleanupPointerDragRef.current = startPointerDrag(event, {
        cursor: "grabbing",
        onEnd: (delta) => {
          setWidgetLayout((current) => ({
            ...current,
            [widgetId]: {
              ...current[widgetId],
              position: snapProjectCanvasPoint({
                x: startPosition.x + delta.x,
                y: startPosition.y + delta.y,
              }),
            },
          }));
        },
        onMove: (delta) => {
          setWidgetLayout((current) => ({
            ...current,
            [widgetId]: {
              ...current[widgetId],
              position: {
                x: startPosition.x + delta.x,
                y: startPosition.y + delta.y,
              },
            },
          }));
        },
      });
    },
    [widgetLayout],
  );

  const nudgeWidget = React.useCallback(
    (id: string, delta: ProjectCanvasPoint) => {
      const widgetId = id as ProjectCanvasWidgetId;
      setActiveWidgetId(widgetId);
      setWidgetLayout((current) => ({
        ...current,
        [widgetId]: {
          ...current[widgetId],
          position: snapProjectCanvasPoint({
            x: current[widgetId].position.x + delta.x,
            y: current[widgetId].position.y + delta.y,
          }),
        },
      }));
    },
    [],
  );

  const resetHome = React.useCallback(() => {
    setTranslation(PROJECT_CANVAS_HOME_TRANSLATION);
  }, []);

  return (
    <section
      aria-label="Project widget canvas"
      className={cn(
        "relative h-full min-h-0 w-full touch-none select-none overflow-hidden bg-muted/35",
        dashboard === "home" && "bg-rose-50/55 dark:bg-rose-950/15",
        dashboard === "dev" && "bg-zinc-100/65 dark:bg-zinc-950/35",
        dashboard === "support" && "bg-amber-50/50 dark:bg-amber-950/10",
        panning ? "cursor-grabbing" : "cursor-grab",
      )}
      data-pan-x={translation.x}
      data-pan-y={translation.y}
      data-project-dashboard={dashboard}
      data-testid="project-widget-canvas"
      onPointerDown={startCanvasPan}
      style={{
        backgroundImage:
          "radial-gradient(circle, hsl(var(--muted-foreground) / 0.28) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div
        className="pointer-events-none absolute h-0 w-0 will-change-transform"
        data-testid="project-widget-canvas-world"
        style={{
          transform: `translate3d(${translation.x}px, ${translation.y}px, 0)`,
        }}
      >
        {widgets.map((widget) => (
          <ProjectCanvasWidgetFrame
            active={activeWidgetId === widget.id}
            hideHeader={widget.hideHeader}
            icon={widget.icon}
            id={widget.id}
            key={widget.id}
            onDragStart={startWidgetDrag}
            onNudge={nudgeWidget}
            position={widgetLayout[widget.id].position}
            size={widgetLayout[widget.id].size}
            title={widget.title}
          >
            {widget.content}
          </ProjectCanvasWidgetFrame>
        ))}
        {dashboard === "default" || dashboard === "home" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            data-testid="project-canvas-chore-gloopie-companion"
            data-world-x={
              widgetLayout.chores.position.x +
              widgetLayout.chores.size.width -
              CHORE_GLOOPIE_SIZE / 2
            }
            data-world-y={widgetLayout.chores.position.y + 32}
            style={{
              height: CHORE_GLOOPIE_SIZE,
              left:
                widgetLayout.chores.position.x +
                widgetLayout.chores.size.width -
                CHORE_GLOOPIE_SIZE / 2,
              top: widgetLayout.chores.position.y + 32,
              width: CHORE_GLOOPIE_SIZE,
              zIndex: activeWidgetId === "chores" ? 30 : 15,
            }}
          >
            <ProjectCanvasHenryGloopie />
          </div>
        ) : null}
        {dashboard === "home" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            data-testid="project-canvas-home-schedule-gloopie-companion"
            data-world-x={
              widgetLayout["home-clock"].position.x -
              HOME_SCHEDULE_GLOOPIE_SIZE / 2
            }
            data-world-y={
              widgetLayout["home-clock"].position.y +
              widgetLayout["home-clock"].size.height -
              HOME_SCHEDULE_GLOOPIE_SIZE / 2
            }
            style={{
              height: HOME_SCHEDULE_GLOOPIE_SIZE,
              left:
                widgetLayout["home-clock"].position.x -
                HOME_SCHEDULE_GLOOPIE_SIZE / 2,
              top:
                widgetLayout["home-clock"].position.y +
                widgetLayout["home-clock"].size.height -
                HOME_SCHEDULE_GLOOPIE_SIZE / 2,
              width: HOME_SCHEDULE_GLOOPIE_SIZE,
              zIndex: activeWidgetId === "home-clock" ? 30 : 15,
            }}
          >
            <ProjectCanvasGloopie
              ariaLabel="Home schedule helper"
              avatarId={1}
              testId="project-canvas-home-schedule-gloopie"
            />
          </div>
        ) : null}
        {dashboard === "default" || dashboard === "support" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-36 w-28"
            data-testid="project-canvas-bug-gloopie-companion"
            data-world-x={
              widgetLayout["bug-reporter"].position.x +
              widgetLayout["bug-reporter"].size.width -
              36
            }
            data-world-y={widgetLayout["bug-reporter"].position.y + 72}
            style={{
              left:
                widgetLayout["bug-reporter"].position.x +
                widgetLayout["bug-reporter"].size.width -
                36,
              top: widgetLayout["bug-reporter"].position.y + 72,
              zIndex: activeWidgetId === "bug-reporter" ? 30 : 15,
            }}
          >
            <ProjectCanvasGloopie />
          </div>
        ) : null}
      </div>
      <div
        className="absolute right-3 top-3 z-30"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              aria-label="Reset canvas position"
              className="h-8 w-8 border border-border/75 bg-background/90 shadow-sm backdrop-blur-sm"
              data-testid="project-widget-canvas-reset"
              onClick={resetHome}
              size="icon"
              type="button"
              variant="ghost"
            >
              <LocateFixed className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset canvas position</TooltipContent>
        </Tooltip>
      </div>
    </section>
  );
}
