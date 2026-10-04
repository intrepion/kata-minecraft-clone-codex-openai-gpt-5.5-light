import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { collectPageErrors } from "./helpers";

test("Slice 6 opens the generated root index through file protocol", async ({ page }) => {
  const errors = collectPageErrors(page);

  const url = pathToFileURL(path.resolve("index.html")).toString();
  await page.goto(url);
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => window.__blockstead?.snapshot().renderedVertices ?? 0)).toBeGreaterThan(1000);
  expect(errors).toEqual([]);
});
