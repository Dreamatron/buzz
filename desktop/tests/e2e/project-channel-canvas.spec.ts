import { expect, test, type Locator, type Page } from "@playwright/test";

import { waitForAnimations } from "../helpers/animations";
import { installMockBridge } from "../helpers/bridge";

const ACTIVE_CHANNEL_MEMBER_PROFILES = [
  {
    avatarUrl:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%232563eb"/%3E%3Ccircle cx="20" cy="15" r="7" fill="white"/%3E%3Cpath d="M7 40a13 13 0 0126 0" fill="white"/%3E%3C/svg%3E',
    displayName: "ThomPeteMain",
    pubkey: "29ddeb07aec92535a5b38b7ea1d731bc641fd97ffcf59080ab9a2584d3cbe5c6",
  },
  {
    avatarUrl:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23059669"/%3E%3Ccircle cx="20" cy="15" r="7" fill="white"/%3E%3Cpath d="M7 40a13 13 0 0126 0" fill="white"/%3E%3C/svg%3E',
    displayName: "Luis Padron",
    pubkey: "b7fab6a57b4a9e504b8b6a404353f557dc0dec86ef112ef6b3cae0ea9f683561",
  },
  {
    avatarUrl:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23d97706"/%3E%3Ccircle cx="20" cy="15" r="7" fill="white"/%3E%3Cpath d="M7 40a13 13 0 0126 0" fill="white"/%3E%3C/svg%3E',
    displayName: "tho",
    pubkey: "80c5f18be5aafa62cf6198c6335963ba3306b595288117c8ea2f805fc9bdc94a",
  },
  {
    avatarUrl:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23db2777"/%3E%3Ccircle cx="20" cy="15" r="7" fill="white"/%3E%3Cpath d="M7 40a13 13 0 0126 0" fill="white"/%3E%3C/svg%3E',
    displayName: "John Tennant",
    pubkey: "67252b09c31a995daa63aada26569fbc6a3d12f573113f001ce7432f870da820",
  },
  {
    avatarUrl:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%237c3aed"/%3E%3Ccircle cx="20" cy="15" r="7" fill="white"/%3E%3Cpath d="M7 40a13 13 0 0126 0" fill="white"/%3E%3C/svg%3E',
    displayName: "Morgan Martin",
    pubkey: "d02a59460cd9333b73730695f0090d54a3bd0fb7840c3e1995a4968eda297047",
  },
] as const;

async function openStarterProject(page: Page) {
  const projectRow = page.getByTestId("sidebar-project-buzz");
  if ((await projectRow.count()) === 0) {
    await page.getByTestId("sidebar-projects-section-label").hover();
    await page.getByTestId("sidebar-projects-create").click();
    await page.getByTestId("project-browser-result-buzz").click();
  }
  await projectRow.click();
}

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
  expect(previewBox.height).toBeCloseTo(
    (page.viewportSize()?.width ?? 0) >= 768 ? 460.8 : 403.2,
    0,
  );
  expect(
    chatBox.y + chatBox.height - (previewBox.y + previewBox.height),
  ).toBeGreaterThanOrEqual(150);
}

