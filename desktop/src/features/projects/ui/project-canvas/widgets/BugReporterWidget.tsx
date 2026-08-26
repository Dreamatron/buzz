import { Check, Send } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

export function BugReporterWidget({ gloopie }: { gloopie: React.ReactNode }) {
  const [description, setDescription] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <form
      className="relative h-full p-3"
      data-testid="project-canvas-bug-reporter"
      onSubmit={(event) => {
        event.preventDefault();
        if (!description.trim()) return;
        setDescription("");
        setSubmitted(true);
      }}
    >
      <Textarea
        aria-label="Describe a bug"
        className="h-full min-h-0 touch-auto resize-none select-text bg-background/80 pb-11 pr-28 text-sm"
        data-testid="project-canvas-bug-input"
        onChange={(event) => {
          setDescription(event.target.value);
          setSubmitted(false);
        }}
        placeholder="Describe a problem to file a bug or find an existing one..."
        value={description}
      />
      <Button
        aria-label="Submit bug report"
        className="absolute bottom-6 left-6 h-8 w-8"
        data-testid="project-canvas-bug-submit"
        disabled={!description.trim()}
        size="icon"
        title="Submit bug report"
        type="submit"
        variant="secondary"
      >
        {submitted ? (
          <Check className="h-4 w-4" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 h-28 w-24"
      >
        {gloopie}
      </div>
      <span aria-live="polite" className="sr-only">
        {submitted ? "Bug report staged" : ""}
      </span>
    </form>
  );
}
