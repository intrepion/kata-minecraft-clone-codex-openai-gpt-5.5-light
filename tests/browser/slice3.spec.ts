import { expect, test } from "@playwright/test";

test("Slice 3 crafts resource progression recipes and shows unaffordable state", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#recipes")).toContainText("Wood Pickaxe");

  const cannotCraftPick = await page.evaluate(() => window.__blockstead?.canCraft("woodPickaxe"));
  expect(cannotCraftPick).toBe(false);
  await expect(page.locator('.recipe:has-text("Wood Pickaxe")')).toHaveAttribute("data-affordable", "false");

  await page.evaluate(() => {
    window.__blockstead?.give("log", 1);
    window.__blockstead?.craft("planks");
    window.__blockstead?.give("plank", 2);
    window.__blockstead?.craft("sticks");
    window.__blockstead?.give("plank", 4);
    window.__blockstead?.craft("craftingTable");
    window.__blockstead?.give("plank", 3);
    window.__blockstead?.give("stick", 2);
  });

  const craftedPick = await page.evaluate(() => window.__blockstead?.craft("woodPickaxe"));
  const snapshot = await page.evaluate(() => window.__blockstead?.snapshot());

  expect(craftedPick).toBe(true);
  expect(snapshot?.inventory.counts.woodPickaxe).toBe(1);
  expect(snapshot?.inventory.hotbar).toContain("woodPickaxe");

  await page.evaluate(() => {
    window.__blockstead?.give("coal", 1);
    window.__blockstead?.give("stick", 1);
  });
  expect(await page.evaluate(() => window.__blockstead?.craft("torch"))).toBe(true);
  expect(await page.evaluate(() => window.__blockstead?.snapshot().inventory.counts.torch)).toBeGreaterThan(0);
});
