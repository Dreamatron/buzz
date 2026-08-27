import {
  CalendarCheck2,
  Clock3,
  FileText,
  Pause,
  Play,
  Video,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

const PREVIOUS_MEETING = {
  duration: "42 min",
  time: "Yesterday, 3:00 PM",
  title: "Weekly product review",
} as const;

const UPCOMING_MEETINGS = [
  {
    day: "Today",
    duration: "30 min",
    time: "2:30 PM",
    title: "Design crit",
  },
  {
    day: "Tomorrow",
    duration: "45 min",
    time: "10:00 AM",
    title: "Sprint planning",
  },
] as const;

type MeetingDetail = "notes" | "recording";

export function MeetingsWidget() {
  const [detail, setDetail] = React.useState<MeetingDetail>("notes");
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);

  const showDetail = React.useCallback((nextDetail: MeetingDetail) => {
    setDetail(nextDetail);
    setDetailOpen(true);
  }, []);

  return (
    <>
      <section
        aria-label="Team meetings"
        className="flex h-full min-h-0 flex-col overflow-hidden px-3 pb-2 pt-1"
        data-testid="project-canvas-meetings"
      >
        <p className="pb-1 text-3xs font-semibold uppercase text-muted-foreground">
          Previous
        </p>
        <div
          className="flex items-center gap-3 border-b border-border/60 pb-2"
          data-testid="project-canvas-meeting-previous"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <CalendarCheck2 aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">
              {PREVIOUS_MEETING.title}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-2xs text-muted-foreground">
              <Clock3 aria-hidden="true" className="h-3 w-3" />
              <span>
                {PREVIOUS_MEETING.time} · {PREVIOUS_MEETING.duration}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              onClick={() => showDetail("notes")}
              size="xs"
              type="button"
              variant="outline"
            >
              <FileText aria-hidden="true" />
              Notes
            </Button>
            <Button
              onClick={() => showDetail("recording")}
              size="xs"
              type="button"
              variant="outline"
            >
              <Video aria-hidden="true" />
              Recording
            </Button>
          </div>
        </div>

        <p className="pb-0.5 pt-2 text-3xs font-semibold uppercase text-muted-foreground">
          Coming up
        </p>
        <ol
          aria-label="Upcoming meetings"
          className="min-h-0 flex-1 divide-y divide-border/50"
        >
          {UPCOMING_MEETINGS.map((meeting) => (
            <li
              className="flex items-center gap-3 py-1.5"
              data-testid="project-canvas-meeting-upcoming"
              key={meeting.title}
            >
              <div className="w-16 shrink-0">
                <p className="text-3xs font-semibold text-sky-700 dark:text-sky-300">
                  {meeting.day}
                </p>
                <p className="text-2xs font-semibold tabular-nums">
                  {meeting.time}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">
                  {meeting.title}
                </p>
                <p className="text-3xs text-muted-foreground">
                  {meeting.duration}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-sky-500/10 px-2 py-1 text-3xs font-semibold text-sky-700 dark:text-sky-300">
                Scheduled
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Dialog
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setPlaying(false);
        }}
        open={detailOpen}
      >
        <DialogContent className="max-w-lg" data-testid="meeting-detail-dialog">
          <DialogHeader>
            <DialogTitle>
              {detail === "notes"
                ? `${PREVIOUS_MEETING.title} notes`
                : `${PREVIOUS_MEETING.title} recording`}
            </DialogTitle>
            <DialogDescription>
              {PREVIOUS_MEETING.time} · {PREVIOUS_MEETING.duration}
            </DialogDescription>
          </DialogHeader>

          {detail === "notes" ? (
            <div className="space-y-3" data-testid="meeting-notes-detail">
              <p className="text-sm font-medium">Decisions and follow-ups</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Ship the Canvas tab in the next desktop release.</li>
                <li>Keep project widgets local-only for the demo.</li>
                <li>Recheck mobile spacing before the final walkthrough.</li>
              </ul>
            </div>
          ) : null}

          {detail === "recording" ? (
            <div data-testid="meeting-recording-detail">
              <div className="flex aspect-video items-center justify-center rounded-md bg-zinc-950 text-white">
                <Button
                  aria-label={playing ? "Pause recording" : "Play recording"}
                  className="h-11 w-11 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setPlaying((current) => !current)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  {playing ? (
                    <Pause aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Play aria-hidden="true" className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">00:00</span>
                <div className="h-1 flex-1 overflow-hidden rounded-sm bg-muted">
                  <div className="h-full w-[18%] bg-sky-500" />
                </div>
                <span className="tabular-nums">42:18</span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
