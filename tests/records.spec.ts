// Tests assisted by Claude
// Assist Date: 12 Mar 2026
// Prompt: Could you help me improve the records.spec.ts file which uses Playwright? The page will display alumni entries as long as a PostgreSQL server is being run. I want to make sure that frontend features as well as the email export are working appropriately. Additionally, extra comments or commented out parts can be removed.

import { test, expect } from "@playwright/test";
import { mock } from "node:test";

const mockAlumniData = {
  56: {
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
    academicHist: [
      {
        degree_name: "bs math",
        graduation_id: "2",
        alumni_id: 56,
        year_started: 2015,
        granting_university: "UPD",
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
    activeOrgs: [
      {organization_name:"cursor"}, 
      {organization_name:"cursor"},
      {organization_name:"csi"}],
  },
  57: {
    alumni_id: "57",
    last_name: "Doe",
    first_name: "Jane",
    middle_name: null,
    suffix: null,
    gender: "F",
    student_number: "2023-02154",
    entry_date: '2010-06-01',
    current_email: "test1@example.com",
    phone_number: "9123456789",
    current_address: null,
    account_id: 105,
    academicHist: [
      {
        degree_name: "BS Computer Science",
        granting_university: "UPD",
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
    activeOrgs: [{organization_name:"csi"}],
  },
  58: {
    alumni_id: "58",
    last_name: "Doe",
    first_name: "Jake",
    middle_name: null,
    suffix: null,
    gender: "M",
    student_number: "2023-02155",
    entry_date: "2019-06-01",
    current_email: "jake@example.com",
    phone_number: "9123456789",
    current_address: null,
    account_id: 106,
    academicHist: [],
    employmentHist: [],
    activeOrgs: [],
  },
};

test.describe("Records Page", () => {
  
  test.beforeEach(async ({ page }) => {
    // Intercept the backend call and return mock data so tests
    // do not depend on the PostgreSQL server being available.
    await page.route("**/get-alumnis?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAlumniData),
      });
    });

    await page.goto("http://localhost:3000/index.html");
    await page.waitForSelector(".alumni-row", { timeout: 10000 });
  });

  test.describe("Static structure", () => {
    test("displays the header and logo", async ({ page }) => {
      await expect(page.locator("#upse-logo")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Alumni Information Management" })
      ).toBeVisible();
    });

    test("displays all nav links", async ({ page }) => {
      await expect(
        page.getByRole("link", { name: "Records", exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Email Blast" })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Add Records" })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Alumni News" })
      ).toBeVisible();
    });

    test("displays the filter bar with search, counter, and export button", async ({
      page,
    }) => {
      await expect(page.getByText("All")).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Search" })
      ).toBeVisible();
      await expect(page.getByText("selected")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Export Emails" })
      ).toBeVisible();
    });

    test("displays all table header columns", async ({ page }) => {
      const header = page.locator(".alumni-header");
      for (const col of [
        "Name",
        "Sex",
        "Student No.",
        "Entry Date",
        "Active Organizations",
        "Employment History",
        "Graduate Info",
        "Action",
      ]) {
        await expect(header.getByText(col)).toBeVisible();
      }
    });
  });

  test.describe("Row rendering", () => {
    test("renders one row per alumni entry", async ({ page }) => {
      await expect(page.locator(".alumni-row")).toHaveCount(3);
    });

    test("renders the correct name, gender, and student number", async ({
      page,
    }) => {
      const row = page.locator(".alumni-row").first();
      await expect(row.getByText("John Doe")).toBeVisible();
      await expect(row.getByText("M", { exact: true })).toBeVisible();
      await expect(row.getByText("2023-12345")).toBeVisible();
    });

    test("formats a valid entry date as MM/YYYY", async ({ page }) => {
      // Alumni 56: entry_date "2022-12-30T16:00:00.000Z" → 12/2022
      const row = page.locator(".alumni-row").first();
      await expect(row.getByText("12/2022", { exact: true })).toBeVisible();
    });

    test("renders active organizations as mini-info pills", async ({ page }) => {
      // Alumni 56 has 3 orgs: cursor, cursor, csi
      const row = page.locator(".alumni-row").first();
      await expect(row.locator(".orgs-cell .mini-info")).toHaveCount(3);
    });

    test("shows — for alumni with no organizations", async ({ page }) => {
      // Alumni 58 has empty activeOrgs
      const row = page.locator(".alumni-row").nth(2);
      await expect(row.locator(".orgs-cell").getByText("—")).toBeVisible();
    });

    test("renders employer and position in the work cell", async ({ page }) => {
      const row = page.locator(".alumni-row").first();
      await expect(row.getByText("Tech Corp")).toBeVisible();
      await expect(row.getByText("Software Engineer")).toBeVisible();
    });

    test("shows Present for a current employment entry", async ({ page }) => {
      // Alumni 57: is_current true
      const row = page.locator(".alumni-row").nth(1);
      await expect(row.getByText(/Present/)).toBeVisible();
    });

    test("shows — for alumni with no employment history", async ({ page }) => {
      // Alumni 58: empty employmentHist
      const row = page.locator(".alumni-row").nth(2);
      await expect(row.locator(".work-cell").getByText("—")).toBeVisible();
    });

    test("renders degree and latin honor in the grad cell", async ({ page }) => {
      const row = page.locator(".alumni-row").first();
      await expect(row.getByText("bs math")).toBeVisible();
      await expect(row.getByText("magna_cum_laude")).toBeVisible();
    });

    test("shows — for alumni with no graduation info", async ({ page }) => {
      // Alumni 58: empty graduationInfo
      const row = page.locator(".alumni-row").nth(2);
      await expect(row.locator(".grad-cell").getByText("—")).toBeVisible();
    });
  });

  test.describe("Checkbox selection", () => {
    test("selected counter starts at 0", async ({ page }) => {
      await expect(page.locator("#selected-label")).toHaveText("0");
    });

    test("checking a row increments the selected counter", async ({ page }) => {
      await page
        .locator(".alumni-row")
        .first()
        .getByRole("checkbox")
        .check();
      await expect(page.locator("#selected-label")).toHaveText("1");
    });

    test("checking multiple rows reflects the correct count", async ({
      page,
    }) => {
      const checkboxes = page.locator(".alumni-row input[type='checkbox']");
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await expect(page.locator("#selected-label")).toHaveText("2");
    });

    test("unchecking a row decrements the selected counter", async ({
      page,
    }) => {
      const checkbox = page
        .locator(".alumni-row")
        .first()
        .getByRole("checkbox");
      await checkbox.check();
      await checkbox.uncheck();
      await expect(page.locator("#selected-label")).toHaveText("0");
    });

    test("header checkbox selects all rows and updates the counter", async ({
      page,
    }) => {
      await page.locator(".header-checkbox").check();
      const checkboxes = page.locator(".alumni-row input[type='checkbox']");
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
      await expect(page.locator("#selected-label")).toHaveText("3");
    });

    test("unchecking header checkbox deselects all rows", async ({ page }) => {
      await page.locator(".header-checkbox").check();
      await page.locator(".header-checkbox").uncheck();
      const checkboxes = page.locator(".alumni-row input[type='checkbox']");
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
      await expect(page.locator("#selected-label")).toHaveText("0");
    });
  });

  test.describe("Email export", () => {
    test("exports only the checked alumni emails", async ({ page }) => {
      // Select only John Doe
      await page
        .locator(".alumni-row")
        .first()
        .getByRole("checkbox")
        .check();

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "Export Emails" }).click(),
      ]);

      const chunks: Buffer[] = [];
      for await (const chunk of await download.createReadStream()) {
        chunks.push(Buffer.from(chunk));
      }
      const text = Buffer.concat(chunks).toString();

      expect(text).toContain("john@example.com");
      expect(text).not.toContain("test1@example.com");
      expect(text).not.toContain("jake@example.com");
    });

    test("exports all alumni emails when no rows are selected", async ({
      page,
    }) => {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "Export Emails" }).click(),
      ]);

      const chunks: Buffer[] = [];
      for await (const chunk of await download.createReadStream()) {
        chunks.push(Buffer.from(chunk));
      }
      const text = Buffer.concat(chunks).toString();

      expect(text).toContain("john@example.com");
      expect(text).toContain("test1@example.com");
      expect(text).toContain("jake@example.com");
    });

    test("downloaded file has the correct filename", async ({ page }) => {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "Export Emails" }).click(),
      ]);

      expect(download.suggestedFilename()).toBe("upse_alumni_emails.csv");
    });

    test("CSV starts with the header row", async ({ page }) => {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "Export Emails" }).click(),
      ]);

      const chunks: Buffer[] = [];
      for await (const chunk of await download.createReadStream()) {
        chunks.push(Buffer.from(chunk));
      }
      const text = Buffer.concat(chunks).toString();

      expect(text.startsWith("UPSE Alumni Email Addresses")).toBe(true);
    });
  });
});