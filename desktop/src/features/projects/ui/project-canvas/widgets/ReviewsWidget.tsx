import { Check, GitPullRequest, MessageSquareText } from "lucide-react";

import { ProjectCanvasStackedAlphaGloopie } from "../ProjectCanvasStackedAlphaGloopie";

const REVIEW_GLOOPIES = {
  Approved: {
    label: "Approval agent",
    src: "/project-canvas/review-approved-gloopie.mp4",
    testId: "project-canvas-review-agent-approved",
  },
  Reviewing: {
    label: "Reviewing agent",
    src: "/project-canvas/review-working-gloopie.mp4",
    testId: "project-canvas-review-agent-working",
  },
} as const;

const REVIEWS = [
  {
    branch: "feat/canvas-navigation",
    id: "1",
    number: 2487,
    status: "Approved",
    title: "Make project canvases easier to navigate",
  },
  {
    branch: "fix/reconnect-presence",
    id: "2",
    number: 2491,
    status: "Reviewing",
    title: "Keep presence stable after reconnects",
  },
] as const;

export function ReviewsWidget() {
  return (
    <section
      aria-label="Reviews you are waiting on"
      className="flex h-full min-h-0 flex-col overflow-hidden px-3 pb-2 pt-1"
      data-testid="project-canvas-reviews"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-300">
            <GitPullRequest aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold">Waiting on review</p>
            <p className="text-2xs text-muted-foreground">
              Two pull requests in flight
            </p>
          </div>
        </div>
        <span className="rounded-md bg-sky-500/10 px-2 py-1 text-2xs font-semibold tabular-nums text-sky-700 dark:text-sky-300">
          2 open
        </span>
      </div>

      <ol className="min-h-0 flex-1 divide-y divide-border/60">
        {REVIEWS.map((review) => {
          const isApproved = review.status === "Approved";
          const gloopie = REVIEW_GLOOPIES[review.status];

          return (
            <li
              className="flex min-h-0 items-center gap-3 py-2"
              data-testid={`project-canvas-review-${review.id}`}
              key={review.id}
            >
              <div className="min-w-0 flex-1">
                <span className="text-2xs font-semibold tabular-nums text-sky-700 dark:text-sky-300">
                  PR #{review.number}
                </span>
                <p className="mt-0.5 truncate text-xs font-semibold">
                  {review.title}
                </p>
                <p className="mt-0.5 truncate font-mono text-3xs text-muted-foreground">
                  {review.branch}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <div
                  className="h-12 w-10 shrink-0"
                  data-testid={gloopie.testId}
                >
                  <ProjectCanvasStackedAlphaGloopie
                    ariaLabel={gloopie.label}
                    sourceTestId={`${gloopie.testId}-source`}
                    src={gloopie.src}
                    testId={`${gloopie.testId}-canvas`}
                  />
                </div>
                <span
                  className={
                    isApproved
                      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "flex shrink-0 items-center gap-1 rounded-md bg-sky-500/10 px-2 py-1 text-2xs font-semibold text-sky-700 dark:text-sky-300"
                  }
                >
                  {isApproved ? (
                    <>
                      <Check aria-hidden="true" className="h-4 w-4" />
                      <span className="sr-only">Approved</span>
                    </>
                  ) : (
                    <>
                      <MessageSquareText
                        aria-hidden="true"
                        className="h-3 w-3"
                      />
                      Reviewing
                    </>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
