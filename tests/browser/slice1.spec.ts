import { expect, test } from "@playwright/test";

test("Slice 1 boots a rendered Starter Valley with movement and target face", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => window.__blockstead?.snapshot().renderedVertices ?? 0)).toBeGreaterThan(1000);

  const before = await page.evaluate(() => window.__blockstead?.snapshot().player);
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(350);
  await page.keyboard.up("KeyW");
  const after = await page.evaluate(() => window.__blockstead?.snapshot().player);

  expect(after?.z).not.toBe(before?.z);
  await expect.poll(async () => page.evaluate(() => window.__blockstead?.snapshot().target !== null)).toBe(true);

  const screenshot = await page.screenshot();
  expect(screenshot.length).toBeGreaterThan(10_000);
  expect(errors).toEqual([]);
});
