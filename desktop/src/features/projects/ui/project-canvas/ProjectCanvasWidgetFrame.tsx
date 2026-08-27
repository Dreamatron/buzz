import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import type { ProjectCanvasPoint } from "./projectCanvasLayout";

const INTERACTIVE_WIDGET_SELECTOR = [
  "a",
  "audio[controls]",
  "button",
  "iframe",
  "input",
  "label",
  "select",
  "summary",
  "textarea",
  "video[controls]",
  "[contenteditable='true']",
  "[data-project-canvas-no-drag]",
  "[role='button']",
  "[role='link']",
].join(",");

function canStartWidgetDrag(event: React.PointerEvent<HTMLElement>) {
  if (!(event.target instanceof Element)) return false;
  return !event.target.closest(INTERACTIVE_WIDGET_SELECTOR);
}

export function ProjectCanvasWidgetFrame({
  active,
  children,
  hideHeader = false,
  icon: Icon,
  id,
  onDragStart,
  onNudge,
  position,
  size,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  hideHeader?: boolean;
  icon: LucideIcon;
  id: string;
  onDragStart: (event: React.PointerEvent<HTMLElement>, id: string) => void;
  onNudge: (id: string, delta: ProjectCanvasPoint) => void;
  position: ProjectCanvasPoint;
  size: { height: number; width: number };
  title: string;
}) {
  return (
    <article
      aria-describedby={`project-canvas-widget-${id}-move-instructions`}
      aria-label={`${title} widget`}
      aria-roledescription="movable widget"
      className="pointer-events-auto absolute flex cursor-grab overflow-hidden rounded-lg border border-border/75 bg-card shadow-lg outline-hidden focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      data-testid={`project-canvas-widget-${id}`}
      data-world-x={position.x}
      data-world-y={position.y}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        const delta = event.shiftKey ? 48 : 24;
        if (event.key === "ArrowLeft") onNudge(id, { x: -delta, y: 0 });
        else if (event.key === "ArrowRight") onNudge(id, { x: delta, y: 0 });
        else if (event.key === "ArrowUp") onNudge(id, { x: 0, y: -delta });
        else if (event.key === "ArrowDown") onNudge(id, { x: 0, y: delta });
        else return;
        event.preventDefault();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (canStartWidgetDrag(event)) onDragStart(event, id);
      }}
      style={{
        height: size.height,
        left: position.x,
        top: position.y,
        width: size.width,
        zIndex: active ? 20 : 10,
      }}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the focused widget surface supports Arrow-key movement without a visible drag handle.
      tabIndex={0}
    >
      <span
        className="sr-only"
        id={`project-canvas-widget-${id}-move-instructions`}
      >
        Use the arrow keys to move this widget. Hold Shift for larger steps.
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        {!hideHeader ? (
          <div
            className="flex h-10 shrink-0 items-center gap-2 border-b border-border/60 px-3"
            data-testid={`project-canvas-widget-${id}-header`}
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
              {title}
            </h2>
          </div>
        ) : null}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </article>
  );
}
