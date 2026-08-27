import assert from "node:assert/strict";
import test from "node:test";

import { resolveProjectCanvasDashboard } from "./projectCanvasDashboard.ts";

test("project canvas dashboards are selected from normalized channel names", () => {
  assert.equal(resolveProjectCanvasDashboard(["#my-home"]), "home");
  assert.equal(resolveProjectCanvasDashboard([" MY-DEV-TEAM "]), "dev");
  assert.equal(
    resolveProjectCanvasDashboard(["project", "my-support-channel"]),
    "support",
  );
});

test("unknown project names keep the existing demo dashboard", () => {
  assert.equal(resolveProjectCanvasDashboard(["buzz"]), "default");
});
