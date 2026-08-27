import { expect, test, type Locator, type Page } from "@playwright/test";

import { waitForAnimations } from "../helpers/animations";
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

async function expectPreviewBelowChannelChrome(page: Page) {
  const headerBox = await page.getByTestId("chat-header").boundingBox();
  const previewBox = await page
    .getByTestId("project-canvas-surface")
    .boundingBox();
  const chatBox = await page
    .getByTestId("project-channel-chat-pane")
    .boundingBox();
  if (!headerBox || !previewBox || !chatBox) {
    throw new Error(
      "Project header, canvas preview, or chat pane was not visible.",
    );
  }

  expect(previewBox.y).toBeGreaterThanOrEqual(
    headerBox.y + headerBox.height - 1,
  );
  expect(previewBox.y + previewBox.height).toBeLessThanOrEqual(
    chatBox.y + chatBox.height + 1,
  );
  expect(previewBox.height).toBe(
    (page.viewportSize()?.width ?? 0) >= 768 ? 384 : 336,
  );
  expect(
    chatBox.y + chatBox.height - (previewBox.y + previewBox.height),
  ).toBeGreaterThanOrEqual(160);
}

test("project canvas supports preview, full tab, drag, and fake widget interactions", async ({
  page,
}) => {
  await installMockBridge(page);
  await page.goto("/");

  await page.getByTestId("channel-general").click();
  await expect(page.getByTestId("project-canvas-surface")).toHaveCount(0);
  await expect(page.getByTestId("project-channel-tabs")).toHaveCount(0);
  await expect(page.getByTestId("chat-title-tab")).toHaveCount(0);

  await page.getByTestId("channel-buzz").click();
  await expect(page.getByTestId("project-channel-home")).toBeVisible();
  const surface = page.getByTestId("project-canvas-surface");
  const canvas = page.getByTestId("project-widget-canvas");
  await expect(surface).toHaveAttribute("data-canvas-mode", "preview");
  await expect(canvas).toHaveAttribute("data-project-dashboard", "default");
  await expect(page.getByTestId("project-canvas-preview-fade")).toHaveCount(0);
  await expect(page.getByTestId("project-canvas-show-full")).toBeVisible();
  const channelTabLabels = await page
    .getByTestId("project-channel-tabs")
    .getByRole("tab")
    .allTextContents();
  expect(channelTabLabels[0]).toBe("Chat");
  await expect(page.getByTestId("project-channel-tab-chat")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("project-channel-tab-canvas")).toBeVisible();
  await expect(page.getByTestId("channel-composer-overlay")).toBeVisible();
  await expect(
    page.getByTestId("project-canvas-active-channels"),
  ).toBeVisible();
  await expect(page.getByTestId("project-canvas-bug-reporter")).toBeAttached();
  await expect(page.getByTestId("project-canvas-chore-board")).toBeAttached();
  await expect(
    page.getByTestId("project-canvas-contractor-time-tracking"),
  ).toBeAttached();
  await expect(
    page.getByTestId("project-canvas-support-channel"),
  ).toBeAttached();
  await expect(
    page.locator('[data-testid^="project-canvas-chore-member-"]'),
  ).toHaveCount(3);
  await expect(
    page
      .getByTestId("project-canvas-active-channel-launch-room")
      .getByRole("listitem"),
  ).toHaveCount(3);
  await expect(
    page
      .getByTestId("project-canvas-active-channel-docs")
      .getByRole("listitem"),
  ).toHaveCount(1);
  const bugWidget = page.getByTestId("project-canvas-widget-bug-reporter");
  const gloopieCompanion = page.getByTestId(
    "project-canvas-bug-gloopie-companion",
  );
  const gloopie = page.getByTestId("project-canvas-gloopie");
  await expect(bugWidget.getByTestId("project-canvas-gloopie")).toHaveCount(0);
  await expect(gloopieCompanion).toBeVisible();
  await expect(gloopie.locator('source[type^="video/webm"]')).toHaveCount(1);
  expect(
    await gloopie.evaluate((video) =>
      (video as HTMLVideoElement).canPlayType('video/webm; codecs="vp9"'),
    ),
  ).not.toBe("");
  const bugWidgetBox = await bugWidget.boundingBox();
  const gloopieBox = await gloopieCompanion.boundingBox();
  if (!bugWidgetBox || !gloopieBox) {
    throw new Error("Bug reporter or Gloopie companion was not visible.");
  }
  const bugWidgetRight = bugWidgetBox.x + bugWidgetBox.width;
  expect(gloopieBox.x).toBeLessThan(bugWidgetRight);
  expect(gloopieBox.x + gloopieBox.width).toBeGreaterThan(bugWidgetRight);
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
  await expectPreviewBelowChannelChrome(page);
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(canvas).toHaveAttribute("data-pan-y", "24");

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
    page.getByTestId("project-canvas-active-channel-launch-room"),
    { x: 58, y: 34 },
  );
  await expect(activeWidget).toHaveAttribute("data-world-x", "48");
  await expect(activeWidget).toHaveAttribute("data-world-y", "24");
  await expect(page.locator('[data-testid$="-drag-handle"]')).toHaveCount(0);
  await activeWidget.focus();
  await page.keyboard.press("ArrowRight");
  await expect(activeWidget).toHaveAttribute("data-world-x", "72");
  await page.keyboard.press("Shift+ArrowDown");
  await expect(activeWidget).toHaveAttribute("data-world-y", "72");

  const bugInput = page.getByTestId("project-canvas-bug-input");
  await bugInput.fill("The save button loses focus");
  const previewBox = await surface.boundingBox();
  if (!previewBox) throw new Error("Project canvas preview was not visible.");

  await page.getByTestId("project-canvas-show-full").click();
  await expect(surface).toHaveAttribute("data-canvas-mode", "full");
  await expect(page.getByTestId("project-channel-tab-canvas")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("project-channel-tab-chat")).toHaveAttribute(
    "aria-selected",
    "false",
  );
  await expect(page.getByTestId("project-canvas-show-full")).toHaveCount(0);
  await expect(
    page.getByTestId("project-canvas-preview-boundary"),
  ).toBeVisible();
  await expect(page.getByTestId("channel-main-column-body")).toBeHidden();
  const fullBox = await surface.boundingBox();
  if (!fullBox) throw new Error("Full project canvas was not visible.");
  expect(fullBox.height).toBeGreaterThan(previewBox.height + 150);
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(activeWidget).toHaveAttribute("data-world-x", "72");
  await expect(bugInput).toHaveValue("The save button loses focus");

  await page.getByTestId("chat-title-tab").click();
  await expect(surface).toHaveAttribute("data-canvas-mode", "preview");
  await expect(page.getByTestId("project-canvas-preview-boundary")).toHaveCount(
    0,
  );
  await expect(page.getByTestId("project-channel-tab-chat")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("project-canvas-show-full")).toBeVisible();
  await expect(page.getByTestId("channel-main-column-body")).toBeVisible();
  await expectPreviewBelowChannelChrome(page);

  await page.getByTestId("project-channel-tab-repos").click();
  await expect(surface).not.toBeVisible();
  await page.getByTestId("chat-title-tab").click();
  await expect(surface).toBeVisible();
  await expect(surface).toHaveAttribute("data-canvas-mode", "preview");
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(canvas).toHaveAttribute("data-pan-y", "24");
  await expect(activeWidget).toHaveAttribute("data-world-x", "72");
  await expect(activeWidget).toHaveAttribute("data-world-y", "72");
  await expect(bugInput).toHaveValue("The save button loses focus");
  await expectPreviewBelowChannelChrome(page);

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

for (const namedDashboard of [
  { dashboard: "home", projectName: "my-home" },
  { dashboard: "dev", projectName: "my-dev-team" },
  { dashboard: "support", projectName: "my-support-channel" },
] as const) {
  test(`${namedDashboard.projectName} renders its project dashboard`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1728 });
    await installMockBridge(page, {
      starterProjectName: namedDashboard.projectName,
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByTestId(`channel-${namedDashboard.projectName}`).click();
    await expect(page.getByTestId("project-channel-home")).toBeVisible();
    await expect(page.getByTestId("chat-title")).toHaveText(
      namedDashboard.projectName,
    );

    const canvas = page.getByTestId("project-widget-canvas");
    await expect(canvas).toHaveAttribute(
      "data-project-dashboard",
      namedDashboard.dashboard,
    );
    if (namedDashboard.dashboard === "home") {
      const previewBox = await page
        .getByTestId("project-canvas-surface")
        .boundingBox();
      const henryBox = await page
        .getByTestId("project-canvas-chore-gloopie-companion")
        .boundingBox();
      if (!previewBox || !henryBox) {
        throw new Error("Home preview or Henry Gloopie was not visible.");
      }
      expect(henryBox.y).toBeGreaterThanOrEqual(previewBox.y);
      expect(henryBox.y + henryBox.height).toBeLessThanOrEqual(
        previewBox.y + previewBox.height,
      );
    }
    await page.getByTestId("project-canvas-show-full").click();
    await expect(
      page.getByTestId("project-canvas-preview-boundary"),
    ).toBeVisible();
    if (namedDashboard.dashboard === "home") {
      await expect(
        page.getByTestId("project-canvas-chore-gloopie-companion"),
      ).toBeVisible();
      await expect
        .poll(() =>
          page
            .getByTestId("project-canvas-henry-gloopie")
            .evaluate((canvas) => ({
              height: (canvas as HTMLCanvasElement).height,
              width: (canvas as HTMLCanvasElement).width,
            })),
        )
        .toEqual({ height: 400, width: 400 });
    }
    await waitForAnimations(page);
    await page.screenshot({
      path: `test-results/project-canvas-${namedDashboard.projectName}-full.png`,
    });

    if (namedDashboard.dashboard === "home") {
      const choreWidget = page.getByTestId("project-canvas-widget-chores");
      const henryCompanion = page.getByTestId(
        "project-canvas-chore-gloopie-companion",
      );
      const henryCanvas = page.getByTestId("project-canvas-henry-gloopie");
      await expect(
        page.getByTestId("project-canvas-chore-board"),
      ).toBeAttached();
      await expect(
        page.getByTestId("project-canvas-henry-gloopie-source"),
      ).toHaveAttribute("src", "/project-canvas/henry-hoover-gloopie.mp4");
      expect(
        await henryCanvas.evaluate((canvas) => {
          const context = (canvas as HTMLCanvasElement).getContext("2d");
          if (!context) return 0;
          const pixels = context.getImageData(
            0,
            0,
            context.canvas.width,
            context.canvas.height,
          ).data;
          let visiblePixels = 0;
          for (let index = 3; index < pixels.length; index += 4) {
            if (pixels[index] > 0) visiblePixels += 1;
          }
          return visiblePixels;
        }),
      ).toBeGreaterThan(1_000);
      const choreWidgetBox = await choreWidget.boundingBox();
      const henryBox = await henryCompanion.boundingBox();
      if (!choreWidgetBox || !henryBox) {
        throw new Error("Chore Board or Henry Gloopie was not visible.");
      }
      const choreWidgetRight = choreWidgetBox.x + choreWidgetBox.width;
      expect(henryBox.x).toBeLessThan(choreWidgetRight);
      expect(henryBox.x + henryBox.width).toBeGreaterThan(choreWidgetRight);
      expect(choreWidgetRight - henryBox.x).toBeCloseTo(henryBox.width / 2, 0);

      await dragBy(
        page,
        choreWidget.getByRole("heading", { name: "Chore board" }),
        { x: 48, y: 24 },
      );
      const movedChoreWidgetBox = await choreWidget.boundingBox();
      const movedHenryBox = await henryCompanion.boundingBox();
      expect((movedChoreWidgetBox?.x ?? 0) - choreWidgetBox.x).toBeCloseTo(
        48,
        0,
      );
      expect((movedHenryBox?.x ?? 0) - henryBox.x).toBeCloseTo(48, 0);
      expect((movedHenryBox?.y ?? 0) - henryBox.y).toBeCloseTo(24, 0);
      await expect(
        page.getByTestId("project-canvas-home-clock"),
      ).toBeAttached();
      await expect(
        page.getByText(
          "Sally pickup is earlier than usual, oboe practice cancelled today",
          { exact: true },
        ),
      ).toBeAttached();
      const camera = page.getByTestId("project-canvas-front-yard-camera-image");
      await expect(camera).toBeAttached();
      await expect(
        page.getByText("📦 Small delivery arrived at 10:35am", {
          exact: true,
        }),
      ).toBeAttached();
      await expect
        .poll(() =>
          camera.evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      await expect(
        page.getByTestId("project-canvas-family-locations"),
      ).toBeAttached();
      await expect(
        page.getByTestId("project-canvas-active-channels"),
      ).toHaveCount(0);
    } else if (namedDashboard.dashboard === "dev") {
      await expect(
        page.getByTestId("project-canvas-active-channels"),
      ).toBeAttached();
      await expect(page.getByTestId("project-canvas-reviews")).toBeAttached();
      await expect(page.getByText("Reviewing", { exact: true })).toBeAttached();
      await expect(
        page.getByTestId("project-canvas-reviews").locator("video"),
      ).toHaveCount(2);
      await expect(
        page.getByTestId("project-canvas-contractor-time-tracking"),
      ).toBeAttached();
      await expect(page.getByTestId("project-canvas-chore-board")).toHaveCount(
        0,
      );
    } else {
      await expect(
        page.getByTestId("project-canvas-release-notes"),
      ).toBeAttached();
      await expect(
        page.getByTestId("project-canvas-known-issues"),
      ).toBeAttached();
      const bugInput = page.getByTestId("project-canvas-support-bug-input");
      await bugInput.fill("Customer export stalls at 90 percent");
      await page.getByTestId("project-canvas-support-bug-submit").click();
      await expect(
        page.getByTestId("project-canvas-support-bug-success"),
      ).toBeVisible();
      await expect(
        page.getByTestId("project-canvas-active-channels"),
      ).toHaveCount(0);
    }
  });
}

test("project canvas preview and full tab fit a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await installMockBridge(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await page.getByTestId("channel-buzz").click();
  await page.keyboard.press("Escape");

  const surface = page.getByTestId("project-canvas-surface");
  const canvas = page.getByTestId("project-widget-canvas");
  await expect(surface).toHaveAttribute("data-canvas-mode", "preview");
  await expect(canvas).toHaveAttribute("data-pan-x", "24");
  await expect(canvas).toHaveAttribute("data-pan-y", "24");
  await expect(
    page.getByTestId("project-canvas-active-channels"),
  ).toBeVisible();
  await expect(page.getByTestId("channel-composer-overlay")).toBeVisible();
  await expect(page.getByTestId("project-canvas-show-full")).toBeVisible();
  await expectPreviewBelowChannelChrome(page);

  await page.getByTestId("project-canvas-show-full").click();
  await expect(surface).toHaveAttribute("data-canvas-mode", "full");
  await expect(page.getByTestId("project-channel-tab-canvas")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("channel-composer-overlay")).toBeHidden();

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

  await page.getByTestId("chat-title-tab").click();
  await expect(surface).toHaveAttribute("data-canvas-mode", "preview");
  await expect(page.getByTestId("channel-composer-overlay")).toBeVisible();
});
