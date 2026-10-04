import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

test("Slice 6 opens the generated root index through file protocol", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const url = pathToFileURL(path.resolve("index.html")).toString();
  await page.goto(url);
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => window.__blockstead?.snapshot().renderedVertices ?? 0)).toBeGreaterThan(1000);
  expect(errors).toEqual([]);
});
