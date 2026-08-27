import { Check, Paperclip, Send, Sparkles } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

export function SupportBugReporterWidget() {
  const [description, setDescription] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <form
      className="flex h-full min-h-0 flex-col p-3"
      data-testid="project-canvas-support-bug-reporter"
      onSubmit={(event) => {
        event.preventDefault();
        if (!description.trim()) return;
        setDescription("");
        setSubmitted(true);
      }}
    >
      <header className="flex items-center gap-2.5 pb-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-xs font-semibold">Report a problem</h3>
          <p className="truncate text-3xs text-muted-foreground">
            Acorn support · usually responds in 4m
          </p>
        </div>
      </header>

      {submitted ? (
        <div
          aria-live="polite"
          className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 text-center"
          data-testid="project-canvas-support-bug-success"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Check aria-hidden="true" className="h-5 w-5" />
          </span>
          <h4 className="mt-2 text-sm font-semibold">Report staged</h4>
          <p className="mt-0.5 text-2xs text-muted-foreground">
            We'll check for matching issues before filing.
          </p>
          <Button
            className="mt-2"
            onClick={() => setSubmitted(false)}
            size="xs"
            type="button"
            variant="ghost"
          >
            Add another
          </Button>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1">
          <Textarea
            aria-label="Describe a support issue"
            className="h-full min-h-0 touch-auto resize-none select-text bg-background/90 pb-10 text-sm shadow-inner"
            data-testid="project-canvas-support-bug-input"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What happened? Include what you expected to see..."
            value={description}
          />
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
            <Button
              aria-label="Attach a file"
              size="icon-xs"
              title="Attach a file"
              type="button"
              variant="ghost"
            >
              <Paperclip aria-hidden="true" />
            </Button>
            <Button
              aria-label="Submit support report"
              className="h-7 px-2.5 text-xs"
              data-testid="project-canvas-support-bug-submit"
              disabled={!description.trim()}
              size="xs"
              title="Submit support report"
              type="submit"
            >
              <Send aria-hidden="true" className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
