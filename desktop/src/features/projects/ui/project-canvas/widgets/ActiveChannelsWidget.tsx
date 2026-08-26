import {
  BookOpenCheck,
  CircleCheckBig,
  GitCommitHorizontal,
  Hash,
  ListChecks,
  MessageCircle,
  MonitorSmartphone,
  Paintbrush,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import { UserAvatar } from "@/shared/ui/UserAvatar";

const ACTIVE_CHANNELS = [
  {
    name: "launch-room",
    updates: [
      { icon: Rocket, label: "RC 4 promoted to staging" },
      { icon: CircleCheckBig, label: "12 launch checks passing" },
      { icon: MessageCircle, label: "Two launch notes need sign-off" },
    ],
    people: [
      { activity: 5, name: "Ari Chen" },
      { activity: 3, name: "Mina Shah" },
      { activity: 4, name: "Owen Bell" },
      { activity: 2, name: "Priya Rao" },
      { activity: 1, name: "Sam Lee" },
    ],
  },
  {
    name: "client-sync",
    updates: [
      { icon: MonitorSmartphone, label: "Desktop/mobile sync approved" },
      { icon: GitCommitHorizontal, label: "Retry patch landed" },
    ],
    people: [
      { activity: 5, name: "Mina Shah" },
      { activity: 3, name: "Owen Bell" },
      { activity: 2, name: "Priya Rao" },
      { activity: 1, name: "Sam Lee" },
    ],
  },
  {
    name: "design-review",
    updates: [
      { icon: Paintbrush, label: "Canvas motion pass ready" },
      { icon: MessageCircle, label: "Three review notes open" },
      { icon: CircleCheckBig, label: "Contrast audit complete" },
    ],
    people: [
      { activity: 4, name: "Priya Rao" },
      { activity: 2, name: "Mina Shah" },
      { activity: 3, name: "Owen Bell" },
    ],
  },
  {
    name: "incident-followup",
    updates: [
      { icon: ShieldCheck, label: "Mitigation is holding" },
      { icon: ListChecks, label: "Two follow-ups remain" },
    ],
    people: [
      { activity: 4, name: "Owen Bell" },
      { activity: 2, name: "Ari Chen" },
    ],
  },
  {
    name: "docs",
    updates: [
      { icon: BookOpenCheck, label: "Migration notes ready to publish" },
    ],
    people: [{ activity: 3, name: "Sam Lee" }],
  },
] as const;

const ACTIVITY_SIZE_CLASSES = [
  "h-5 w-5",
  "h-5.5 w-5.5",
  "h-6 w-6",
  "h-7 w-7",
  "h-8 w-8",
] as const;

export function ActiveChannelsWidget() {
  return (
    <div
      className="flex h-full flex-col overflow-y-auto px-2 py-1"
      data-testid="project-canvas-active-channels"
    >
      {ACTIVE_CHANNELS.map((channel) => (
        <div
          className="flex min-h-12 items-start gap-2 border-b border-border/45 px-1.5 py-1.5 last:border-b-0"
          data-testid={`project-canvas-active-channel-${channel.name}`}
          key={channel.name}
        >
          <Hash
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{channel.name}</div>
            <ul
              aria-label={`${channel.name} updates`}
              className="mt-0.5 space-y-0.5"
            >
              {channel.updates.map((update) => {
                const UpdateIcon = update.icon;
                return (
                  <li
                    className="flex min-w-0 items-center gap-1 text-3xs leading-3 text-muted-foreground"
                    key={update.label}
                  >
                    <UpdateIcon
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0"
                    />
                    <span className="truncate">{update.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <fieldset
            aria-label={`${channel.people.length} active people in the past 24 hours`}
            className="flex min-w-0 shrink-0 self-center -space-x-1.5 border-0 p-0"
          >
            {channel.people.map((person, index) => (
              <span
                aria-label={`${person.name}, activity ${person.activity} of 5`}
                className={ACTIVITY_SIZE_CLASSES[person.activity - 1]}
                data-activity={person.activity}
                data-testid={`project-canvas-active-channel-${channel.name}-person-${index + 1}`}
                key={person.name}
                role="img"
              >
                <UserAvatar
                  avatarUrl={null}
                  className="h-full w-full"
                  displayName={person.name}
                  fallbackDelayMs={0}
                  size="xs"
                />
              </span>
            ))}
          </fieldset>
        </div>
      ))}
    </div>
  );
}
