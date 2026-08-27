const HOME_STATUS_UPDATES = [
  "Sally pickup is earlier than usual, oboe practice cancelled today",
  "Electrician coming between 10am and 5pm, but promises to let us know",
] as const;

export function HomeClockWidget() {
  return (
    <section
      aria-label="Home schedule"
      className="relative flex h-full min-h-0 overflow-hidden p-3"
      data-testid="project-canvas-home-clock"
    >
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-cover"
        data-testid="project-canvas-home-clock-background"
        src="/project-canvas/home-schedule-house.webp"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-zinc-950/15 via-zinc-900/20 to-zinc-950/35" />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <ul
          aria-label="Clock Gloopie updates"
          className="ml-auto flex w-[82%] min-w-0 flex-1 flex-col justify-center gap-2"
        >
          {HOME_STATUS_UPDATES.map((update, index) => (
            <li
              className="rounded-lg border border-rose-100 bg-white/90 px-3 py-2 text-xs font-medium leading-4 text-zinc-700 shadow-sm backdrop-blur-sm dark:border-rose-900/50 dark:bg-zinc-900/90 dark:text-zinc-200"
              data-testid={`project-canvas-home-clock-status-${index + 1}`}
              key={update}
            >
              {update}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
