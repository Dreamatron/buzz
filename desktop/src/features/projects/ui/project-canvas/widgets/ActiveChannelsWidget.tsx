import { Hash } from "lucide-react";

import { UserAvatar } from "@/shared/ui/UserAvatar";

const ACTIVE_CHANNELS = [
  {
    name: "launch-room",
    status: "Release candidate is clearing final checks",
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
    status: "Desktop and mobile states are aligned",
    people: [
      { activity: 5, name: "Mina Shah" },
      { activity: 3, name: "Owen Bell" },
      { activity: 2, name: "Priya Rao" },
      { activity: 1, name: "Sam Lee" },
    ],
  },
  {
    name: "design-review",
    status: "Canvas interaction pass is in review",
    people: [
      { activity: 4, name: "Priya Rao" },
      { activity: 2, name: "Mina Shah" },
      { activity: 3, name: "Owen Bell" },
    ],
  },
  {
    name: "incident-followup",
    status: "Owners are closing the final action items",
    people: [
      { activity: 4, name: "Owen Bell" },
      { activity: 2, name: "Ari Chen" },
    ],
  },
  {
    name: "docs",
    status: "Migration notes are ready to publish",
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
          className="flex min-h-14 items-center gap-2 border-b border-border/45 px-1.5 last:border-b-0"
          data-testid={`project-canvas-active-channel-${channel.name}`}
          key={channel.name}
        >
          <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{channel.name}</div>
            <div className="truncate text-2xs text-muted-foreground">
              {channel.status}
            </div>
          </div>
          <fieldset
            aria-label={`${channel.people.length} active people in the past 24 hours`}
            className="flex min-w-0 shrink-0 items-end -space-x-1.5 border-0 p-0"
          >
            {channel.people.map((person, index) => (
              <span
                className={ACTIVITY_SIZE_CLASSES[person.activity - 1]}
                data-activity={person.activity}
                data-testid={`project-canvas-active-channel-${channel.name}-person-${index + 1}`}
                key={person.name}
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
