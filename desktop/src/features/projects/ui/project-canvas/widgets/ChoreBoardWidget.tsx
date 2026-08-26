import * as React from "react";

import { Checkbox } from "@/shared/ui/checkbox";

const CHORE_GROUPS = [
  {
    member: "Maya",
    chores: ["Water the herbs", "Pack the library books"],
  },
  {
    member: "Jon",
    chores: ["Take bins to the curb", "Book the car service"],
  },
  {
    member: "Ellis",
    chores: ["Feed the fish", "Put away clean laundry"],
  },
] as const;

export function ChoreBoardWidget() {
  const [completed, setCompleted] = React.useState<Set<string>>(
    () => new Set(["Maya:Water the herbs"]),
  );

  return (
    <div
      className="h-full overflow-y-auto px-3 py-2"
      data-testid="project-canvas-chore-board"
    >
      {CHORE_GROUPS.map((group) => (
        <section className="mb-2.5 last:mb-0" key={group.member}>
          <h3 className="mb-1 text-xs font-semibold text-muted-foreground">
            {group.member}
          </h3>
          <div className="space-y-0.5">
            {group.chores.map((chore) => {
              const id = `${group.member}:${chore}`;
              const checked = completed.has(id);
              const testId = `${group.member}-${chore}`
                .toLowerCase()
                .replaceAll(" ", "-")
                .replaceAll(":", "-");
              const checkboxId = `project-canvas-chore-${testId}`;
              return (
                <label
                  className="flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-1.5 text-xs transition-colors hover:bg-muted/70"
                  htmlFor={checkboxId}
                  key={id}
                >
                  <Checkbox
                    aria-label={`${chore} for ${group.member}`}
                    checked={checked}
                    data-testid={checkboxId}
                    id={checkboxId}
                    onCheckedChange={(nextChecked) => {
                      setCompleted((current) => {
                        const next = new Set(current);
                        if (nextChecked === true) next.add(id);
                        else next.delete(id);
                        return next;
                      });
                    }}
                  />
                  <span
                    className={
                      checked ? "text-muted-foreground line-through" : undefined
                    }
                  >
                    {chore}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
