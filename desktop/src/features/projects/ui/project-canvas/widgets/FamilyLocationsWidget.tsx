import { ArrowRight, Briefcase, GraduationCap, House } from "lucide-react";

import { UserAvatar } from "@/shared/ui/UserAvatar";

function FamilyMember({
  className,
  name,
  testId,
}: {
  className: string;
  name: string;
  testId: string;
}) {
  return (
    <div
      aria-label={`${name} location`}
      className={`absolute z-20 flex items-center gap-1.5 rounded-full border border-white/90 bg-white/95 py-1 pl-1 pr-2 text-3xs font-semibold text-zinc-700 shadow-md ${className}`}
      data-testid={testId}
      role="img"
    >
      <UserAvatar
        avatarUrl={null}
        className="h-5 w-5"
        displayName={name}
        fallbackDelayMs={0}
        size="xs"
      />
      <span>{name}</span>
    </div>
  );
}

export function FamilyLocationsWidget() {
  return (
    <section
      aria-label="Family locations"
      className="relative h-full min-h-[260px] overflow-hidden bg-[linear-gradient(145deg,#f0fdf4_0%,#eff6ff_50%,#fdf4ff_100%)]"
      data-testid="project-canvas-family-locations"
    >
      <div
        aria-hidden="true"
        className="absolute left-[25%] top-[35%] h-px w-[28%] -rotate-[18deg] bg-emerald-300/70"
      />
      <div
        aria-hidden="true"
        className="absolute left-[54%] top-[53%] h-px w-[27%] -rotate-[18deg] bg-sky-300/80"
      />

      <div className="absolute left-[7%] top-[9%] flex h-24 w-24 flex-col items-center justify-center rounded-full border border-emerald-200 bg-emerald-100/90 text-emerald-900 shadow-[0_10px_28px_rgba(16,185,129,0.14)]">
        <GraduationCap aria-hidden="true" className="h-5 w-5" />
        <span className="mt-1 text-xs font-semibold">School</span>
      </div>

      <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-violet-200 bg-violet-100/90 text-violet-950 shadow-[0_12px_32px_rgba(139,92,246,0.16)]">
        <House aria-hidden="true" className="h-6 w-6" />
        <span className="mt-1 text-sm font-semibold">Home</span>
      </div>

      <div className="absolute bottom-[10%] right-[7%] flex h-24 w-24 flex-col items-center justify-center rounded-full border border-sky-200 bg-sky-100/90 text-sky-950 shadow-[0_10px_28px_rgba(14,165,233,0.14)]">
        <Briefcase aria-hidden="true" className="h-5 w-5" />
        <span className="mt-1 text-xs font-semibold">Work</span>
      </div>

      <FamilyMember
        className="left-[13%] top-[29%]"
        name="Sally"
        testId="project-canvas-family-location-sally"
      />
      <FamilyMember
        className="left-[37%] top-[61%]"
        name="You"
        testId="project-canvas-family-location-you"
      />

      <div className="absolute bottom-[25%] right-[29%] z-20 flex items-center gap-1">
        <FamilyMember
          className="!static"
          name="Dad"
          testId="project-canvas-family-location-dad"
        />
        <ArrowRight
          aria-label="Dad is heading toward Work"
          className="h-5 w-5 text-sky-700"
          role="img"
        />
      </div>
    </section>
  );
}
