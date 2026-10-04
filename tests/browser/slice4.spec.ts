import { expect, test } from "@playwright/test";

test("Slice 4 applies Shadow Pressure, protection, and Respawn", async ({ page }) => {
  await page.goto("/app.html");

  await page.evaluate(() => {
    window.__blockstead?.setPlayerPosition({ x: 0.5, y: 14, z: 0.5 });
    window.__blockstead?.setTimeOfDay(0.7);
    window.__blockstead?.setHealth(20);
    window.__blockstead?.tickSurvival(3);
  });
  const exposed = await page.evaluate(() => window.__blockstead?.snapshot());
  expect(exposed?.survival.night).toBe(true);
  expect(exposed?.survival.protected).toBe(false);
  expect(exposed?.player.health).toBeLessThan(20);

  await page.evaluate(() => {
    window.__blockstead?.give("torch", 1);
    window.__blockstead?.selectHotbar(4);
    window.__blockstead?.placeAt({ x: 1, y: 14, z: 0 });
    window.__blockstead?.setHealth(20);
    window.__blockstead?.tickSurvival(3);
  });
  const protectedState = await page.evaluate(() => window.__blockstead?.snapshot());
  expect(protectedState?.survival.protected).toBe(true);
  expect(protectedState?.player.health).toBe(20);

  await page.evaluate(() => {
    window.__blockstead?.setPlayerPosition({ x: 14.5, y: 14, z: 14.5 });
    window.__blockstead?.setHealth(1);
    window.__blockstead?.tickSurvival(5);
  });
  const respawned = await page.evaluate(() => window.__blockstead?.snapshot());
  expect(respawned?.survival.respawns).toBeGreaterThan(0);
  expect(respawned?.player.health).toBe(20);
});
