import { Maximize2 } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { ProjectCanvas } from "./ProjectCanvas";

export function ProjectCanvasSurface({
  full,
  onShowFullCanvas,
}: {
  full: boolean;
  onShowFullCanvas: () => void;
}) {
  return (
    // The canvas deliberately rejects native file drops before they reach the
    // surrounding message-composer drop target.
    // biome-ignore lint/a11y/noStaticElementInteractions: drag handlers only define an event boundary; they do not expose an interaction.
    <div
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden bg-background",
        full ? "flex-1" : "h-56 shrink-0 border-b border-border md:h-64",
      )}
      data-canvas-mode={full ? "full" : "preview"}
      data-testid="project-canvas-surface"
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
    >
      <div className="min-h-0 flex-1">
        <ProjectCanvas />
      </div>
      {!full ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-b from-transparent via-background/85 to-background"
            data-testid="project-canvas-preview-fade"
          />
          <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center px-4">
            <Button
              className="border-border/80 bg-background/95 shadow-sm backdrop-blur-sm"
              data-testid="project-canvas-show-full"
              onClick={onShowFullCanvas}
              size="sm"
              type="button"
              variant="outline"
            >
              <Maximize2 className="h-4 w-4" />
              Show full canvas
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
