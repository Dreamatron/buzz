import { Clock3 } from "lucide-react";

const CLIENTS = [
  {
    barClassName: "bg-teal-500",
    name: "Northstar Studio",
    project: "Brand refresh",
    share: 41,
    time: "12h 30m",
  },
  {
    barClassName: "bg-amber-500",
    name: "Luma Labs",
    project: "Product launch",
    share: 33,
    time: "10h 15m",
  },
  {
    barClassName: "bg-rose-500",
    name: "Brightline Co.",
    project: "Campaign assets",
    share: 26,
    time: "8h",
  },
] as const;

const CAPACITY_SEGMENTS = [
  {
    className: "bg-teal-500",
    label: "Northstar Studio, 12 hours 30 minutes",
    width: 31.25,
  },
  {
    className: "bg-amber-500",
    label: "Luma Labs, 10 hours 15 minutes",
    width: 25.625,
  },
  { className: "bg-rose-500", label: "Brightline Co., 8 hours", width: 20 },
  {
    className: "bg-muted",
    label: "Unbooked, 9 hours 15 minutes",
    width: 23.125,
  },
] as const;

export function ContractorTimeTrackingWidget() {
  return (
    <section
      aria-label="Contractor time tracking for this week"
      className="flex h-full min-h-0 flex-col overflow-y-auto p-3"
      data-testid="project-canvas-contractor-time-tracking"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-medium text-muted-foreground">
            This week
          </p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums">30h 45m</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-1 text-2xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-emerald-500" />
          <span>
            <span className="font-semibold text-foreground">6h 20m</span> today
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div
          aria-label="30 hours 45 minutes booked out of 40 hours"
          className="flex h-3 w-full overflow-hidden rounded-sm"
          role="img"
        >
          {CAPACITY_SEGMENTS.map((segment) => (
            <span
              aria-hidden="true"
              className={segment.className}
              key={segment.label}
              style={{ width: `${segment.width}%` }}
              title={segment.label}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between gap-3 text-2xs text-muted-foreground">
          <span>77% booked</span>
          <span className="tabular-nums">9h 15m open</span>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1 divide-y divide-border/50">
        {CLIENTS.map((client) => (
          <div className="py-2 first:pt-0 last:pb-0" key={client.name}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-7 w-1 shrink-0 rounded-sm ${client.barClassName}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{client.name}</p>
                <p className="truncate text-2xs text-muted-foreground">
                  {client.project}
                </p>
              </div>
              <p className="shrink-0 text-xs font-semibold tabular-nums">
                {client.time}
              </p>
            </div>
            <div
              aria-label={`${client.name}: ${client.time}, ${client.share}% of tracked time`}
              className="ml-3 mt-1.5 h-1 overflow-hidden rounded-sm bg-muted"
              role="img"
            >
              <div
                className={`h-full ${client.barClassName}`}
                style={{ width: `${client.share}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
