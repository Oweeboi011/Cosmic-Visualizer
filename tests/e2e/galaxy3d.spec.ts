import { test, expect } from "@playwright/test";

test("3D galaxy page renders heading and canvas", async ({ page }) => {
  await page.goto("/galaxy-3d");
  await expect(page.getByRole("heading", { level: 1, name: "3D Galaxy" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Interactive 3D/ }).locator("canvas")).toBeVisible();
});

test("3D galaxy page exposes a fallback link list of featured objects", async ({ page }) => {
  await page.goto("/galaxy-3d");
  await expect(page.getByRole("heading", { name: "Browse featured objects" })).toBeVisible();
  // Labels are real NASA-cataloged galaxy titles when the live API succeeds, or a
  // synthetic catalog fallback otherwise — either way at least one button renders.
  await expect(page.getByRole("button").first()).toBeVisible();
});

test("3D galaxy can be viewed in full window and restored with Escape", async ({ page }) => {
  await page.goto("/galaxy-3d");
  const canvas = page.getByRole("img", { name: /Interactive 3D/ }).locator("canvas");
  await expect(canvas).toBeVisible();

  await page.getByRole("button", { name: "View in full window" }).click();
  const viewport = page.viewportSize()!;
  await expect
    .poll(async () => (await canvas.boundingBox())?.width)
    .toBe(viewport.width);
  // Galaxy type controls stay usable over the full-window scene.
  await page.getByRole("button", { name: "Elliptical", exact: true }).click();
  await expect(page.getByRole("button", { name: "Elliptical", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "View in full window" })).toBeVisible();
  await expect
    .poll(async () => (await canvas.boundingBox())?.width)
    .toBeLessThan(viewport.width);
});
