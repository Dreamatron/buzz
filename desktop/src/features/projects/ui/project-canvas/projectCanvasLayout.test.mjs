import assert from "node:assert/strict";
import test from "node:test";

import {
  PROJECT_CANVAS_HOME_TRANSLATION,
  snapProjectCanvasPoint,
} from "./projectCanvasLayout.ts";

test("widget positions snap to the 24px project canvas grid", () => {
  assert.deepEqual(snapProjectCanvasPoint({ x: 38, y: -13 }), {
    x: 48,
    y: -24,
  });
});

test("project canvas home is a fixed origin independent of reveal height", () => {
  assert.deepEqual(PROJECT_CANVAS_HOME_TRANSLATION, { x: 24, y: 24 });
});
