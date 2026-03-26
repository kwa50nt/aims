import { test, expect } from "@playwright/test";

// -----------------------------------------------------------------------
// Mock behavior for add-alumni endpoint
// -----------------------------------------------------------------------
function mockAddAlumni(route: any, request: any) {
  const data = request.postDataJSON();

  // Simulate backend validation logic
  if (!["M", "F"].includes(data.gender)) {
    return route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Invalid input for gender" }),
    });
  }

  if (!/^\d{4}-\d{5}$/.test(data.student_number)) {
    return route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Please follow student number format" }),
    });
  }

  if (!data.current_email) {
    return route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Please input an email" }),
    });
  }

  const grad = data.academicHist?.[0];
  if (grad) {
    if (!grad.year_started) {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Please input year started" }),
      });
    }

    if (!grad.semester_started) {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Please select which semester started",
        }),
      });
    }
  }

  // Success case
  return route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ alumni_id: 999 }),
  });
}

// -----------------------------------------------------------------------
// TEST SUITE
// -----------------------------------------------------------------------
test.describe("Add Alumni (Mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/add-alumni", mockAddAlumni);
  });

  // ---------------- INVALID GENDER ----------------
  test("Invalid gender", async ({ page }) => {
    const res = await page.evaluate(async () => {
      return fetch("http://localhost:3001/add-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "INVALID",
          student_number: "2023-12345",
          current_email: "test@test.com",
          academicHist: [],
        }),
      }).then(res => res.json());
    });

    expect(res.error).toContain("Invalid input for gender");
  });

  // ---------------- INVALID STUDENT NUMBER ----------------
  test("Invalid student number", async ({ page }) => {
    const res = await page.evaluate(async () => {
      return fetch("http://localhost:3001/add-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "M",
          student_number: "INVALID",
          current_email: "test@test.com",
          academicHist: [],
        }),
      }).then(res => res.json());
    });

    expect(res.error).toContain("student number format");
  });

  // ---------------- MISSING EMAIL ----------------
  test("Missing email", async ({ page }) => {
    const res = await page.evaluate(async () => {
      return fetch("http://localhost:3001/add-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "M",
          student_number: "2023-12345",
          academicHist: [],
        }),
      }).then(res => res.json());
    });

    expect(res.error).toContain("email");
  });

  // ---------------- MISSING GRAD INFO ----------------
  test("Missing year started", async ({ page }) => {
    const res = await page.evaluate(async () => {
      return fetch("http://localhost:3001/add-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "M",
          student_number: "2023-12345",
          current_email: "test@test.com",
          academicHist: [{ degree_name: "BS CS" }],
        }),
      }).then(res => res.json());
    });

    expect(res.error).toContain("year started");
  });

  test("Missing semester started", async ({ page }) => {
    const res = await page.evaluate(async () => {
      return fetch("http://localhost:3001/add-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "M",
          student_number: "2023-12345",
          current_email: "test@test.com",
          academicHist: [{ degree_name: "BS CS", year_started: 2020 }],
        }),
      }).then(res => res.json());
    });

    expect(res.error).toContain("semester");
  });

  // ---------------- VALID ----------------
  test("Valid alumni", async ({ page }) => {
    const res = await page.evaluate(async () => {
      return fetch("http://localhost:3001/add-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "M",
          student_number: "2023-12345",
          current_email: "test@test.com",
          academicHist: [
            {
              degree_name: "BS CS",
              year_started: 2020,
              semester_started: 1,
            },
          ],
        }),
      }).then(res => res.json());
    });

    expect(res.alumni_id).toBeDefined();
  });
});
