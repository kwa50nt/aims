import { test, expect } from "@playwright/test";

test("Initial HTML/CSS Tests", async ({ page }, testInfo) => {
  if (!testInfo.project.name.startsWith("frontend")) {
    test.skip();
  }

  await page.goto("/index.html", { waitUntil: "networkidle" });
  await page.waitForSelector(".alumni-row", { timeout: 10000 });

  await page.getByRole("img", { name: "UPSE logo" }).click();
  await page
    .getByRole("heading", { name: "Alumni Information Management" })
    .click();
  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByRole("link", { name: "Email Blast" }).click();
  await page.getByRole("link", { name: "Add Records" }).click();
  await page.getByRole("link", { name: "Alumni News" }).click();
  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByText("All").click();
  await page.locator("img").nth(2).click();
  await page.locator("img").nth(3).click();
  await page.locator("img").nth(4).click();
  await page.locator("div").nth(3).click();
  await page.locator("img").nth(5).click();
  await page.getByText("selected").click();
  await page.locator("div").nth(4).click();
  await page.getByRole("textbox", { name: "Search" }).click();
  await page.getByRole("textbox", { name: "Search" }).fill("hello world!");
  await page.getByRole("textbox", { name: "Search" }).press("Enter");
  await page
    .locator("div")
    .filter({ hasText: "Name Sex Student No. Entry" })
    .getByRole("checkbox")
    .check();
  await page.getByText("Name").click();
  await page.getByText("Sex").click();
  await page.getByText("Student No.").click();
  await page.getByText("Entry Date").click();
  await page.getByText("Active Organizations").click();
  await page.getByText("Employment History").click();
  await page.getByText("Graduate Info").click();
  await page.getByText("Action").click();
  await page
    .locator("div")
    .filter({ hasText: "Name Sex Student No. Entry" })
    .getByRole("checkbox")
    .uncheck();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("checkbox").nth(2).check();
  await page.getByRole("checkbox").nth(3).check();
  await page.getByText("John Doe").click();
  await page.getByText("Jane Doe").first().click();
  await page.getByText("Jane Doe").nth(1).click();
  await page.getByText("M", { exact: true }).first().click();
  await page.getByText("M", { exact: true }).nth(1).click();
  await page.getByText("M", { exact: true }).nth(2).click();
  await page.getByText("-12345").click();
  await page.getByText("-02154").first().click();
  await page.getByText("-02154").nth(1).click();
  await page.getByText("12/2022", { exact: true }).click();
  await page.getByText("N/A").click();
  await page.getByText("/2019").nth(4).click();
  await page.getByText("cursor").first().click();
  await page.getByText("cursor").nth(1).click();
  await page.getByText("csi").first().click();
  await page.getByText("Tech Corp").click();
  await page.getByText("Software Engineer").click();
  await page.getByText("/2019 – 12/2022").click();
  await page.getByText("bs math").click();
  await page.getByText("magna_cum_laude").click();
  await page.getByText("/2019").nth(1).click();
  await page.getByText("csi").nth(1).click();
  await page.getByText("Startup").click();
  await page.getByText("Quality control").click();
  await page.getByText("/2019 – Present").click();
  await page.getByText("BS Comnputer Science").click();
  await page.getByText("summa_cum_laude").click();
  await page.getByText("/2019").nth(3).click();
  await page.getByText("—").first().click();
  await page.getByText("—").nth(1).click();
  await page.getByText("—").nth(2).click();
});
