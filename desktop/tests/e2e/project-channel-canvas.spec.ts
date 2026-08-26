import { expect, test, type Locator, type Page } from "@playwright/test";

import { installMockBridge } from "../helpers/bridge";

async function dragBy(
  page: Page,
  locator: Locator,
  delta: { x: number; y: number },
) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Drag target was not visible.");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + delta.x,
    box.y + box.height / 2 + delta.y,
    { steps: 8 },
  );
  await page.mouse.up();
}

async function expectDrawerAboveChat(page: Page) {
  const drawerBox = await page
    .getByTestId("project-canvas-drawer")
    .boundingBox();
  const chatBox = await page
    .getByTestId("project-channel-chat-pane")
    .boundingBox();
  if (!drawerBox || !chatBox) {
    throw new Error("Project drawer or chat pane was not visible.");
  }

  expect(drawerBox.y + drawerBox.height).toBeLessThanOrEqual(chatBox.y + 1);
  expect(chatBox.height).toBeGreaterThanOrEqual(279);
}

test("project canvas supports drawer, pan, drag, and fake widget interactions", async ({
  page,
}) => {
  await installMockBridge(page);
  await page.goto("/");

  await page.getByTestId("channel-general").click();
  await expect(page.getByTestId("project-canvas-drawer")).toHaveCount(0);

  await page.getByTestId("channel-buzz").click();
  await expect(page.getByTestId("project-channel-home")).toBeVisible();
  const drawer = page.getByTestId("project-canvas-drawer");
  const canvas = page.getByTestId("project-widget-canvas");
  await expect(drawer).toHaveAttribute("data-drawer-ratio", "0.333");
  await expect(page.getByTestId("channel-composer-overlay")).toBeVisible();
  await expect(
    page.getByTestId("project-canvas-active-channels"),
  ).toBeVisible();
  await expect(page.getByTestId("project-canvas-bug-reporter")).toBeAttached();
  await expect(page.getByTestId("project-canvas-chore-board")).toBeAttached();
  const gloopie = page.getByTestId("project-canvas-gloopie");
  await expect(gloopie.locator('source[type^="video/webm"]')).toHaveCount(1);
  expect(
    await gloopie.evaluate((video) =>
      (video as HTMLVideoElement).canPlayType('video/webm; codecs="vp9"'),
    ),
  ).not.toBe("");
  await expect(
    page
      .getByTestId("project-canvas-active-channels")
      .locator(':scope > [data-testid^="project-canvas-active-channel-"]'),
  ).toHaveCount(5);
  await expect(
    page.getByTestId("project-canvas-active-channel-launch-room-person-1"),
  ).toHaveAttribute("data-activity", "5");
  await expect(
    page.getByTestId("project-canvas-active-channel-launch-room-person-2"),
  ).toHaveAttribute("data-activity", "3");
  await expectDrawerAboveChat(page);

  await dragBy(page, page.getByTestId("project-canvas-resize-handle"), {
    x: 0,
    y: 220,
  });
  await expect
    .poll(async () => Number(await drawer.getAttribute("data-drawer-ratio")))
    .toBeGreaterThan(0.45);
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(canvas).toHaveAttribute("data-pan-y", "24");
  await expectDrawerAboveChat(page);
  await expect(
    page.getByTestId("project-canvas-resize-handle"),
  ).toHaveAttribute("aria-valuenow", /\d+/);
  await page.setViewportSize({ height: 560, width: 1280 });
  await expectDrawerAboveChat(page);
  await page.setViewportSize({ height: 720, width: 1280 });

  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) throw new Error("Project canvas was not visible.");
  const activeWidget = page.getByTestId(
    "project-canvas-widget-active-channels",
  );
  const activeBeforePan = await activeWidget.boundingBox();
  await page.mouse.move(canvasBox.x + 396, canvasBox.y + 120);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 468, canvasBox.y + 168, { steps: 8 });
  await page.mouse.up();
  await expect(canvas).toHaveAttribute("data-pan-x", "96");
  await expect(canvas).toHaveAttribute("data-pan-y", "72");
  const activeAfterPan = await activeWidget.boundingBox();
  expect(activeAfterPan?.x).toBeCloseTo((activeBeforePan?.x ?? 0) + 72, 0);

  await page.getByTestId("project-widget-canvas-reset").click();
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(canvas).toHaveAttribute("data-pan-y", "24");

  await dragBy(
    page,
    page.getByTestId("project-canvas-widget-active-channels-drag-handle"),
    { x: 58, y: 34 },
  );
  await expect(activeWidget).toHaveAttribute("data-world-x", "48");
  await expect(activeWidget).toHaveAttribute("data-world-y", "24");

  const bugInput = page.getByTestId("project-canvas-bug-input");
  await bugInput.fill("The save button loses focus");
  expect(
    await bugInput.evaluate((input) => ({
      touchAction: getComputedStyle(input).touchAction,
      userSelect: getComputedStyle(input).userSelect,
    })),
  ).toEqual({ touchAction: "auto", userSelect: "text" });
  await page.getByTestId("project-canvas-bug-submit").click();
  await expect(bugInput).toHaveValue("");
  await expect(
    page.getByText("Bug report staged", { exact: true }),
  ).toBeAttached();

  const chore = page.getByTestId(
    "project-canvas-chore-maya-pack-the-library-books",
  );
  await chore.click();
  await expect(chore).toBeChecked();
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(canvas).toHaveAttribute("data-pan-y", "24");
});

test("project canvas preserves its home origin and chat on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await installMockBridge(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await page.getByTestId("channel-buzz").click();
  await page.keyboard.press("Escape");

  const drawer = page.getByTestId("project-canvas-drawer");
  const canvas = page.getByTestId("project-widget-canvas");
  await expect(drawer).toHaveAttribute("data-drawer-ratio", "0.333");
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(canvas).toHaveAttribute("data-pan-y", "24");
  await expect(
    page.getByTestId("project-canvas-active-channels"),
  ).toBeVisible();
  await expect(page.getByTestId("channel-composer-overlay")).toBeVisible();
  await expectDrawerAboveChat(page);

  const resizeHandle = page.getByTestId("project-canvas-resize-handle");
  await resizeHandle.focus();
  await page.keyboard.press("ArrowDown");
  await expect(drawer).not.toHaveAttribute("data-drawer-ratio", "0.333");
  await page.keyboard.press("Home");
  await expect(drawer).toHaveAttribute("data-drawer-ratio", "0.333");

  const canvasBox = await canvas.boundingBox();
  const activeBox = await page
    .getByTestId("project-canvas-widget-active-channels")
    .boundingBox();
  if (!canvasBox || !activeBox) {
    throw new Error("Narrow project canvas was not visible.");
  }
  expect(activeBox.x).toBeGreaterThanOrEqual(canvasBox.x);
  expect(activeBox.x + activeBox.width).toBeLessThanOrEqual(
    canvasBox.x + canvasBox.width,
  );
});
