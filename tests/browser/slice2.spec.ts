import { expect, test } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("Slice 2 mines and places blocks with visible world edits", async ({ page }) => {
  const errors = collectPageErrors(page);

  await page.goto("/app.html");
  await expect.poll(async () => page.evaluate(() => window.__blockstead?.snapshot().target !== null)).toBe(true);

  const target = await page.evaluate(() => window.__blockstead?.snapshot().target);
  const mined = await page.evaluate(() => window.__blockstead?.mineTarget());
  const afterMine = await page.evaluate(() => window.__blockstead?.snapshot());
  const minedBlock = await page.evaluate((pos) => (pos ? window.__blockstead?.blockAt(pos) : null), target?.block);

  expect(mined).toBe(true);
  expect(minedBlock).toBe("air");
  expect(Object.values(afterMine?.inventory.counts ?? {}).some((count) => count > 0)).toBe(true);

  await page.evaluate(() => {
    window.__blockstead?.give("dirt", 1);
    window.__blockstead?.selectHotbar(0);
  });
  const placed = await page.evaluate((pos) => (pos ? window.__blockstead?.placeAt(pos) : false), target?.face);
  const afterPlace = await page.evaluate(() => window.__blockstead?.snapshot());
  const placedBlock = await page.evaluate((pos) => (pos ? window.__blockstead?.blockAt(pos) : null), target?.face);

  expect(placed).toBe(true);
  expect(placedBlock).toBe("dirt");
  expect(afterPlace?.target).not.toBeNull();
  expect(afterPlace?.renderedVertices).toBeGreaterThan(1000);
  expect(target?.block).toBeTruthy();
  await expect(page.locator("#hotbar")).toContainText("dirt");
  expect(errors).toEqual([]);
});
