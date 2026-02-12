import { test, expect, request } from '@playwright/test';
let apiContext: any;
let IDofNewAlumni: number;
let IDofNewAlumni1: number;
let IDofNewAlumni2: number;
let IDofNewAlumni3: number;
test.beforeAll(async ({ playwright }) => {
  apiContext = await request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });
});


test.describe.serial('Alumni API tests', () => {

  test('Add Alumni', async ({}, testInfo) => {
    if (!testInfo.project.name.startsWith('backend')) {
      test.skip();
    }
    const response = await apiContext.post('/add-alumni', {
      data: {
        email: "test@example.com",
        password: "123456",
        role_name: "Alumni",
        last_name: "Doe",
        first_name: "John",
        gender: "M",
        student_number: "2023-12345",
        current_email: "john@example.com",
        phone_number: "9123456789"
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('alumni_id');
    IDofNewAlumni = body.alumni_id;
  });

  test('Delete added Alumni', async ({}, testInfo) => {
    if (testInfo.project.name.startsWith('frontend')) {
      test.skip();
    }
    const response = await apiContext.delete(`/delete-alumni/${IDofNewAlumni}`);
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain('Alumni deleted successfully');
  });

  test('Adding duplicated alumni', async ({}, testInfo) => {
    if (!testInfo.project.name.startsWith('backend')) {
      test.skip();
    }
    const data = {data: {
        email: "test@example.com",
        password: "123456",
        role_name: "Alumni",
        last_name: "Doe",
        first_name: "John",
        gender: "M",
        student_number: "2023-12345",
        current_email: "john@example.com",
        phone_number: "9123456789"
      }};
    const response1 = await apiContext.post('/add-alumni', data);
    const response2 = await apiContext.post('/add-alumni', data);

    expect(response1.ok()).toBeTruthy();
    expect(response2.ok()).toBeFalsy();
    
    const body = await response1.json();
    expect(body).toHaveProperty('alumni_id');
    IDofNewAlumni = body.alumni_id;
    await apiContext.delete(`/delete-alumni/${IDofNewAlumni}`);

  });

  test('Deleting non-existent alumni', async ({}, testInfo) => {
    if (!testInfo.project.name.startsWith('backend')) {
      test.skip();
    }
    const response = await apiContext.delete(`/delete-alumni/${IDofNewAlumni}`);
    expect(response.ok()).toBeFalsy();
  });
  
  test('Adding multiple alumni', async ({}, testInfo) => {
    if (!testInfo.project.name.startsWith('backend')) {
      test.skip();
    }
    const alumni1 = {data: {
        email: "test1@example.com",
        password: "123456",
        role_name: "Alumni",
        last_name: "Doe",
        first_name: "John",
        gender: "M",
        student_number: "2022-12345",
        current_email: "john@example.com",
        phone_number: "9123456789"
      }};
    const alumni2 = {data: {
        email: "test2@example.com",
        password: "123456",
        role_name: "Alumni",
        last_name: "Doe",
        first_name: "John",
        gender: "M",
        student_number: "2023-12345",
        current_email: "john@example.com",
        phone_number: "9123456789"
      }};
    const alumni3 = {data: {
        email: "test3@example.com",
        password: "123456",
        role_name: "Alumni",
        last_name: "Doe",
        first_name: "John",
        gender: "M",
        student_number: "2021-12345",
        current_email: "john@example.com",
        phone_number: "9123456789"
      }};
    const response1 = await apiContext.post('/add-alumni', alumni1);
    const response2 = await apiContext.post('/add-alumni', alumni2);
    const response3 = await apiContext.post('/add-alumni', alumni3);
    expect(response1.ok()).toBeTruthy();
    expect(response2.ok()).toBeTruthy();
    expect(response3.ok()).toBeTruthy();

    //deleting test alumni for cleaning

    const body1 = await response1.json();
    expect(body1).toHaveProperty('alumni_id');
    IDofNewAlumni1 = body1.alumni_id;

    const body2 = await response2.json();
    expect(body2).toHaveProperty('alumni_id');
    IDofNewAlumni2 = body2.alumni_id;

    const body3 = await response3.json();
    expect(body3).toHaveProperty('alumni_id');
    IDofNewAlumni3 = body3.alumni_id;
  });

  test('Delete mulitple Alumni', async ({}, testInfo) => {
    if (testInfo.project.name.startsWith('frontend')) {
      test.skip();
    }
    const response1 = await apiContext.delete(`/delete-alumni/${IDofNewAlumni1}`);
    const response2 = await apiContext.delete(`/delete-alumni/${IDofNewAlumni2}`);
    const response3 = await apiContext.delete(`/delete-alumni/${IDofNewAlumni3}`);

    expect(response1.ok()).toBeTruthy();
    const text1 = await response1.text();
    expect(text1).toContain('Alumni deleted successfully');

    expect(response2.ok()).toBeTruthy();
    const text2 = await response2.text();
    expect(text2).toContain('Alumni deleted successfully');

    expect(response3.ok()).toBeTruthy();
    const text3 = await response3.text();
    expect(text3).toContain('Alumni deleted successfully');
  });
});

