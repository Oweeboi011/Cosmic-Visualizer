import { test, expect } from "@playwright/test";

test("solar system tab shows planet cards and opens a detail modal", async ({ page }) => {
  await page.goto("/planets");
  await expect(page.getByRole("button", { name: /^Mercury/ })).toBeVisible();
  await page.getByRole("button", { name: /^Earth Terrestrial planet/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("canvas")).toBeVisible();
});

test("exoplanets tab shows the real exoplanet table", async ({ page }) => {
  await page.goto("/planets?tab=exoplanets");
  await expect(page.getByRole("table")).toBeVisible();
});

test("gallery tab shows the searchable image gallery", async ({ page }) => {
  await page.goto("/planets?tab=gallery");
  await expect(page.getByPlaceholder(/Search planets/)).toBeVisible();
});
