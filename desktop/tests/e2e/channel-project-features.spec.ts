import { expect, test, type Page } from "@playwright/test";

import { installMockBridge, openCreateChannelDialog } from "../helpers/bridge";

const GENERAL_CHANNEL_ID = "9a1657ac-f7aa-5db0-b632-d8bbeb6dfb50";
const OWNER = "deadbeef".repeat(8);
const COLLABORATOR_OWNER = "cafe".repeat(16);

async function openGeneralChannelSettings(page: Page) {
  await page.getByTestId("channel-general").click();
  await expect(page.getByTestId("chat-title")).toHaveText("general");
  await page.getByTestId("channel-management-trigger").click();
  await expect(page.getByTestId("channel-project-features")).toBeVisible();
}

async function createPocRootChannel(page: Page) {
  const name = "channel-project-poc";
  await openCreateChannelDialog(page);
  await page.getByTestId("create-channel-name").fill(name);
  await page.getByTestId("create-channel-submit").click();
  await expect(page.getByTestId("chat-title")).toHaveText(name);
  const channelId = page.url().match(/\/channels\/([^/?]+)/)?.[1];
  if (!channelId)
    throw new Error("Created channel route did not include an ID.");
  return { channelId, name };
}

async function acceptedProjectEvents(page: Page) {
  return page.evaluate(() => window.__BUZZ_E2E_ACCEPTED_PROJECT_EVENTS__ ?? []);
}

test("first channel feature quietly creates one backing project", async ({
  page,
}) => {
  await installMockBridge(page);
  await page.goto("/");
  const rootChannel = await createPocRootChannel(page);
  await page.getByTestId("channel-management-trigger").click();
  await expect(page.getByTestId("channel-project-features")).toBeVisible();

  await page.getByTestId("channel-feature-tasks-switch").click();
  await expect
    .poll(async () => (await acceptedProjectEvents(page)).length)
    .toBe(2);

  const events = await acceptedProjectEvents(page);
  expect(events.map((event) => event.kind).sort()).toEqual([30617, 30621]);
  for (const event of events) {
    expect(event.tags).toContainEqual(["buzz-channel", rootChannel.channelId]);
  }
  const repository = events.find((event) => event.kind === 30617);
  const project = events.find((event) => event.kind === 30621);
  const repositoryDtag = repository?.tags.find((tag) => tag[0] === "d")?.[1];
  expect(project?.tags).toContainEqual([
    "a",
    `30617:${OWNER}:${repositoryDtag}`,
  ]);

  await page.getByTestId("channel-feature-repositories-switch").click();
  await page.getByTestId("channel-feature-breakouts-switch").click();
  await expect
    .poll(async () => (await acceptedProjectEvents(page)).length)
    .toBe(2);

  await page.getByTestId("auxiliary-panel-close").click();
  await page.getByTestId(`channel-${rootChannel.name}`).click();
  await page.getByTestId("channel-management-trigger").click();
  await expect(page.getByTestId("channel-feature-tasks-switch")).toBeChecked();
  await expect(
    page.getByTestId("channel-feature-repositories-switch"),
  ).toBeChecked();
  await expect(
    page.getByTestId("channel-feature-breakouts-switch"),
  ).toBeChecked();
  await page.getByTestId("auxiliary-panel-close").click();

  await expect(page.getByTestId("project-channel-home")).toBeVisible();
  await expect(page.getByTestId("channel-project-feature-bar")).toHaveCount(0);
  await page.getByTestId("project-home-context-tasks").click();
  const tasksWorkspace = page.getByTestId("project-home-workspace-sheet");
  await expect(tasksWorkspace).toHaveAttribute("data-tab", "issues");
  await expect(
    tasksWorkspace.getByText("No tasks yet", { exact: true }),
  ).toBeVisible();
  await page.getByTestId("project-home-workspace-sheet-create").click();
  await page.getByTestId("create-issue-title").fill("POC task");
  await page.getByTestId("create-issue-submit").click();
  await expect(
    tasksWorkspace.getByTestId("project-issue-detail"),
  ).toContainText("POC task");
  await page
    .getByTestId("focus-thread-drawer")
    .getByTestId("auxiliary-panel-close")
    .click();

  await page.getByTestId("add-project-channel").click();
  await page.getByTestId("create-channel-name").fill("poc-breakout");
  await page.getByTestId("create-channel-submit").click();
  await expect(page.getByTestId("chat-title")).toHaveText("poc-breakout");

  await page.getByTestId(`channel-${rootChannel.name}`).click();
  await expect(page.getByTestId("project-channel-home")).toBeVisible();
  await expect(
    page
      .getByTestId("project-home-context-codebase")
      .getByTestId("add-project-repository"),
  ).toBeVisible();
  await page.setViewportSize({ height: 844, width: 390 });
  await expect(page.getByTestId("project-channel-home")).toBeVisible();
  await page.getByTestId("project-home-context-tasks").click();
  const mobileTasksWorkspace = page.getByTestId("project-home-workspace-sheet");
  await expect(
    mobileTasksWorkspace.getByText("POC task", { exact: true }),
  ).toBeVisible();
});

