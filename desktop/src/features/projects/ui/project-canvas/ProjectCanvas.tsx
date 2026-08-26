import { Bug, ListChecks, LocateFixed, RadioTower } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/cn";
import { ProjectCanvasGloopie } from "./ProjectCanvasGloopie";
import { ProjectCanvasWidgetFrame } from "./ProjectCanvasWidgetFrame";
import {
  PROJECT_CANVAS_HOME_TRANSLATION,
  snapProjectCanvasPoint,
  type ProjectCanvasPoint,
} from "./projectCanvasLayout";
import { ActiveChannelsWidget } from "./widgets/ActiveChannelsWidget";
import { BugReporterWidget } from "./widgets/BugReporterWidget";
import { ChoreBoardWidget } from "./widgets/ChoreBoardWidget";

type ProjectCanvasWidgetId = "active-channels" | "bug-reporter" | "chores";

type WidgetLayout = {
  position: ProjectCanvasPoint;
  size: { height: number; width: number };
};

const INITIAL_WIDGET_LAYOUT: Record<ProjectCanvasWidgetId, WidgetLayout> = {
  "active-channels": {
    position: { x: 0, y: 0 },
    size: { height: 336, width: 336 },
  },
  "bug-reporter": {
    position: { x: 384, y: 24 },
    size: { height: 264, width: 384 },
  },
  chores: {
    position: { x: 792, y: 0 },
    size: { height: 360, width: 360 },
  },
};

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

export function ProjectCanvas() {
  const [translation, setTranslation] = React.useState<ProjectCanvasPoint>(
    PROJECT_CANVAS_HOME_TRANSLATION,
  );
  const [widgetLayout, setWidgetLayout] = React.useState(INITIAL_WIDGET_LAYOUT);
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
    (event: React.PointerEvent<HTMLButtonElement>, id: string) => {
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
        panning ? "cursor-grabbing" : "cursor-grab",
      )}
      data-pan-x={translation.x}
      data-pan-y={translation.y}
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
        <ProjectCanvasWidgetFrame
          active={activeWidgetId === "active-channels"}
          icon={RadioTower}
          id="active-channels"
          onDragStart={startWidgetDrag}
          onNudge={nudgeWidget}
          position={widgetLayout["active-channels"].position}
          size={widgetLayout["active-channels"].size}
          title="Active channels"
        >
          <ActiveChannelsWidget />
        </ProjectCanvasWidgetFrame>
        <ProjectCanvasWidgetFrame
          active={activeWidgetId === "bug-reporter"}
          icon={Bug}
          id="bug-reporter"
          onDragStart={startWidgetDrag}
          onNudge={nudgeWidget}
          position={widgetLayout["bug-reporter"].position}
          size={widgetLayout["bug-reporter"].size}
          title="Bug reporter"
        >
          <BugReporterWidget gloopie={<ProjectCanvasGloopie />} />
        </ProjectCanvasWidgetFrame>
        <ProjectCanvasWidgetFrame
          active={activeWidgetId === "chores"}
          icon={ListChecks}
          id="chores"
          onDragStart={startWidgetDrag}
          onNudge={nudgeWidget}
          position={widgetLayout.chores.position}
          size={widgetLayout.chores.size}
          title="Chore board"
        >
          <ChoreBoardWidget />
        </ProjectCanvasWidgetFrame>
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
