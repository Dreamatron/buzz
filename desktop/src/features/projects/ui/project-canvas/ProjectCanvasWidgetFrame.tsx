import { GripVertical, type LucideIcon } from "lucide-react";
import type * as React from "react";

import type { ProjectCanvasPoint } from "./projectCanvasLayout";

export function ProjectCanvasWidgetFrame({
  active,
  children,
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
  icon: LucideIcon;
  id: string;
  onDragStart: (
    event: React.PointerEvent<HTMLButtonElement>,
    id: string,
  ) => void;
  onNudge: (id: string, delta: ProjectCanvasPoint) => void;
  position: ProjectCanvasPoint;
  size: { height: number; width: number };
  title: string;
}) {
  return (
    <article
      aria-label={`${title} widget`}
      className="pointer-events-auto absolute flex overflow-hidden rounded-lg border border-border/75 bg-card shadow-lg"
      data-testid={`project-canvas-widget-${id}`}
      data-world-x={position.x}
      data-world-y={position.y}
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        height: size.height,
        left: position.x,
        top: position.y,
        width: size.width,
        zIndex: active ? 20 : 10,
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border/60 px-3">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
            {title}
          </h2>
          <button
            aria-label={`Move ${title} widget`}
            className="flex h-8 w-8 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground outline-hidden transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
            data-testid={`project-canvas-widget-${id}-drag-handle`}
            onKeyDown={(event) => {
              const delta = event.shiftKey ? 48 : 24;
              if (event.key === "ArrowLeft") onNudge(id, { x: -delta, y: 0 });
              else if (event.key === "ArrowRight")
                onNudge(id, { x: delta, y: 0 });
              else if (event.key === "ArrowUp")
                onNudge(id, { x: 0, y: -delta });
              else if (event.key === "ArrowDown")
                onNudge(id, { x: 0, y: delta });
              else return;
              event.preventDefault();
            }}
            onPointerDown={(event) => onDragStart(event, id)}
            title={`Move ${title} widget`}
            type="button"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </article>
  );
}
