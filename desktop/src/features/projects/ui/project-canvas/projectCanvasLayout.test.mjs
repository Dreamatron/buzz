import assert from "node:assert/strict";
import test from "node:test";

import {
  clampProjectCanvasDrawerRatio,
  PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
  PROJECT_CANVAS_HOME_TRANSLATION,
  projectCanvasDrawerRatioBounds,
  snapProjectCanvasPoint,
} from "./projectCanvasLayout.ts";

test("widget positions snap to the 24px project canvas grid", () => {
  assert.deepEqual(snapProjectCanvasPoint({ x: 38, y: -13 }), {
    x: 48,
    y: -24,
  });
});

test("drawer ratio preserves enough chat while accepting useful canvas space", () => {
  assert.equal(clampProjectCanvasDrawerRatio(0.9, 800), 0.65);
  assert.equal(clampProjectCanvasDrawerRatio(0.01, 800), 0.12);
  assert.equal(
    clampProjectCanvasDrawerRatio(Number.NaN, 800),
    PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
  );
  assert.deepEqual(projectCanvasDrawerRatioBounds(800), {
    maximum: 0.65,
    minimum: 0.12,
  });
});

test("project canvas home is a fixed origin independent of reveal height", () => {
  assert.deepEqual(PROJECT_CANVAS_HOME_TRANSLATION, { x: 24, y: 24 });
});
