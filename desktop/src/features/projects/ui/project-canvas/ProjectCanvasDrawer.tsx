import { GripHorizontal } from "lucide-react";
import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  clampProjectCanvasDrawerRatio,
  PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
  projectCanvasDrawerRatioBounds,
} from "./projectCanvasLayout";
import { ProjectCanvas } from "./ProjectCanvas";

const DRAWER_KEYBOARD_STEP = 0.05;

export function ProjectCanvasDrawer() {
  // TODO: Replace local geometry with shared project widget state if the POC
  // validates a durable multi-user canvas model.
  const [drawerRatio, setDrawerRatio] = React.useState(
    PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
  );
  const [containerHeight, setContainerHeight] = React.useState(0);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const cleanupResizeRef = React.useRef<() => void>(() => {});
  const ratioBounds = projectCanvasDrawerRatioBounds(containerHeight);

  React.useEffect(
    () => () => {
      cleanupResizeRef.current();
    },
    [],
  );

  React.useEffect(() => {
    const container = drawerRef.current?.parentElement;
    if (!container) return;

    const updateHeight = (height: number) => {
      if (height <= 0) return;
      setContainerHeight(height);
      setDrawerRatio((current) =>
        clampProjectCanvasDrawerRatio(current, height),
      );
    };
    const observer = new ResizeObserver(([entry]) => {
      updateHeight(entry?.contentRect.height ?? 0);
    });
    updateHeight(container.getBoundingClientRect().height);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const resizeBy = React.useCallback((delta: number) => {
    const containerHeight =
      drawerRef.current?.parentElement?.getBoundingClientRect().height ?? 0;
    setDrawerRatio((current) =>
      clampProjectCanvasDrawerRatio(current + delta, containerHeight),
    );
  }, []);

  const resetDrawerRatio = React.useCallback(() => {
    const containerHeight =
      drawerRef.current?.parentElement?.getBoundingClientRect().height ?? 0;
    setDrawerRatio(
      clampProjectCanvasDrawerRatio(
        PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
        containerHeight,
      ),
    );
  }, []);

  const startResize = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      cleanupResizeRef.current();

      const handle = event.currentTarget;
      const pointerId = event.pointerId;
      const startY = event.clientY;
      const startRatio = drawerRatio;
      const containerHeight =
        drawerRef.current?.parentElement?.getBoundingClientRect().height ?? 0;
      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;
      let closed = false;

      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      handle.setPointerCapture(pointerId);

      const handleMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId || containerHeight <= 0) return;
        setDrawerRatio(
          clampProjectCanvasDrawerRatio(
            startRatio + (moveEvent.clientY - startY) / containerHeight,
            containerHeight,
          ),
        );
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleEnd);
        window.removeEventListener("pointercancel", handleEnd);
        if (handle.hasPointerCapture(pointerId))
          handle.releasePointerCapture(pointerId);
      };

      const handleEnd = (endEvent: PointerEvent) => {
        if (endEvent.pointerId !== pointerId) return;
        cleanup();
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleEnd);
      window.addEventListener("pointercancel", handleEnd);
      cleanupResizeRef.current = cleanup;
    },
    [drawerRatio],
  );

  return (
    // The canvas deliberately rejects native file drops before they reach the
    // surrounding message-composer drop target.
    // biome-ignore lint/a11y/noStaticElementInteractions: drag handlers only define an event boundary; they do not expose an interaction.
    <div
      className="flex min-h-24 shrink-0 flex-col overflow-hidden border-b border-border bg-background"
      data-drawer-ratio={drawerRatio.toFixed(3)}
      data-testid="project-canvas-drawer"
      onDragEnter={(event) => event.stopPropagation()}
      onDragLeave={(event) => event.stopPropagation()}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      ref={drawerRef}
      style={{ height: `${drawerRatio * 100}%` }}
    >
      <div className="min-h-0 flex-1">
        <ProjectCanvas />
      </div>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          {/* biome-ignore lint/a11y/useSemanticElements: An adjustable separator must be focusable and render its grip; hr is a void element. */}
          <button
            aria-label="Resize project canvas"
            aria-orientation="horizontal"
            aria-valuemax={Math.round(ratioBounds.maximum * 100)}
            aria-valuemin={Math.round(ratioBounds.minimum * 100)}
            aria-valuenow={Math.round(drawerRatio * 100)}
            aria-valuetext={`${Math.round(drawerRatio * 100)}% canvas height`}
            className="group flex h-4 w-full shrink-0 touch-none cursor-row-resize items-center justify-center border-t border-border/60 bg-background outline-hidden transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            data-testid="project-canvas-resize-handle"
            onDoubleClick={resetDrawerRatio}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") resizeBy(-DRAWER_KEYBOARD_STEP);
              else if (event.key === "ArrowDown")
                resizeBy(DRAWER_KEYBOARD_STEP);
              else if (event.key === "Home") resetDrawerRatio();
              else return;
              event.preventDefault();
            }}
            onPointerDown={startResize}
            role="separator"
            title="Resize project canvas"
            type="button"
          >
            <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Resize project canvas</TooltipContent>
      </Tooltip>
    </div>
  );
}
