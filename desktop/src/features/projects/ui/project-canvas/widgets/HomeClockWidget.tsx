import { Clock } from "lucide-react";

import { ProjectCanvasGloopie } from "../ProjectCanvasGloopie";

const HOME_STATUS_UPDATES = [
  "Sally pickup is earlier than usual, oboe practice cancelled today",
  "Electrician coming between 10am and 5pm, but promises to let us know",
] as const;

export function HomeClockWidget() {
  return (
    <section
      aria-label="Home schedule"
      className="relative flex h-full min-h-0 overflow-hidden bg-[linear-gradient(135deg,#fff7ed_0%,#fefce8_48%,#f0fdfa_100%)] p-3"
      data-testid="project-canvas-home-clock"
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 text-amber-950">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-amber-200/80">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-lg font-semibold leading-none">8:42 AM</div>
            <div className="mt-1 text-3xs font-medium text-amber-800/75">
              Tuesday, Aug 27
            </div>
          </div>
        </div>

        <ul
          aria-label="Clock Gloopie updates"
          className="ml-auto mt-3 flex w-[78%] min-w-0 flex-1 flex-col justify-center gap-2"
        >
          {HOME_STATUS_UPDATES.map((update, index) => (
            <li
              className="relative rounded-lg border border-white/90 bg-white/85 px-3 py-2 text-xs font-medium leading-4 text-zinc-700 shadow-sm backdrop-blur-sm before:absolute before:-left-1.5 before:top-3 before:h-3 before:w-3 before:rotate-45 before:border-b before:border-l before:border-white/90 before:bg-white/85"
              data-testid={`project-canvas-home-clock-status-${index + 1}`}
              key={update}
            >
              <span className="relative z-10">{update}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pointer-events-none absolute -bottom-2 -left-1 h-28 w-28">
        <ProjectCanvasGloopie />
      </div>
    </section>
  );
}
