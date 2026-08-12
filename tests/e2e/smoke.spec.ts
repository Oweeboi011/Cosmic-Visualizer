import { test, expect } from "@playwright/test";

const SECTIONS = [
  { href: "/galaxy-3d", heading: "3D Galaxy" },
  { href: "/galaxies", heading: "Galaxies" },
  { href: "/planets", heading: "Planets & Exoplanets" },
  { href: "/stars", heading: "Stars" },
  { href: "/findings", heading: "New Findings" },
  { href: "/alerts", heading: "Cosmic Alerts" },
  { href: "/research", heading: "Cosmic Research" },
  { href: "/glossary", heading: "Cosmic Definitions" },
  { href: "/explorations", heading: "Explorations" },
];

test("home page renders nav and hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Cosmic Visualizer" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

for (const { href, heading } of SECTIONS) {
  test(`${href} resolves and renders its heading`, async ({ page }) => {
    const response = await page.goto(href);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}
