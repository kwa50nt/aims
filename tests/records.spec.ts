import { test, expect } from "@playwright/test";

const mockAlumniData = {
  "56": {
    alumni_id: "56",
    last_name: "Doe",
    first_name: "John",
    middle_name: null,
    suffix: null,
    gender: "M",
    student_number: "2023-12345",
    entry_date: "2022-12-30T16:00:00.000Z",
    current_email: "john@example.com",
    phone_number: "9123456789",
    current_address: null,
    account_id: 104,
    graduationInfo: [
      {
        graduation_id: "2",
        alumni_id: 56,
        year_started: 2015,
        semester_started: 1,
        year_graduated: 2019,
        semester_graduated: 2,
        latin_honor: "magna_cum_laude",
      },
    ],
    employmentHist: [
      {
        employment_id: "1",
        alumni_id: 56,
        employer: "Tech Corp",
        last_position_held: "Software Engineer",
        start_date: "2019-05-31T16:00:00.000Z",
        end_date: "2022-12-30T16:00:00.000Z",
        is_current: false,
      },
    ],
    alumniDegs: ["bs math"],
    activeOrgs: ["cursor", "cursor", "csi"],
  },
  "57": {
    alumni_id: "57",
    last_name: "Doe",
    first_name: "Jane",
    middle_name: null,
    suffix: null,
    gender: "M",
    student_number: "2023-02154",
    entry_date: null,
    current_email: "test1@example.com",
    phone_number: "9123456789",
    current_address: null,
    account_id: 105,
    graduationInfo: [
      {
        graduation_id: "3",
        alumni_id: 57,
        year_started: 2015,
        semester_started: 1,
        year_graduated: 2019,
        semester_graduated: 2,
        latin_honor: "summa_cum_laude",
      },
    ],
    employmentHist: [
      {
        employment_id: "2",
        alumni_id: 57,
        employer: "Startup",
        last_position_held: "Quality control",
        start_date: "2019-05-31T16:00:00.000Z",
        end_date: "2022-12-30T16:00:00.000Z",
        is_current: true,
      },
    ],
    alumniDegs: ["BS Comnputer Science"],
    activeOrgs: ["csi"],
  },
  "58": {
    alumni_id: "58",
    last_name: "Doe",
    first_name: "Jane",
    middle_name: null,
    suffix: null,
    gender: "M",
    student_number: "2023-02154",
    entry_date: "2019-06-01",
    current_email: "test1@example.com",
    phone_number: "9123456789",
    current_address: null,
    account_id: 105,
    graduationInfo: [],
    employmentHist: [],
    alumniDegs: [],
    activeOrgs: [],
  },
};

test("Initial HTML/CSS Tests", async ({ page }, testInfo) => {
  if (!testInfo.project.name.startsWith("frontend")) {
    test.skip();
  }

  await page.route("**/get-alumnis", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(JSON.stringify(mockAlumniData)),
    });
  });

  await page.goto("/index.html");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector(".alumni-row");

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
