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

import { useUsersBatchQuery } from "@/features/profile/hooks";
import { UserAvatar } from "@/shared/ui/UserAvatar";

const ACTIVE_CHANNEL_MEMBERS = {
  thom: {
    fallbackName: "ThomPeteMain",
    pubkey: "29ddeb07aec92535a5b38b7ea1d731bc641fd97ffcf59080ab9a2584d3cbe5c6",
  },
  luis: {
    fallbackName: "Luis Padron",
    pubkey: "b7fab6a57b4a9e504b8b6a404353f557dc0dec86ef112ef6b3cae0ea9f683561",
  },
  tho: {
    fallbackName: "tho",
    pubkey: "80c5f18be5aafa62cf6198c6335963ba3306b595288117c8ea2f805fc9bdc94a",
  },
  john: {
    fallbackName: "John Tennant",
    pubkey: "67252b09c31a995daa63aada26569fbc6a3d12f573113f001ce7432f870da820",
  },
  morgan: {
    fallbackName: "Morgan Martin",
    pubkey: "d02a59460cd9333b73730695f0090d54a3bd0fb7840c3e1995a4968eda297047",
  },
} as const;

const ACTIVE_CHANNEL_MEMBER_PUBKEYS = Object.values(ACTIVE_CHANNEL_MEMBERS).map(
  (member) => member.pubkey,
);

const ACTIVE_CHANNELS = [
  {
    name: "launch-room",
    updates: [
      { icon: Rocket, label: "RC 4 promoted to staging" },
      { icon: CircleCheckBig, label: "12 launch checks passing" },
      { icon: MessageCircle, label: "Two launch notes need sign-off" },
    ],
    people: [
      { activity: 5, member: ACTIVE_CHANNEL_MEMBERS.thom },
      { activity: 3, member: ACTIVE_CHANNEL_MEMBERS.luis },
      { activity: 4, member: ACTIVE_CHANNEL_MEMBERS.tho },
      { activity: 2, member: ACTIVE_CHANNEL_MEMBERS.john },
      { activity: 1, member: ACTIVE_CHANNEL_MEMBERS.morgan },
    ],
  },
  {
    name: "client-sync",
    updates: [
      { icon: MonitorSmartphone, label: "Desktop/mobile sync approved" },
      { icon: GitCommitHorizontal, label: "Retry patch landed" },
    ],
    people: [
      { activity: 5, member: ACTIVE_CHANNEL_MEMBERS.luis },
      { activity: 3, member: ACTIVE_CHANNEL_MEMBERS.tho },
      { activity: 2, member: ACTIVE_CHANNEL_MEMBERS.john },
      { activity: 1, member: ACTIVE_CHANNEL_MEMBERS.morgan },
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
      { activity: 4, member: ACTIVE_CHANNEL_MEMBERS.john },
      { activity: 2, member: ACTIVE_CHANNEL_MEMBERS.luis },
      { activity: 3, member: ACTIVE_CHANNEL_MEMBERS.tho },
    ],
  },
  {
    name: "incident-followup",
    updates: [
      { icon: ShieldCheck, label: "Mitigation is holding" },
      { icon: ListChecks, label: "Two follow-ups remain" },
    ],
    people: [
      { activity: 4, member: ACTIVE_CHANNEL_MEMBERS.tho },
      { activity: 2, member: ACTIVE_CHANNEL_MEMBERS.thom },
    ],
  },
  {
    name: "docs",
    updates: [
      { icon: BookOpenCheck, label: "Migration notes ready to publish" },
    ],
    people: [{ activity: 3, member: ACTIVE_CHANNEL_MEMBERS.morgan }],
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
  const profilesQuery = useUsersBatchQuery(ACTIVE_CHANNEL_MEMBER_PUBKEYS);
  const profiles = profilesQuery.data?.profiles;

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
            {channel.people.map((person, index) => {
              const profile = profiles?.[person.member.pubkey];
              const displayName =
                profile?.displayName ?? person.member.fallbackName;

              return (
                <span
                  aria-label={`${displayName}, activity ${person.activity} of 5`}
                  className={ACTIVITY_SIZE_CLASSES[person.activity - 1]}
                  data-activity={person.activity}
                  data-pubkey={person.member.pubkey}
                  data-testid={`project-canvas-active-channel-${channel.name}-person-${index + 1}`}
                  key={person.member.pubkey}
                  role="img"
                >
                  <span aria-hidden="true" className="block h-full w-full">
                    <UserAvatar
                      avatarUrl={profile?.avatarUrl ?? null}
                      className="h-full w-full border border-background"
                      displayName={displayName}
                      fallbackDelayMs={0}
                      size="xs"
                      testId={`project-canvas-active-member-${person.member.pubkey}`}
                    />
                  </span>
                </span>
              );
            })}
          </fieldset>
        </div>
      ))}
    </div>
  );
}
