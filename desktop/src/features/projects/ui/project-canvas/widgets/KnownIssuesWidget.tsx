import { CircleAlert, Clock3, Link2, ShieldAlert } from "lucide-react";

const KNOWN_ISSUES = [
  {
    detail: "PDF exports may omit the final page on invoices with 50+ rows.",
    id: "AC-184",
    label: "Long invoice exports",
    meta: "Fix rolling out",
    pin: "bg-rose-500",
    tone: "border-amber-300/70 bg-amber-100 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/70 dark:text-amber-50",
  },
  {
    detail: "EU workspaces can see a short delay before new teammates appear.",
    id: "AC-179",
    label: "Member list refresh",
    meta: "Monitoring",
    pin: "bg-blue-500",
    tone: "border-sky-300/70 bg-sky-100 text-sky-950 dark:border-sky-700/60 dark:bg-sky-950/70 dark:text-sky-50",
  },
  {
    detail: "Safari may require a second click to resume call audio.",
    id: "AC-171",
    label: "Call audio on Safari",
    meta: "Workaround shared",
    pin: "bg-violet-500",
    tone: "border-violet-300/70 bg-violet-100 text-violet-950 dark:border-violet-700/60 dark:bg-violet-950/70 dark:text-violet-50",
  },
] as const;

export function KnownIssuesWidget() {
  return (
    <section
      aria-label="Known product issues"
      className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/20 p-3"
      data-testid="project-canvas-known-issues"
    >
      <header className="flex items-center justify-between gap-3 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-xs font-semibold">Known issues</h3>
            <p className="text-3xs text-muted-foreground">
              Support noticeboard
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-3xs font-medium text-muted-foreground">
          <Clock3 aria-hidden="true" className="h-3 w-3" />
          Updated 12m ago
        </span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto pr-0.5">
        {KNOWN_ISSUES.map((issue, index) => (
          <article
            className={`relative min-h-28 border p-2.5 pt-3 shadow-sm ${issue.tone} ${
              index === 2 ? "col-span-2" : ""
            }`}
            key={issue.id}
          >
            <span
              aria-hidden="true"
              className={`absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full shadow-xs ${issue.pin}`}
            />
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-semibold leading-4">{issue.label}</h4>
              <span className="shrink-0 text-3xs font-semibold opacity-60">
                {issue.id}
              </span>
            </div>
            <p className="mt-1.5 text-2xs leading-4 opacity-80">
              {issue.detail}
            </p>
            <p className="mt-2 flex items-center gap-1 text-3xs font-semibold opacity-70">
              {index === 0 ? (
                <CircleAlert aria-hidden="true" className="h-3 w-3" />
              ) : (
                <Link2 aria-hidden="true" className="h-3 w-3" />
              )}
              {issue.meta}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
