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

test("pages carry a nonce-based CSP that every script satisfies", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy/i.test(m.text())) violations.push(m.text());
  });
  const response = await page.goto("/");
  const csp = response?.headers()["content-security-policy"] ?? "";
  const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  expect(csp).toContain("'strict-dynamic'");
  const scripts = await page.locator("script").evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).nonce));
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.every((n) => n === nonce)).toBe(true);
  expect(violations).toEqual([]);
});

test("unknown gallery assets return a real 404", async ({ page }) => {
  const response = await page.goto("/galaxies/not-a-real-asset-id");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page has drifted out of orbit.")).toBeVisible();
});

test("gallery results paginate and keep the search", async ({ page }) => {
  await page.goto("/galaxies?q=nebula");
  const pagination = page.getByRole("navigation", { name: "Pagination" });
  await expect(pagination.getByText(/Page 1 of \d+/)).toBeVisible();
  await pagination.getByRole("link", { name: /Next/ }).click();
  await expect(page).toHaveURL(/\/galaxies\?q=nebula&page=2$/);
  await expect(pagination.getByText(/Page 2 of \d+/)).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("sections sit behind a menu button", async ({ page }) => {
    await page.goto("/");
    const sections = page.getByRole("navigation", { name: "Sections" });
    await expect(sections).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    await sections.getByRole("link", { name: "Glossary" }).click();
    await expect(page).toHaveURL(/\/glossary$/);
    await expect(sections).toBeHidden();
  });
});