test("existing channel project data infers features without standalone Projects UI", async ({
  page,
}) => {
  const dtag = "general-root";
  const repositoryAddress = `30617:${COLLABORATOR_OWNER}:${dtag}`;
  const projectAddress = `30621:${COLLABORATOR_OWNER}:${dtag}`;
  await page.addInitScript(
    ({ channelId, owner, repoAddress, projectDtag }) => {
      const createdAt = Math.floor(Date.now() / 1_000) - 30;
      window.__BUZZ_E2E_EXTRA_PROJECT_EVENTS__ = [
        {
          id: "a1".padEnd(64, "0"),
          kind: 30617,
          pubkey: owner,
          created_at: createdAt,
          content: "",
          tags: [
            ["d", projectDtag],
            ["name", "general"],
            ["buzz-channel", channelId],
          ],
        },
        {
          id: "a2".padEnd(64, "0"),
          kind: 30621,
          pubkey: owner,
          created_at: createdAt,
          content: "",
          tags: [
            ["d", projectDtag],
            ["name", "general"],
            ["buzz-channel", channelId],
            ["a", repoAddress],
          ],
        },
        {
          id: "a3".padEnd(64, "0"),
          kind: 1621,
          pubkey: owner,
          created_at: createdAt,
          content: "Seeded task",
          tags: [
            ["a", repoAddress],
            ["subject", "Seeded task"],
            ["t", "issue"],
          ],
        },
      ];
    },
    {
      channelId: GENERAL_CHANNEL_ID,
      owner: COLLABORATOR_OWNER,
      repoAddress: repositoryAddress,
      projectDtag: dtag,
    },
  );
  await installMockBridge(page);
  await page.goto("/");
  await openGeneralChannelSettings(page);

  await expect(page.getByTestId("channel-feature-tasks-switch")).toBeChecked();
  await expect(page.getByText("In use", { exact: true })).toBeVisible();
  await page.getByTestId("channel-feature-repositories-switch").click();
  await expect
    .poll(async () => (await acceptedProjectEvents(page)).length)
    .toBe(0);
  await expect(page.getByTestId("open-projects-view")).toHaveCount(0);
  await expect(page.getByTestId("sidebar-projects-section")).toHaveCount(0);

  await page.getByTestId("auxiliary-panel-close").click();
  await page.getByTestId("channel-random").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Move to section" }).hover();
  const projectDestination = page.getByTestId(
    `move-channel-to-project-${projectAddress}`,
  );
  await expect(projectDestination).toHaveText("general");
  await projectDestination.click();

  const projectSection = page
    .getByTestId("channel-random")
    .locator('xpath=ancestor::*[@data-sidebar="group"][1]');
  await expect(
    projectSection.locator("[data-sidebar-section-title]"),
  ).toHaveText("general");
  await page.getByTestId("channel-general").click();
  await page.getByTestId("channel-management-trigger").click();
  await expect(
    page.getByTestId("channel-feature-breakouts-switch"),
  ).toBeChecked();
  await page.getByTestId("auxiliary-panel-close").click();
  await expect(page.getByTestId("project-channel-home")).toBeVisible();
  await expect(page.getByTestId("channel-project-feature-bar")).toHaveCount(0);
  await page.getByTestId("project-home-context-tasks").click();
  await expect(
    page
      .getByTestId("project-home-workspace-sheet")
      .getByText("Seeded task", { exact: true }),
  ).toBeVisible();

  await page.getByTestId("open-settings").click();
  await page.getByTestId("profile-popover-settings").click();
  await page.getByTestId("settings-nav-experimental").click();
  await expect(page.getByTestId("feature-toggle-projects")).toHaveCount(0);
});
