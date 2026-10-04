import { expect, test } from "@playwright/test";

test("Slice 5 reloads player, inventory, time, and Block Edits from Local World Save", async ({ page }) => {
  await page.goto("/app.html");
  await page.evaluate(() => window.__blockstead?.clearSave());
  await page.reload();

  const edit = { x: 2, y: 12, z: 2 };
  await page.evaluate((pos) => {
    window.__blockstead?.give("dirt", 1);
    window.__blockstead?.selectHotbar(0);
    window.__blockstead?.placeAt(pos);
    window.__blockstead?.give("torch", 2);
    window.__blockstead?.setPlayerPosition({ x: 6.5, y: 13, z: 6.5 });
    window.__blockstead?.setHealth(11);
    window.__blockstead?.setTimeOfDay(0.34);
    window.__blockstead?.save();
  }, edit);

  await page.reload();
  await expect.poll(async () => page.evaluate(() => window.__blockstead?.snapshot().renderedVertices ?? 0)).toBeGreaterThan(1000);
  const snapshot = await page.evaluate((pos) => ({
    state: window.__blockstead?.snapshot(),
    block: window.__blockstead?.blockAt(pos)
  }), edit);

  expect(snapshot.block).toBe("dirt");
  expect(snapshot.state?.player.health).toBe(11);
  expect(snapshot.state?.player.x).toBeCloseTo(6.5);
  expect(snapshot.state?.inventory.counts.torch).toBe(2);
  expect(snapshot.state?.survival.timeOfDay).toBeCloseTo(0.34);
});
