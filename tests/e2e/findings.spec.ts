import { test, expect } from "@playwright/test";

test("findings page shows a source filter and agency badges", async ({ page }) => {
  await page.goto("/findings");
  await expect(page.getByRole("button", { name: "All" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ESA", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "ESO", exact: true })).toBeVisible();
});

test("filtering by ESA shows only ESA articles", async ({ page }) => {
  await page.goto("/findings");
  await page.getByRole("button", { name: "ESA", exact: true }).click();
  await page.waitForURL(/agency=ESA/);
  await expect(page.getByText("ESA", { exact: true }).first()).toBeVisible();
});
