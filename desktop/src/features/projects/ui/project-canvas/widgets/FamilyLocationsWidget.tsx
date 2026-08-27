import {
  ArrowDownRight,
  Briefcase,
  Coffee,
  GraduationCap,
  House,
  Library,
  Music2,
  ShoppingBasket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

const FAMILY_LOCATIONS: Array<{
  className: string;
  icon: LucideIcon;
  label: string;
}> = [
  {
    className: "left-5 top-5 bg-emerald-100 text-emerald-950",
    icon: GraduationCap,
    label: "School",
  },
  {
    className: "left-[43%] top-3 bg-amber-100 text-amber-950",
    icon: Coffee,
    label: "Cafe",
  },
  {
    className: "right-5 top-6 bg-sky-100 text-sky-950",
    icon: Library,
    label: "Library",
  },
  {
    className: "bottom-5 right-5 bg-blue-100 text-blue-950",
    icon: Briefcase,
    label: "Work",
  },
  {
    className: "bottom-3 left-[42%] bg-fuchsia-100 text-fuchsia-950",
    icon: ShoppingBasket,
    label: "Shops",
  },
  {
    className: "bottom-6 left-5 bg-rose-100 text-rose-950",
    icon: Music2,
    label: "Oboe",
  },
];

function LocationBubble({
  className,
  icon: Icon,
  label,
}: (typeof FAMILY_LOCATIONS)[number]) {
  return (
    <div
      className={`absolute flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full border border-white/90 shadow-[0_8px_22px_rgba(15,23,42,0.08)] ${className}`}
      data-testid={`project-canvas-family-place-${label.toLowerCase()}`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <span className="mt-1 text-3xs font-semibold">{label}</span>
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
      {FAMILY_LOCATIONS.map((location) => (
        <LocationBubble key={location.label} {...location} />
      ))}

      <div
        className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-violet-200 bg-violet-100/95 text-violet-950 shadow-[0_14px_34px_rgba(139,92,246,0.16)]"
        data-testid="project-canvas-family-place-home"
      >
        <House aria-hidden="true" className="h-6 w-6" />
        <span className="mt-1 text-sm font-semibold">Home</span>
      </div>

      <FamilyMember
        className="left-[12%] top-[24%]"
        name="Sally"
        testId="project-canvas-family-location-sally"
      />
      <FamilyMember
        className="left-[44%] top-[54%]"
        name="You"
        testId="project-canvas-family-location-you"
      />

      <div className="absolute left-[66%] top-[59%] z-20 flex items-center gap-1">
        <FamilyMember
          className="!static"
          name="Dad"
          testId="project-canvas-family-location-dad"
        />
        <ArrowDownRight
          aria-label="Dad is heading toward Work"
          className="h-5 w-5 shrink-0 text-blue-700"
          role="img"
        />
      </div>
    </section>
  );
}
