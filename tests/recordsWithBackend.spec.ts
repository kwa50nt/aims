import { test, expect } from "@playwright/test";

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
    academic_hist: [
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
    employment_hist: [
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
    active_orgs: [
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
    academic_hist: [
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
    employment_hist: [
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
    active_orgs: [{organization_name:"csi"}],
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
    academic_hist: [],
    employment_hist: [],
    active_orgs: [],
  },
};


test.describe("Records Page Sorting function", () => {
  let alumni_ids:number[] = [];
  test.beforeAll(async ({}) => {
    // add alumni to database
    let response;
    let fetched ;
    alumni_ids = [];
    for (const [key, alumni] of Object.entries(mockAlumniData)) {
      response = await fetch(`http://localhost:3001/add-alumni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alumni)
      });
      fetched = await response.json();
      alumni_ids.push(fetched.alumni_id);
    }
  });
  test.afterAll(async ({}) => {
    // removed added alumni to database
    let response;
    let fetched ;
    for (const id of alumni_ids) {
      await fetch(`http://localhost:3001/delete-alumni/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }});
    }
  });
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/index.html");
    await page.waitForSelector(".alumni-row", { timeout: 10000 });
  });
  test.describe("Sorting Function", () => {
    

    test("Sort last names in ascending order", async ({
      page,
    }) => {
      await page.getByTestId("sortLastName").click();

      const row1 = page.locator(".alumni-row").nth(0);;
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("Jake Doe")).toBeVisible();
      await expect(row2.getByText("Jane Doe")).toBeVisible();
      await expect(row3.getByText("John Doe")).toBeVisible();
    });

    test("Sort last names in descending order", async ({
      page,
    }) => {
      await page.getByTestId("sortLastName").click();
      await page.getByTestId("sortLastName").click();

      const row1 = page.locator(".alumni-row").nth(0);;
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("John Doe")).toBeVisible();
      await expect(row2.getByText("Jane Doe")).toBeVisible();
      await expect(row3.getByText("Jake Doe")).toBeVisible();
    });

    test("Sort gender in ascending order", async ({
      page,
    }) => {
      await page.getByTestId("sortGender").click();

      const row1 = page.locator(".alumni-row").nth(0);;
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("Jane Doe")).toBeVisible();
      await expect(row2.getByText("Jake Doe")).toBeVisible();
      await expect(row3.getByText("John Doe")).toBeVisible();
    });

    test("Sort gender in descending order", async ({
      page,
    }) => {
      await page.getByTestId("sortGender").click();
      await page.getByTestId("sortGender").click();

      const row1 = page.locator(".alumni-row").nth(0);;
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("John Doe")).toBeVisible();
      await expect(row2.getByText("Jake Doe")).toBeVisible();
      await expect(row3.getByText("Jane Doe")).toBeVisible();
    });

    test("Sort student no. in ascending order", async ({
      page,
    }) => {
      await page.getByTestId("sortStudent_number").click();

      const row1 = page.locator(".alumni-row").nth(0);;
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("Jane Doe")).toBeVisible();
      await expect(row2.getByText("Jake Doe")).toBeVisible();
      await expect(row3.getByText("John Doe")).toBeVisible();
    });

    test("Sort student no. in descending order", async ({
      page,
    }) => {
      await page.getByTestId("sortStudent_number").click();
      await page.getByTestId("sortStudent_number").click();

      const row1 = page.locator(".alumni-row").nth(0);;
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("John Doe")).toBeVisible();
      await expect(row2.getByText("Jake Doe")).toBeVisible();
      await expect(row3.getByText("Jane Doe")).toBeVisible();
    });

    test("Sort entry date in ascending order", async ({
      page,
    }) => {
      await page.getByTestId("sortEntry_date").click();

      const row1 = page.locator(".alumni-row").nth(0);;
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("Jane Doe")).toBeVisible();
      await expect(row2.getByText("Jake Doe")).toBeVisible();
      await expect(row3.getByText("John Doe")).toBeVisible();
    });

    test("Sort entry date in descending order", async ({
      page,
    }) => {
      await page.getByTestId("sortEntry_date").click();
      await page.getByTestId("sortEntry_date").click();

      const row1 = page.locator(".alumni-row").nth(0);
      const row2 = page.locator(".alumni-row").nth(1);
      const row3 = page.locator(".alumni-row").nth(2);
      await expect(row1.getByText("John Doe")).toBeVisible();
      await expect(row2.getByText("Jake Doe")).toBeVisible();
      await expect(row3.getByText("Jane Doe")).toBeVisible();
    });
  });
});

test.describe("Records - delete alumni ", () => {
  let alumni_id_to_delete:number;
  test("Add an alumni for deletion", async ({
    page,
  }) => {
      // add alumni
    const response = await fetch(`http://localhost:3001/add-alumni`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mockAlumniData[56])
    });
    const fetched = await response.json();
    const alumni_id = fetched.alumni_id;

    await page.goto("http://localhost:3000/index.html");
    await page.waitForSelector(".alumni-row", { timeout: 10000 });

    //verify alumni has been added
    const row1 = page.locator(".alumni-row").nth(0);;
    await expect(row1.getByText("John Doe")).toBeVisible();

  });
  test("Delete an alumni", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/index.html");
    await page.waitForSelector(".alumni-row", { timeout: 10000 });
    // delete alumni
    
    // access trash button
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const row1 = page.locator(".alumni-row").nth(0);
    await row1.getByAltText("Delete").click();

    //verify alumni has been deleted
    await expect(page.locator(".alumni-row")).toHaveCount(0);
    });

});
