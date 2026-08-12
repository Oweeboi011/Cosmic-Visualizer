import { test, expect } from "@playwright/test";

test("clicking a glossary term opens its definition modal with a 3D viewer", async ({ page }) => {
  await page.goto("/glossary");
  await page.getByRole("button", { name: /^Galaxy /, exact: false }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("canvas")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("In simple terms")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("History")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Fun facts")).toBeVisible();
});
