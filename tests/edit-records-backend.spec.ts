import { test, expect } from "@playwright/test";
const portNumberBackEnd = 3001;
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
  }
};


test.describe("Edit alumni profile", () => {
  let alumni_ids:number[] = [];
  let response, fetched;
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
    // cleanup
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
    await page.goto("http://localhost:3000/edit-records");
    await page.waitForSelector(".alumni-row", { timeout: 10000 });
  });
  test.describe("Editing information", () => {
    
    test("Edit general alumni information", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // edit alumni info into this

      // alumni_info:{
      //   alumni_id: 2424,
      //   student_number: '2015-88990',
      //   last_name: 'Navarro',
      //   gender: 'M',
      //   current_address: 'Quezon City',
      //   academic_achievements: 'summa_cum_laude'
      // }
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].student_number).toBe('2015-88990');
      expect(fetched[0].last_name).toBe('Navarro');
      expect(fetched[0].gender).toBe('M');
      expect(fetched[0].current_address).toBe('Quezon City');
      expect(fetched[0].academic_achievements).toBe('summa_cum_laude');
    });

    test("Edit Employment History", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // edit employment into this

      // employment_hist:{
      //   "employer": "P&G",
      //   "start_date": "2020-01-01",
      //   "last_position_held": "CEO"
      // }
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].employer).toBe('P&G');
      expect(fetched[0].start_date).toBe('2020-01-01');
      expect(fetched[0].last_position_held).toBe('CEO');
    });

    test("Edit Academic History", async ({
      page,
    }) => {

      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // edit Academic History into this

      // academic_hist:{
      //   "degree_name": "BS Civil Engineering", 
      //   "year_started": 2020, 
      //   "semester_graduated": 1, 
      //   "granting_university": "Mapua"
      // }
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].degree_name).toBe('BS Civil Engineering');
      expect(fetched[0].year_started).toBe(2020);
      expect(fetched[0].semester_graduated).toBe(1);
      expect(fetched[0].granting_university).toBe('Mapua');
    });

    test("Edit Active Organizations", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // edit Active Organizations into this

      // active_orgs:{
      //   "organization_name": "ORGANIZATION A", 
      // }
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].organization_name).toBe('ORGANIZATION A');
    });
  });
  test.describe("Delete Histories", () => {
    
    test("Delete Employment History", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // delete one employment history
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].employment_hist).toBe([]);
    });

    test("Delete Academic History", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // delete one Academic history
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].academic_hist).toBe([]);
    });
    test("Delete Employment History", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // delete one org history
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].active_orgs).toBe([]);
    });
  });
  test.describe("Add a new history", () => {
    
    test("Add Employment History", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // add the ff employment history
      // {
      // "employer": "Accenture Philippines",
      // "end_date": "2017-05-31",
      // "is_current": false,
      // "start_date": "2016-01-01",
      // "last_position_held": "Intern Developer"
      // }
      
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].employment_hist.employer).toBe("Accenture Philippines");
      expect(fetched[0].employment_hist.end_date).toBe("2017-05-31");
      expect(fetched[0].employment_hist.is_current).toBe(false);
      expect(fetched[0].employment_hist.start_date).toBe("2016-01-01");
      expect(fetched[0].employment_hist.last_position_held).toBe("Intern Developer");
    });

    test("Add Academic History", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // add the ff Academic history
      // {
      //   "degree_name": "BS IT", 
      //   "latin_honor": "cum_laude", 
      //   "year_started": 2013, 
      //   "year_graduated": 2017, 
      //   "semester_started": 1, 
      //   "semester_graduated": 2, 
      //   "granting_university": "University of the Philippines"
      // }
      
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].academic_hist.degree_name).toBe("BS IT");
      expect(fetched[0].academic_hist.latin_honor).toBe("cum_laude");
      expect(fetched[0].academic_hist.year_started).toBe(2013);
      expect(fetched[0].academic_hist.year_graduated).toBe(2017);
      expect(fetched[0].academic_hist.semester_started).toBe(1);
      expect(fetched[0].academic_hist.semester_graduated).toBe(2);
      expect(fetched[0].academic_hist.granting_university).toBe("University of the Philippines");
    });
    test("Add Organization History", async ({
      page,
    }) => {
      // ==========================================
      // =                 TODO                   =
      // ==========================================
      // add the ff org history
      // {
      //   "organization_name": "UP Alumni Engineers Society"
      // }
      
      response = await fetch(`http://localhost:3001/get-alumnis?sortBy=none&order=none&filters=none`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fetched = await response.json();
      expect(fetched[0].active_orgs.organization_name).toBe("UP Alumni Engineers Society");
    });
  });
});

