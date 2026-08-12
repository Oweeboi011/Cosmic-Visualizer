import { test, expect } from "@playwright/test";

test("3D galaxy page renders heading and canvas", async ({ page }) => {
  await page.goto("/galaxy-3d");
  await expect(page.getByRole("heading", { level: 1, name: "3D Galaxy" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});

test("3D galaxy page exposes a fallback link list of featured objects", async ({ page }) => {
  await page.goto("/galaxy-3d");
  await expect(page.getByRole("heading", { name: "Browse featured objects" })).toBeVisible();
  // Labels are real NASA-cataloged galaxy titles when the live API succeeds, or a
  // synthetic catalog fallback otherwise — either way at least one button renders.
  await expect(page.getByRole("button").first()).toBeVisible();
});
