import { BadgeCheck, BellRing, Rocket, Sparkles, Zap } from "lucide-react";

const RELEASE_ITEMS = [
  {
    detail: "One-click replies now keep the full customer history in view.",
    icon: Zap,
    label: "Faster inbox",
    tone: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  },
  {
    detail: "Set coverage hours and hand off urgent conversations cleanly.",
    icon: BellRing,
    label: "On-call schedules",
    tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  {
    detail: "A calmer composer with saved views for your busiest queues.",
    icon: Sparkles,
    label: "Workspace polish",
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
] as const;

export function ReleaseNotesWidget() {
  return (
    <section
      aria-label="Latest Acorn release notes"
      className="flex h-full min-h-0 flex-col overflow-y-auto p-3"
      data-testid="project-canvas-release-notes"
    >
      <header className="flex items-start justify-between gap-3 border-b border-border/60 pb-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Rocket aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold">Acorn 2.8</h3>
              <BadgeCheck
                aria-label="Released"
                className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <p className="text-2xs text-muted-foreground">
              Released today · Product update
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-3xs font-semibold text-emerald-700 dark:text-emerald-300">
          Live
        </span>
      </header>

      <ol className="min-h-0 flex-1 divide-y divide-border/45">
        {RELEASE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li className="flex gap-2.5 py-2.5" key={item.label}>
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.tone}`}
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold">{item.label}</h4>
                <p className="mt-0.5 text-2xs leading-4 text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
