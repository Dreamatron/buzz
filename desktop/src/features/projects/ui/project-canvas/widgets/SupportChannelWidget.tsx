import {
  Check,
  Inbox,
  MessageSquareText,
  Send,
  UserRoundCheck,
} from "lucide-react";

const REQUEST_STEPS = [
  { icon: Inbox, label: "Received", state: "complete" },
  { icon: Check, label: "Triaged", state: "complete" },
  { icon: UserRoundCheck, label: "Assigned", state: "current" },
  { icon: Send, label: "Replied", state: "upcoming" },
] as const;

const STEP_ICON_CLASS_NAMES = {
  complete:
    "z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white",
  current:
    "z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background",
  upcoming:
    "z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground",
} as const;

export function SupportChannelWidget() {
  return (
    <section
      aria-label="Support channel activity"
      className="flex h-full min-h-0 flex-col overflow-y-auto p-3"
      data-testid="project-canvas-support-channel"
    >
      <section
        aria-label="Latest support request"
        data-testid="project-canvas-support-latest-request"
      >
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <MessageSquareText aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-2xs font-medium text-muted-foreground">
                Latest request
              </p>
              <time className="shrink-0 text-2xs text-muted-foreground">
                8m ago
              </time>
            </div>
            <h3 className="mt-0.5 truncate text-xs font-semibold">
              Invoice export is missing tax rows
            </h3>
            <p className="mt-0.5 truncate text-2xs text-muted-foreground">
              Casey M. in #help-billing
            </p>
          </div>
        </div>

        <ol
          aria-label="Request progression: received and triaged, now assigned, reply pending"
          className="relative mt-3 grid grid-cols-4 gap-1 before:absolute before:left-[12.5%] before:right-[12.5%] before:top-3 before:h-px before:bg-border before:content-['']"
        >
          {REQUEST_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li
                aria-current={step.state === "current" ? "step" : undefined}
                className="relative flex min-w-0 flex-col items-center gap-1.5"
                key={step.label}
              >
                <span className={STEP_ICON_CLASS_NAMES[step.state]}>
                  <Icon aria-hidden="true" className="h-3 w-3" />
                </span>
                <span
                  className={
                    step.state === "current"
                      ? "max-w-full truncate text-2xs font-semibold"
                      : "max-w-full truncate text-2xs text-muted-foreground"
                  }
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-label="Threads started over the past seven days"
        className="mt-3 min-h-0 flex-1 border-t border-border/60 pt-2.5"
        data-testid="project-canvas-support-thread-chart"
      >
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold">Threads started</h3>
            <p className="text-2xs text-muted-foreground">Past 7 days</p>
          </div>
          <p className="text-sm font-semibold tabular-nums">
            35{" "}
            <span className="text-2xs font-normal text-emerald-600 dark:text-emerald-400">
              +21%
            </span>
          </p>
        </div>

        <div className="mt-2">
          <svg
            aria-label="Threads started per day: Monday 2, Tuesday 4, Wednesday 3, Thursday 6, Friday 5, Saturday 8, Sunday 7"
            className="w-full overflow-visible text-primary"
            role="img"
            viewBox="0 0 300 76"
          >
            <path
              className="stroke-border"
              d="M 0 14 H 300 M 0 38 H 300 M 0 62 H 300"
              fill="none"
              strokeDasharray="2 4"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M 4 59 L 52 43 L 101 51 L 150 27 L 199 35 L 248 11 L 296 19"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              className="fill-background stroke-primary"
              cx="248"
              cy="11"
              r="4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <circle className="fill-primary" cx="296" cy="19" r="3" />
          </svg>
          <div
            aria-hidden="true"
            className="mt-1 flex justify-between text-3xs text-muted-foreground"
          >
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
        </div>
      </section>
    </section>
  );
}