test("project canvas supports preview, full tab, drag, and fake widget interactions", async ({
  page,
}) => {
  await installMockBridge(page, {
    searchProfiles: [...ACTIVE_CHANNEL_MEMBER_PROFILES],
  });
  await page.goto("/");

  await page.getByTestId("channel-general").click();
  await expect(page.getByTestId("project-canvas-surface")).toHaveCount(0);
  await expect(page.getByTestId("project-channel-tabs")).toHaveCount(0);
  await expect(page.getByTestId("chat-title-tab")).toHaveCount(0);
  await expect(page.getByTestId("channel-buzz")).toBeVisible();

  await openStarterProject(page);
  await expect(page.getByTestId("channel-buzz")).toHaveCount(0);
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
  for (const profile of ACTIVE_CHANNEL_MEMBER_PROFILES) {
    const member = page.locator(`[data-pubkey="${profile.pubkey}"]`).first();
    const avatar = page
      .getByTestId(`project-canvas-active-member-${profile.pubkey}`)
      .first();
    await expect(member).toHaveAttribute("role", "img");
    await expect(member).toHaveAttribute(
      "aria-label",
      new RegExp(`^${profile.displayName}, activity [1-5] of 5$`),
    );
    await expect(avatar).toHaveAttribute(
      "data-testid",
      `project-canvas-active-member-${profile.pubkey}`,
    );
    await expect(avatar.locator("img")).toHaveAttribute(
      "alt",
      `${profile.displayName} avatar`,
    );
  }
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
      searchProfiles: [...ACTIVE_CHANNEL_MEMBER_PROFILES],
      starterProjectName: namedDashboard.projectName,
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await openStarterProject(page);
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
      await expect(
        page.getByTestId("project-canvas-widget-chores-header"),
      ).toBeVisible();
      for (const widgetId of [
        "home-clock",
        "front-yard-camera",
        "family-locations",
      ]) {
        await expect(
          page.getByTestId(`project-canvas-widget-${widgetId}-header`),
        ).toHaveCount(0);
      }
      const previewBox = await page
        .getByTestId("project-canvas-surface")
        .boundingBox();
      const homeWidgetBoxes = await Promise.all(
        ["home-clock", "family-locations", "front-yard-camera", "chores"].map(
          (widgetId) =>
            page.getByTestId(`project-canvas-widget-${widgetId}`).boundingBox(),
        ),
      );
      const henryBox = await page
        .getByTestId("project-canvas-chore-gloopie-companion")
        .boundingBox();
      const homeScheduleGloopieBox = await page
        .getByTestId("project-canvas-home-schedule-gloopie-companion")
        .boundingBox();
      if (
        !previewBox ||
        !henryBox ||
        !homeScheduleGloopieBox ||
        homeWidgetBoxes.some((box) => box === null)
      ) {
        throw new Error("Home preview composition was not visible.");
      }
      for (const box of homeWidgetBoxes) {
        if (!box) continue;
        expect(box.y).toBeGreaterThanOrEqual(previewBox.y);
        expect(box.y + box.height).toBeLessThanOrEqual(
          previewBox.y + previewBox.height,
        );
        expect(box.x).toBeGreaterThanOrEqual(previewBox.x);
        expect(box.x + box.width).toBeLessThanOrEqual(
          previewBox.x + previewBox.width,
        );
      }
      const choreBox = homeWidgetBoxes[3];
      expect(choreBox?.x).toBeGreaterThan(
        Math.max(...homeWidgetBoxes.slice(0, 3).map((box) => box?.x ?? 0)),
      );
      expect(henryBox.y).toBeGreaterThanOrEqual(previewBox.y);
      expect(henryBox.y + henryBox.height).toBeLessThanOrEqual(
        previewBox.y + previewBox.height,
      );
      for (const gloopieBox of [homeScheduleGloopieBox, henryBox]) {
        expect(gloopieBox.x).toBeGreaterThanOrEqual(previewBox.x);
        expect(gloopieBox.x + gloopieBox.width).toBeLessThanOrEqual(
          previewBox.x + previewBox.width,
        );
      }
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
      const homeClockBackground = page.getByTestId(
        "project-canvas-home-clock-background",
      );
      await expect(homeClockBackground).toHaveAttribute(
        "src",
        "/project-canvas/home-schedule-house.webp",
      );
      await expect
        .poll(() =>
          homeClockBackground.evaluate(
            (image) => (image as HTMLImageElement).naturalWidth,
          ),
        )
        .toBeGreaterThan(0);
      const homeClockWidget = page.getByTestId(
        "project-canvas-widget-home-clock",
      );
      const homeScheduleGloopie = page.getByTestId(
        "project-canvas-home-schedule-gloopie-companion",
      );
      await expect(
        page.getByTestId("project-canvas-home-schedule-gloopie"),
      ).toHaveAttribute("data-berd-avatar-id", "gloopies-1");
      const homeClockBox = await homeClockWidget.boundingBox();
      const homeScheduleGloopieBox = await homeScheduleGloopie.boundingBox();
      if (!homeClockBox || !homeScheduleGloopieBox) {
        throw new Error("Home schedule or its Gloopie was not visible.");
      }
      expect(homeScheduleGloopieBox.x).toBeLessThan(homeClockBox.x);
      expect(
        homeScheduleGloopieBox.x + homeScheduleGloopieBox.width,
      ).toBeGreaterThan(homeClockBox.x);
      expect(homeClockBox.x - homeScheduleGloopieBox.x).toBeCloseTo(
        homeScheduleGloopieBox.width / 2,
        0,
      );
      const homeClockBottom = homeClockBox.y + homeClockBox.height;
      expect(homeScheduleGloopieBox.y).toBeLessThan(homeClockBottom);
      expect(
        homeScheduleGloopieBox.y + homeScheduleGloopieBox.height,
      ).toBeGreaterThan(homeClockBottom);
      expect(homeClockBottom - homeScheduleGloopieBox.y).toBeCloseTo(
        homeScheduleGloopieBox.height / 2,
        0,
      );
      await expect(page.getByText("8:42 AM", { exact: true })).toHaveCount(0);
      await expect(
        page.getByText("Tuesday, Aug 27", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText(
          "Sally pickup is earlier than usual, oboe practice cancelled today",
          { exact: true },
        ),
      ).toBeAttached();
      expect(
        await page
          .getByTestId("project-canvas-home-clock-status-1")
          .evaluate((bubble) => getComputedStyle(bubble, "::before").content),
      ).toBe("none");
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
      const locationCircles = page.locator(
        '[data-testid^="project-canvas-family-place-"]',
      );
      await expect(locationCircles).toHaveCount(7);
      const locationBoxes = await locationCircles.evaluateAll((locations) =>
        locations.map((location) => {
          const box = location.getBoundingClientRect();
          return {
            bottom: box.bottom,
            left: box.left,
            right: box.right,
            top: box.top,
          };
        }),
      );
      for (const [index, box] of locationBoxes.entries()) {
        for (const other of locationBoxes.slice(index + 1)) {
          expect(
            box.left < other.right &&
              box.right > other.left &&
              box.top < other.bottom &&
              box.bottom > other.top,
          ).toBe(false);
        }
      }
      const homeBox = await page
        .getByTestId("project-canvas-family-place-home")
        .boundingBox();
      const workBox = await page
        .getByTestId("project-canvas-family-place-work")
        .boundingBox();
      const dadBox = await page
        .getByTestId("project-canvas-family-location-dad")
        .boundingBox();
      if (!homeBox || !workBox || !dadBox) {
        throw new Error("Home, Work, or Dad location was not visible.");
      }
      const dadCenter = {
        x: dadBox.x + dadBox.width / 2,
        y: dadBox.y + dadBox.height / 2,
      };
      expect(dadCenter.x).toBeGreaterThan(homeBox.x + homeBox.width / 2);
      expect(dadCenter.x).toBeLessThan(workBox.x + workBox.width / 2);
      expect(dadCenter.y).toBeGreaterThan(homeBox.y + homeBox.height / 2);
      expect(dadCenter.y).toBeLessThan(workBox.y + workBox.height / 2);
      await expect(
        page.getByRole("img", { name: "Dad is heading toward Work" }),
      ).toBeVisible();
      await expect(
        page.getByTestId("project-canvas-active-channels"),
      ).toHaveCount(0);
    } else if (namedDashboard.dashboard === "dev") {
      await expect(
        page.getByTestId("project-canvas-active-channels"),
      ).toBeAttached();
      for (const profile of ACTIVE_CHANNEL_MEMBER_PROFILES) {
        await expect(
          page
            .getByTestId(`project-canvas-active-member-${profile.pubkey}`)
            .first()
            .locator("img"),
        ).toBeVisible();
      }
      await expect(page.getByTestId("project-canvas-reviews")).toBeAttached();
      await expect(page.getByText("Reviewing", { exact: true })).toBeAttached();
      const reviewVideos = page
        .getByTestId("project-canvas-reviews")
        .locator("video");
      await expect(reviewVideos).toHaveCount(2);
      expect(
        await reviewVideos.evaluateAll((videos) =>
          videos.map((video) => video.dataset.berdAvatarId),
        ),
      ).toEqual(["gloopies-14", "gloopies-19"]);
      expect(
        await page
          .getByTestId("project-canvas-reviews")
          .locator("source")
          .evaluateAll((sources) =>
            sources.map(
              (source) => new URL((source as HTMLSourceElement).src).pathname,
            ),
          ),
      ).toEqual([
        "/avatars/20260821T192222985Z/hevc/gloopies/gloopies-14.mp4",
        "/avatars/20260821T192222985Z/webm/gloopies/gloopies-14.webm",
        "/avatars/20260821T192222985Z/hevc/gloopies/gloopies-19.mp4",
        "/avatars/20260821T192222985Z/webm/gloopies/gloopies-19.webm",
      ]);
      await expect(
        page.getByTestId("project-canvas-reviews").getByText("Mina"),
      ).toHaveCount(0);
      await expect(
        page.getByTestId("project-canvas-reviews").getByText("Owen"),
      ).toHaveCount(0);
      await expect(
        page.getByTestId("project-canvas-review-agent-approved-video"),
      ).toHaveAttribute("poster", /gloopies-14\.png$/);
      await expect(
        page.getByTestId("project-canvas-review-agent-working-video"),
      ).toHaveAttribute("poster", /gloopies-19\.png$/);
      await expect(
        page.getByTestId("project-canvas-contractor-time-tracking"),
      ).toBeAttached();
      await expect(page.getByTestId("project-canvas-chore-board")).toHaveCount(
        0,
      );
    } else {
      for (const widgetId of [
        "release-notes",
        "known-issues",
        "bug-reporter",
      ]) {
        await expect(
          page.getByTestId(`project-canvas-widget-${widgetId}-header`),
        ).toHaveCount(0);
      }
      await expect(
        page.getByTestId("project-canvas-release-notes"),
      ).toBeAttached();
      await expect(
        page
          .getByTestId("project-canvas-release-notes")
          .getByRole("heading", { name: "Acorn 2.8" }),
      ).toBeVisible();
      await expect(
        page.getByTestId("project-canvas-known-issues"),
      ).toBeAttached();
      await expect(
        page
          .getByTestId("project-canvas-known-issues")
          .getByRole("heading", { name: "Known issues" }),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("project-canvas-support-bug-reporter")
          .getByRole("heading", { name: "Report a problem" }),
      ).toBeVisible();
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
  await openStarterProject(page);
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
