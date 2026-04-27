const portNumberBackEnd = 3001;

// Cache of loaded alumni objects keyed by alumni_id, used by editAlumni()
const alumniCache = {};
const blankFilters = {
  gender: [],
  studentNum: [],
  entryDate: [],
  employment: [],
  activOrgs: [],
  acadHist: {
    degreeAndUniv: [],
    dateStart: [],
    gradDate: [],
  },
};
//  type: index sa dict
// to add sa gender type = ["gender"]
// to add sa gradDate type = ["acadHist", "gradDate"]

function dictIsEqual(f1, f2) {
  const keys1 = Object.keys(f1);
  const keys2 = Object.keys(f2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (f1[key] !== f2[key]) {
      return false;
    }
  }
  return true;
}

function addFilter(path, filter) {
  let filters = JSON.parse(localStorage.getItem("filters"));
  if (!filters) filters = JSON.parse(JSON.stringify(blankFilters));

  let lst = path.reduce((ret, t) => ret[t], filters);
  if (lst == undefined) {
    console.log("wrong path value");
    return false;
  }

  for (let elem of lst) {
    if (dictIsEqual(elem, filter)) {
      console.log("duplicate filter exists");
      return false;
    }
  }

  lst.push(filter);
  localStorage.setItem("filters", JSON.stringify(filters));
  return true;
}

function deleteFilter(path, filter) {
  let filters = JSON.parse(localStorage.getItem("filters"));
  if (!filters) return false;

  let lst = path.reduce((ret, t) => ret[t], filters);
  if (lst == undefined) return false;

  const oldLen = lst.length;
  lst = lst.filter((i) => !dictIsEqual(i, filter));

  if (oldLen == lst.length) return false;

  if (path.length == 1) {
    filters[path[0]] = lst;
  } else if (path.length == 2) {
    filters[path[0]][path[1]] = lst;
  }

  localStorage.setItem("filters", JSON.stringify(filters));
  return true;
}

function filterTest() {
  filters = {
    gender: [
      {
        gender: "F",
        flag: "exclude",
      },
    ],
    studentNum: [
      {
        start: 2020,
        end: 2025,
        flag: "exclude",
      },
    ],
    entryDate: [
      {
        start: "2020-2-2",
        end: "2025-2-2",
        flag: "exclude",
      },
    ],
  };
  getAlumnis("none", filters);
}

function addEmployment() {
  const container = document.getElementById("employment-container");

  const newRow = document.createElement("div");
  newRow.className = "employment-row";

  newRow.innerHTML = `
    <div>
      <label>Employer</label>
      <input type="text" placeholder="e.g. Google, Inc.">
    </div>

    <div>
      <label>Last Position Held</label>
      <input type="text" placeholder="e.g. Head Software Engineer">
    </div>

    <div>
      <label>Start of Employment</label>
      <input type="text" placeholder="MM/YYYY">
    </div>

    <div>
      <label>End of Employment</label>
      <input type="text" placeholder="MM/YYYY">
    </div>

    <button type="button" class="circle-btn minus" onclick="removeRow(this)">
      <i class="fas fa-minus"></i>
    </button>
  `;

  container.appendChild(newRow);
}

function addGraduate() {
  const container = document.getElementById("graduate-container");
  const achievementsRow = container.querySelector(".achievements-row");

  const newRow = document.createElement("div");
  newRow.className = "graduate-row";

  newRow.innerHTML = `
    <div>
      <label>Degree</label>
      <input type="text" placeholder="BS Economics">
      <small class="input-hint">*Don't abbreviate your academic program</small>
    </div>

    <div>
      <label>Latin Honors</label>
      <select class="latin-honors" required>
        <option value="" disabled selected hidden>Select...</option>
        <option value="N/A">N/A</option>
        <option value="Cum Laude">Cum Laude</option>
        <option value="Magna Cum Laude">Magna Cum Laude</option>
        <option value="Summa Cum Laude">Summa Cum Laude</option>
      </select>
    </div>

    <div>
      <label>University Studied</label>
      <input type="text" placeholder="e.g. University of the Philippines">
    </div>

    <div>
      <label>Year and Semester Started</label>
      <input type="text" placeholder="1st Sem, 2026">
    </div>

    <div>
      <label>Year and Semester Graduated</label>
      <input type="text" placeholder="2nd Sem, 2030">
    </div>

    <button type="button" class="circle-btn minus" onclick="removeRow(this)">
      <i class="fas fa-minus"></i>
    </button>
  `;

  container.insertBefore(newRow, achievementsRow);
}

function addOrganization() {
  const container = document.getElementById("organization-container");

  const row = document.createElement("div");
  row.className = "organization-row";

  row.innerHTML = `
    <div>
      <label>Organization</label>
      <input type="text" placeholder="Organization">
    </div>

    <button type="button" class="circle-btn minus" onclick="removeRow(this)">
      <i class="fas fa-minus"></i>
    </button>
  `;

  container.appendChild(row);
}

function removeRow(button) {
  const row = button.parentElement;
  row.remove();
}

function formatMonthYearToDate(input) {
  if (!input) return null;

  const parts = input.split("/");

  if (parts.length !== 2) return null;

  const [month, year] = parts;

  if (month.length !== 2 || year.length !== 4) return null;

  return `${year}-${month}-01`;
}

async function updateAlumni(data) {
  // const data = {
  //   alumni_info:{
  //     alumni_id: 2424,
  //     last_name: "cccccccc",
  //   },
  //   academic_hist: [
  //     {
  //       "degree_name": "BS IT", 
  //       "latin_honor": "cum_laude", 
  //       "year_started": 2013, 
  //       "graduation_id": -1, 
  //       "year_graduated": 2017, 
  //       "semester_started": 1, 
  //       "semester_graduated": 2, 
  //       "granting_university": "University of the Philippines"
  //     }
  //   ],
  //   employment_hist: [
  //   ],
  //   active_orgs:null
  // };
  try {
    const response = await fetch(
      `http://localhost:${portNumberBackEnd}/update-alumni`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    const fetched = await response.json();
    console.log("Server Response:", fetched);
    window.location.href = "http://localhost:3000/index.html";

    
  } catch (err) {
    console.log("error updating alumni:", err);
  }
}

async function addAlumni() {
  const form = document.querySelector(".alumni-form");

  const getVal = (selector) => {
    const el = form.querySelector(selector);
    if (!el) return null;
    const val = el.value.trim();
    return val === "" ? null : val;
  };

  const randomSuffix = Math.floor(Math.random() * 100000);
  const accountEmail = `test+${randomSuffix}@example.com`;

  const academic_hist = Array.from(
    document.querySelectorAll("#graduate-container .graduate-row"),
  )
    .map((row) => {
      const getRowVal = (sel) => {
        const el = row.querySelector(sel);
        return el ? el.value.trim() : "";
      };

      const degree = getRowVal('input[placeholder="BS Economics"]') || null;
      const university = getRowVal('input[placeholder="e.g. University of the Philippines"]') || null;
      
      const latinHonorRaw = getRowVal(".latin-honors");
      let latin_honor = (!latinHonorRaw || latinHonorRaw === "N/A" || latinHonorRaw === "") ? null : latinHonorRaw;
      
      if (latin_honor) {
        latin_honor = latin_honor.toLowerCase().replace(/ /g, "_");
      }
      
      const yearStartedInput = getRowVal('input[placeholder="1st Sem, 2026"]');
      const gradYearInput = getRowVal('input[placeholder="2nd Sem, 2030"]');

      const parseYear = (str) => {
        const match = str.match(/\b\d{4}\b/);
        return match ? parseInt(match[0]) : null;
      };

      const parseSem = (str) => {
        const lower = str.toLowerCase();
        if (lower.includes("1st") || lower.includes("1")) return 1;
        if (lower.includes("2nd") || lower.includes("2")) return 2;
        if (lower.includes("3rd") || lower.includes("mid")) return 3;
        return null;
      };

      const year_started = parseYear(yearStartedInput);
      const semester_started = parseSem(yearStartedInput);
      const year_graduated = parseYear(gradYearInput);
      const semester_graduated = parseSem(gradYearInput);

      if (!degree && !year_started && !year_graduated) return null;

      return {
        degree_name: degree,
        year_started,
        granting_university: university,
        semester_started,
        year_graduated,
        semester_graduated,
        latin_honor,
      };
    })
    .filter(Boolean);

  const employment_hist = Array.from(
    document.querySelectorAll("#employment-container .employment-row"),
  )
    .map((row) => {
      const employer = row.querySelector('input[placeholder="e.g. Google, Inc."]')?.value.trim() || null;
      const position = row.querySelector('input[placeholder="e.g. Head Software Engineer"]')?.value.trim() || null;
      const dateInputs = row.querySelectorAll('input[placeholder="MM/YYYY"]');

      const startRaw = dateInputs[0]?.value.trim() || "";
      const endRaw = dateInputs[1]?.value.trim() || "";

      const convertToSQLDate = (val) => {
        if (!val || val.toLowerCase() === "present") return null;
        if (val.includes("/")) {
            const [month, year] = val.split("/");
            return `${year}-${month.padStart(2, "0")}-01`;
        }
        if (val.length === 4) return `${val}-01-01`;
        return null;
      };

      if (!employer && !position) return null;

      const isPresent = endRaw.toLowerCase() === "present" || endRaw === "";

      return {
        employer,
        last_position_held: position,
        start_date: convertToSQLDate(startRaw),
        end_date: isPresent ? null : convertToSQLDate(endRaw),
        is_current: isPresent, 
      };
    })
    .filter(Boolean);

  const active_orgs = [];
  document.querySelectorAll('#organization-container input[placeholder="Organization"]').forEach(input => {
    const val = input.value.trim();
    if (val) {
      val.split(",").forEach(org => {
        const cleanOrg = org.trim();
        if (cleanOrg) active_orgs.push({ organization_name: cleanOrg });
      });
    }
  });

  const entry_date = (() => {
      const inputEls = Array.from(form.querySelectorAll('input[placeholder="MM/YYYY"]'));
      const inputEl = inputEls.find(el => el.closest('div')?.querySelector('label')?.innerText.includes('Entry Date')) || inputEls[0];
      
      const raw = inputEl ? inputEl.value.trim() : "";
      if (!raw) return null;
      if (raw.includes("/")) {
          const [month, year] = raw.split("/");
          return `${year}-${month.padStart(2, "0")}-01`;
      }
      if (raw.length === 4) return `${raw}-01-01`;
      return null;
  })();

  // Format phone number for DB ("0917..." -> "917...")
  let phone = getVal('input[placeholder="e.g. 09XXXXXXXXX"]');
  if (phone) {
    phone = phone.replace(/[-\s]/g, "");  // Remove any spaces or dashes
    if (phone.startsWith("0") && phone.length === 11) {
      phone = phone.substring(1);  // Strips the first zero
    } else if (phone.startsWith("+63")) {
      phone = phone.substring(3);  // Strips the +63 if used
    }
  }

  const data = {
    email: accountEmail,
    password: "123456",
    first_name: getVal('input[placeholder="First Name"]'),
    last_name: getVal('input[placeholder="Last Name"]'),
    middle_name: getVal('input[placeholder="M.I."]'),
    suffix: getVal('input[placeholder="Jr., III, etc."]'),
    maiden_name: getVal('input[placeholder="Maiden Name"]'),
    gender: getVal('select.sex'),
    student_number: getVal('input[placeholder="xxxx-xxxxx"]'),
    entry_date: entry_date,
    current_email: getVal('input[placeholder="jdelacruz@up.edu.ph"]'),
    phone_number: phone,
    current_address: getVal('input[placeholder="Your Home Address"]'),
    academic_hist,
    employment_hist,
    active_orgs,
  };

  try {
    const response = await fetch(
      `http://localhost:${portNumberBackEnd}/add-alumni`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    
    const errorMsgParsing = {
      "enum genders": "Invalid input for gender.",
      "null value in column \"entry_date\"": "Please add an entry date.",
      "type date": "Please follow the prescribed format for the date.",
      "violates check constraint \"email_format\"": "Please input a valid email address.",
      "phone_number_format": "Please input a valid mobile number (11 digits e.g. 09XXXXXXXXX).",
      "null value in column \"phone_number\"": "Please input a mobile number.",
      "null value in column \"student_number\"": "Please add a student number.",
      "student_number_format": "Please follow the student number format XXXX-XXXXX.",
      "null value in column \"start_date\"": "Please input a start date for the employment history.",
      "null value in column \"end_date\"": "Please input an end date for the employment history.",
      "time field value out of range": "Please input a valid date.",
      "null value in column \"employer\"": "Please input an employer.",
      "null value in column \"last_position_held\"": "Please input the last position held.",
      "duplicate key value violates unique constraint \"upsealumni_student_number_key\"": "Student number already in system.",
      "null value in column \"year_started\"": "Please input the year started.",
      "null value in column \"semester_started\"": "Please select which semester started.",
      "null value in column \"granting_university\"": "Please input the University Studied.",
      "null value in column \"degree_name\"": "Please input the Degree Name.",
      "null value in column \"current_email\"": "Please input a primary email address."
    };

    const fetched = await response.json();
    const errorMsg = fetched["error"];
    console.log("Server Response:", fetched);
    
    if (errorMsg && errorMsg !== "None") {
      let matched = false;
      for (const key in errorMsgParsing) {
        if (errorMsg.includes(key)) {
          alert(errorMsgParsing[key]);
          matched = true;
          break;
        }
      }
      if (!matched) alert("Database Error: " + errorMsg);
    } else {
      alert("Alumni record added successfully!");
    }
  } catch (err) {
    console.log("error adding alumni:", err);
    alert("Network Error: Could not connect to the server.");
  }
}

async function deleteAlumni(alumniId) {
  //parameter nlng alumniId since ginagamit naman din pareho sa pag delete sa frontend at backend
  const confirmDelete = confirm("Delete this alumni?");
  if (!confirmDelete) return;

  try {
    //frontend delete portion
    const row = document.querySelector(`[data-alumni-id="${alumniId}"]`);
    if (row) row.remove();

    updateSelectedCount();
    //backend delete portion
    const response = await fetch(
      `http://localhost:${portNumberBackEnd}/delete-alumni/${alumniId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const fetched = await response.json();
    console.log("Server Response:", fetched);
  } catch (err) {
    console.log("error deleting alumni:", err);
  }
}

let sortOrder = {
  last_name: "asc",
  gender: "asc",
  student_number: "asc",
  entry_date: "asc",
};

async function getAlumnis(sortBy = "none"){
  filters = JSON.parse(localStorage.getItem("filters"));
  if (!filters) {
    filters = JSON.parse(JSON.stringify(blankFilters))
    localStorage.setItem("filters", JSON.stringify(blankFilters));
  }
  try {
    const alternateOrder = {
      "asc":"desc",
      "desc":"asc",
    }
    let order = "none"

    if (sortBy != "none"){
      order = sortOrder[sortBy];
      sortOrder[sortBy] = alternateOrder[sortOrder[sortBy]];
    }

    const encodedFilters = encodeURIComponent(JSON.stringify(filters));

    const response = await fetch(`http://localhost:${portNumberBackEnd}/get-alumnis?sortBy=${sortBy}&order=${order}&filters=${encodedFilters}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    const fetched = await response.json();
    console.log(fetched);
    renderAlumniTable(fetched);
  }
  catch (err){
    console.log("error getting alumni:", err);
    document.getElementById("alumni-table-body").innerHTML = `<p class="no-records">Failed to load alumni records. Please try again.</p>`;
  }
}

async function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an Excel file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `http://localhost:${portNumberBackEnd}/upload-excel`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();

    console.log("Server Response:", result);

    if (!response.ok) {
      alert(result.error || "Upload failed");
      return;
    }

    alert("Excel uploaded successfully!");
  } catch (err) {
    console.log("error uploading excel:", err);
    alert("Upload failed");
  }
}

function renderAlumniTable(alumniData) {
  const main = document.getElementById("alumni-table-body");
  main.innerHTML = "";

  const entries = Object.values(alumniData);

  if (entries.length == 0) {
    main.innerHTML = `<p class="no-records">No alumni records.</p>`;
    return;
  }

  entries.forEach((alumni) => {
    alumniCache[alumni.alumni_id] = alumni;
    main.appendChild(renderAlumniRow(alumni));
  });
}

function renderAlumniRow(alumni) {
  const fullName = [
    alumni.first_name,
    alumni.middle_name,
    alumni.last_name,
    alumni.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  const orgsHTML =
    (alumni.active_orgs || [])
      .map((org) => {
        const name = typeof org === "object" ? org.organization_name : org;
        return `
      <div class="mini-info">
        <img src="assets/black-circle.png" alt="">
        <p>${name}</p>
      </div>`;
      })
      .join("") || "<p>—</p>";

  const employments = alumni.employment_hist || [];
  const sorted = [...employments].sort((a, b) => b.is_current - a.is_current);
  const empHTML =
    sorted
      .map(
        (emp) => `
    <div class="employment-entry">
      <div class="mini-info">
        <img src="assets/black-circle.png" alt="">
        <p>${emp.employer}</p>
      </div>
      <div class="mini-info">
        <img src="assets/Suitcase.png" alt="">
        <p>${emp.last_position_held}</p>
      </div>
      <div class="mini-info">
        <img src="assets/calendar.png" alt="">
        <p>${formatDate(emp.start_date)} – ${emp.is_current ? "Present" : formatDate(emp.end_date)}</p>
      </div>
    </div>`,
      )
      .join("") || "<p>—</p>";

  const workCellHTML =
    employments.length > 1
      ? `<img src="assets/CaretCircleDown.png" alt="" class="toggle-emp" title="Toggle all employment">
       <div class="emp-entries collapsed">${empHTML}</div>`
      : `<div class="emp-entries">${empHTML}</div>`;

  const gradInfos = alumni.academic_hist || [];

  const gradHTML =
    gradInfos
      .map((g, i) => {
        const degree = g.degree_name
          ? typeof g.degree_name === "object"
            ? g.degree_name
            : g.degree_name
          : null;
        const honor = g.latin_honor;
        const gradYear = g.year_graduated
          ? `${g.semester_graduated === 1 ? "01" : "06"}/${g.year_graduated}`
          : null;

        return `
      ${degree ? `<div class="mini-info"><img src="assets/GraduationCap.png" alt=""><p>${degree}</p></div>` : ""}
      ${honor ? `<div class="mini-info"><img src="assets/Student.png" alt=""><p>${honor}</p></div>` : ""}
      ${gradYear ? `<div class="mini-info"><img src="assets/calendar.png" alt=""><p>${gradYear}</p></div>` : ""}
    `;
      })
      .join("") || "<p>—</p>";

  const row = document.createElement("div");
  row.className = "alumni-row";
  row.dataset.alumniId = alumni.alumni_id;

  row.dataset.email = alumni.current_email || "";
  row.dataset.fullName = fullName || "";

  row.innerHTML = `
    <input type="checkbox">
    <div class="name-cell">
      <span class="icon-tooltip-wrapper" data-tooltip="${alumni.current_email || 'No email on record'}">
        <img src="assets/email popup.png" alt="Email">
      </span>
      <span class="icon-tooltip-wrapper" data-tooltip="${alumni.phone_number ? '0' + alumni.phone_number : 'No number on record'}">
        <img src="assets/number popup.png" alt="Phone">
      </span>
      <span class="icon-tooltip-wrapper" data-tooltip="${alumni.current_address || 'No address on record'}">
        <img src="assets/location popup.png" alt="Address">
      </span>
      <p>${fullName}</p>
    </div>
    <p>${alumni.gender || "—"}</p>
    <p>${alumni.student_number}</p>
    <p>${formatDate(alumni.entry_date)}</p>
    <div class="orgs-cell">${orgsHTML}</div>
    <div class="work-cell">${workCellHTML}</div>
    <div class="grad-cell">${gradHTML}</div>
    <div class="action-cell">
      <img src="assets/edit.png" alt="Edit" style="cursor:pointer;" onclick="editAlumni('${alumni.alumni_id}')">
      <img src="assets/trash.png" alt="Delete" onclick="deleteAlumni('${alumni.alumni_id}')">
    </div>
  `;

  // Toggle collapsed employment rows
  const toggleBtn = row.querySelector(".toggle-emp");
  if (toggleBtn) {
    const empEntries = row.querySelector(".emp-entries");
    toggleBtn.addEventListener("click", () => {
      empEntries.classList.toggle("collapsed");
      toggleBtn.classList.toggle("rotated");
    });
  }

  return row;
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${year}`;
}

// Display alumni table once page loads
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("alumni-table-body");

  if (tableBody) {
    getAlumnis();

    // Update selected count after checkbox
    tableBody.addEventListener("change", (e) => {
      if (e.target.type === "checkbox") updateSelectedCount();
    });
  }

  // Header checkbox to select/deselect all alumni entries
  const headerCheckbox = document.querySelector(".header-checkbox");

  if (headerCheckbox) {
    headerCheckbox.addEventListener("change", () => {
      tableBody
        .querySelectorAll(".alumni-row input[type='checkbox']")
        .forEach((box) => {
          box.checked = headerCheckbox.checked;
        });
      updateSelectedCount();
    });
  }
});

function updateSelectedCount() {
  const checked = document.querySelectorAll(
    ".alumni-row input[type='checkbox']:checked",
  );
  const checkedCount = document.getElementById("selected-label");
  if (checkedCount) {
    checkedCount.textContent = `${checked.length}`;
  }
}

function exportEmails() {
  let targetRows = [
    ...document.querySelectorAll(".alumni-row input[type='checkbox']:checked"),
  ].map((box) => box.closest(".alumni-row"));
  
  if (targetRows.length == 0) {
    targetRows = [...document.querySelectorAll(".alumni-row")];
  }

  const exportRecords = targetRows.map((row) => {
    const email = row.dataset.email;
    const name = row.dataset.fullName || "";
    
    // Skip rows that don't have an email attached
    if (!email) return null;
    
    // Wrap strings in double quotes to prevent commas in names from breaking the CSV
    return `"${name}","${email}"`;
  }).filter(Boolean);

  if (exportRecords.length === 0) {
    alert("No valid email addresses found in the selected records.");
    return;
  }

  // Include header row with two columns
  const csv = ["Full Name,Email Address", ...exportRecords].join("\n");
  
  // Use UTF-8 encoding marker to ensure special characters render correctly in Excel
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
  
  const downloadCSV = document.createElement("a");
  const url = URL.createObjectURL(blob);
  downloadCSV.href = url;
  downloadCSV.download = "upse_alumni_emails.csv";
  downloadCSV.click();

  URL.revokeObjectURL(url);
}

// Add Records Tab view switching
function showView(view) {
  const views = ["excel", "add", "confirm"];
  const sidebar = {
    excel: "sidebar-excel",
    add: "sidebar-add",
    confirm: "sidebar-confirm",
  };

  views.forEach((v) => {
    const el = document.getElementById("view-" + v);
    if (el)
      el.style.display =
        v === view ? (v === "excel" ? "block" : "flex") : "none";
    const sidebarEl = document.getElementById(sidebar[v]);
    if (sidebarEl) sidebarEl.classList.toggle("active-sidebar", v === view);
  });
}

async function loadSampleExcelData() {
  const wrapper = document.getElementById("excel-table-wrapper");
  const body = document.getElementById("import-table-body");

  // If already visible, don't re-upload
  if (wrapper.style.display === "block") return;

  // Create a hidden file input
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx,.xls,.csv";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `http://localhost:${portNumberBackEnd}/upload-excel`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();
      console.log("Excel upload response:", result);

      if (!response.ok) {
        alert(result.error || "Upload failed");
        return;
      }

      const rows = result.data || [];

      body.innerHTML = rows
        .map(
          (row) => `
        <div class="alumni-row">
          <input type="checkbox">
          <div class="name-cell">
            <p>${row.first_name || ""} ${row.last_name || ""}</p>
          </div>
          <p>${row.gender || "—"}</p>
          <p>${row.student_number || "—"}</p>
          <p>${row.entry_date || "—"}</p>
          <div class="orgs-cell"><p>—</p></div>
          <div class="work-cell"><p>—</p></div>
          <div class="grad-cell"><p>—</p></div>
          <div><p>—</p></div>
        </div>
      `,
        )
        .join("");

      wrapper.style.display = "block";
    } catch (err) {
      console.log("Excel upload error:", err);
      alert("Upload failed");
    }
  };

  input.click();
}

// Start with Excel view when opening Add Records tab
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("sidebar-excel")) {
    showView("excel");
  }
});

function toggleAdminPanel() {
  const panel = document.getElementById("admin-panel");

  if (panel.style.display === "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }
}

// Filter dropdown

function toggleFilterMenu() {
  const menu = document.getElementById("filter-menu");
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  if (isOpen) closeAllPanels();
}

function closeFilterMenu() {
  const menu = document.getElementById("filter-menu");
  menu.style.display = "none";
  closeAllPanels();
}

function toggleFilterPanel(type) {
  const panel = document.getElementById("panel-" + type);
  const arrow = document.getElementById("arrow-" + type);
  const allPanels = ["sex", "studentNum", "entryDate"];

  allPanels.forEach((t) => {
    if (t !== type) {
      document.getElementById("panel-" + t).style.display = "none";
      document.getElementById("arrow-" + t).classList.remove("open");
    }
  });

  const isOpen = panel.style.display === "block";
  panel.style.display = isOpen ? "none" : "block";
  arrow.classList.toggle("open", !isOpen);
}

function closeAllPanels() {
  ["sex", "studentNum", "entryDate"].forEach((t) => {
    document.getElementById("panel-" + t).style.display = "none";
    document.getElementById("arrow-" + t).classList.remove("open");
  });
}

function applyFilter(type) {
  if (type === "sex") {
    const checked = [...document.querySelectorAll('input[name="sex"]:checked')];
    if (checked.length === 0) { alert("Please select at least one option."); return; }
    
    // Create the expected object
    checked.forEach(cb => {
        addFilter(["gender"], { gender: cb.value, flag: "include" });
    });

  } else if (type === "studentNum") {
    const from = document.getElementById("filter-studentNum-from").value.trim();
    const to   = document.getElementById("filter-studentNum-to").value.trim();
    if (!from && !to) { alert("Please enter at least one year."); return; }
    
    // Parse years as integers, null if left blank
    const filterObj = {
        start: from ? parseInt(from) : null,
        end: to ? parseInt(to) : null,
        flag: "include"
    };
    addFilter(["studentNum"], filterObj);

  } else if (type === "entryDate") {
    const from = document.getElementById("filter-entryDate-from").value.trim();
    const to   = document.getElementById("filter-entryDate-to").value.trim();
    if (!from && !to) { alert("Please enter at least one date."); return; }

    // Helper to format MM/YYYY to YYYY-MM-DD
    const formatForBackend = (val) => {
        if (!val || !val.includes('/')) return null;
        const [month, year] = val.split('/');
        return `${year}-${month.padStart(2, '0')}-01`;
    };

    const filterObj = {
        start: formatForBackend(from) || null,
        end: formatForBackend(to) || null,
        flag: "include"
    };
    addFilter(["entryDate"], filterObj);
  }

  renderActiveFilters();
  closeFilterMenu();
  getAlumnis();
}

function renderActiveFilters() {
  const filters = JSON.parse(localStorage.getItem("filters")) || blankFilters;
  const container = document.getElementById("active-filters-list");
  if (!container) return;

  const tags = [];

  (filters.gender || []).forEach(v => {
      tags.push({ label: `Sex: ${v.gender}`, type: "gender", value: v });
  });

  (filters.studentNum || []).forEach(v => {
      const start = v.start || '...';
      const end = v.end || '...';
      const label = start === end ? `${start}` : `${start} – ${end}`;
      tags.push({ label: `Student No.: ${label}`, type: "studentNum", value: v });
  });

  (filters.entryDate || []).forEach(v => {
      const formatForDisplay = (val) => {
          if (!val) return '...';
          const parts = val.split('-');
          return parts.length >= 2 ? `${parts[1]}/${parts[0]}` : val;
      };
      
      const start = formatForDisplay(v.start);
      const end = formatForDisplay(v.end);
      const label = start === end ? `${start}` : `${start} – ${end}`;
      tags.push({ label: `Entry Date: ${label}`, type: "entryDate", value: v });
  });

  container.innerHTML = tags.map(t => `
    <span class="filter-tag">
      ${t.label}
      <button onclick="removeFilter('${t.type}', '${encodeURIComponent(JSON.stringify(t.value))}')"
              title="Remove filter">&#x2715;</button>
    </span>`).join("");
}

function removeFilter(type, valueStr) {
  // Decode the object we attached to the button
  const valueObj = JSON.parse(decodeURIComponent(valueStr));
  deleteFilter([type], valueObj);
  renderActiveFilters();
  getAlumnis();
}

function clearAllFilters() {
  localStorage.setItem("filters", JSON.stringify(blankFilters));
  renderActiveFilters();
  closeFilterMenu();
  getAlumnis();
}

// Close filter menu when clicking outside
document.addEventListener("click", (e) => {
  const wrapper = document.getElementById("filter-dropdown-wrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    closeFilterMenu();
  }
});

// Render any persisted filters on page load
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("filter-menu")) {
    renderActiveFilters();
  }
});

// EDIT RECORDS

function editAlumni(alumniId) {
  const alumni = alumniCache[alumniId];
  if (!alumni) {
    alert("Could not load alumni data. Please reload the page.");
    return;
  }
  sessionStorage.setItem("editAlumni", JSON.stringify(alumni));
  window.location.href = "edit-records.html";
}

// ── Pre-fill helpers ─────────────────────────────────────────────

function toMMYYYY(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
}

function makeSemYearLabel(sem, year) {
  if (!sem && !year) return "";
  const semStr = sem === 1 ? "1st" : sem === 2 ? "2nd" : sem === 3 ? "Mid" : "";
  return semStr && year ? `${semStr} Sem, ${year}` : (semStr || String(year) || "");
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Builds an org row pre-filled with a value (and optional org_id stored as data attr)
function buildOrgRow(orgName = "", orgId = null) {
  const div = document.createElement("div");
  div.className = "organization-row";
  if (orgId !== null) div.dataset.orgId = orgId;
  div.innerHTML = `
    <div>
      <label>Organization</label>
      <input type="text" placeholder="Organization" value="${escHtml(orgName)}">
    </div>
    <button type="button" class="circle-btn minus" onclick="removeRow(this)">
      <i class="fas fa-minus"></i>
    </button>`;
  return div;
}

function buildEmploymentRow(emp = {}) {
  const start = toMMYYYY(emp.start_date || "");
  const end   = emp.is_current ? "Present" : toMMYYYY(emp.end_date || "");
  const div = document.createElement("div");
  div.className = "employment-row";
  if (emp.employment_id != null) div.dataset.employmentId = emp.employment_id;
  div.innerHTML = `
    <div>
      <label>Employer</label>
      <input type="text" placeholder="e.g. Google, Inc." value="${escHtml(emp.employer || "")}">
    </div>
    <div>
      <label>Last Position Held</label>
      <input type="text" placeholder="e.g. Head Software Engineer" value="${escHtml(emp.last_position_held || "")}">
    </div>
    <div>
      <label>Start of Employment</label>
      <input type="text" placeholder="MM/YYYY" value="${escHtml(start)}">
    </div>
    <div>
      <label>End of Employment</label>
      <input type="text" placeholder="MM/YYYY" value="${escHtml(end)}">
    </div>
    <button type="button" class="circle-btn minus" onclick="removeRow(this)">
      <i class="fas fa-minus"></i>
    </button>`;
  return div;
}

function buildGraduateRow(g = {}, degName = "") {
  const gradYear   = makeSemYearLabel(g.semester_graduated, g.year_graduated);
  const startLabel = makeSemYearLabel(g.semester_started,   g.year_started);

  // Map snake_case DB value back to select option text
  const honorMap = {
    "cum_laude": "Cum Laude", "magna_cum_laude": "Magna Cum Laude",
    "summa_cum_laude": "Summa Cum Laude",
    "Cum Laude": "Cum Laude", "Magna Cum Laude": "Magna Cum Laude",
    "Summa Cum Laude": "Summa Cum Laude",
  };
  const honor = honorMap[g.latin_honor || ""] || "";

  const honorOptions = ["N/A", "Cum Laude", "Magna Cum Laude", "Summa Cum Laude"]
    .map(o => `<option value="${o}" ${honor === o ? "selected" : ""}>${o}</option>`)
    .join("");

  const div = document.createElement("div");
  div.className = "graduate-row";
  if (g.graduation_id != null) div.dataset.graduationId = g.graduation_id;
  div.innerHTML = `
    <div>
      <label>Degree</label>
      <input type="text" placeholder="BS Economics" value="${escHtml(degName)}">
      <small class="input-hint">*Don't abbreviate your academic program</small>
    </div>
    <div>
      <label>Latin Honors</label>
      <select class="latin-honors" required>
        <option value="" disabled ${!honor ? "selected hidden" : ""}>Select...</option>
        ${honorOptions}
      </select>
    </div>
    <div>
      <label>University Studied</label>
      <input type="text" placeholder="e.g. University of the Philippines"
             value="${escHtml(g.granting_university || "")}">
    </div>
    <div>
      <label>Year and Semester Started</label>
      <input type="text" placeholder="1st Sem, 2026" value="${escHtml(startLabel)}">
    </div>
    <div>
      <label>Year and Semester Graduated</label>
      <input type="text" placeholder="2nd Sem, 2030" value="${escHtml(gradYear)}">
    </div>
    <button type="button" class="circle-btn minus" onclick="removeRow(this)">
      <i class="fas fa-minus"></i>
    </button>`;
  return div;
}

// ── Pre-fill the edit form from sessionStorage ───────────────────

function prefillEditForm() {
  const raw = sessionStorage.getItem("editAlumni");
  if (!raw) {
    alert("No alumni data found. Returning to records.");
    window.location.href = "index.html";
    return;
  }

  const a = JSON.parse(raw);
  const form = document.querySelector(".alumni-form");
  const getInput = (ph) => form.querySelector(`input[placeholder="${ph}"]`);

  // Basic fields
  if (getInput("First Name"))     getInput("First Name").value     = a.first_name      || "";
  if (getInput("Last Name"))      getInput("Last Name").value      = a.last_name        || "";
  if (getInput("M.I."))           getInput("M.I.").value           = a.middle_name      || "";
  if (getInput("Jr., III, etc.")) getInput("Jr., III, etc.").value = a.suffix           || "";
  if (getInput("Maiden Name"))    getInput("Maiden Name").value    = a.maiden_name      || "";
  if (getInput("jdelacruz@up.edu.ph")) getInput("jdelacruz@up.edu.ph").value = a.current_email  || "";
  if (getInput("e.g. 09XXXXXXXXX"))    getInput("e.g. 09XXXXXXXXX").value    = a.phone_number   || "";
  if (getInput("Your Home Address"))   getInput("Your Home Address").value   = a.current_address || "";
  if (getInput("xxxx-xxxxx"))          getInput("xxxx-xxxxx").value          = a.student_number  || "";
  if (getInput("MM/YYYY"))             getInput("MM/YYYY").value             = toMMYYYY(a.entry_date || "");

  // Sex dropdown
  const sexSelect = form.querySelector("select.sex");
  if (sexSelect && a.gender) sexSelect.value = a.gender;

  // Organizations
  const orgContainer = document.getElementById("organization-container");
  if (orgContainer) {
    orgContainer.innerHTML = "";
    const orgs = a.active_orgs || [];
    if (orgs.length === 0) {
      orgContainer.appendChild(buildOrgRow());
    } else {
      orgs.forEach(org => {
        const name = typeof org === "object" ? org.organization_name : org;
        const id   = typeof org === "object" ? org.org_id : null;
        orgContainer.appendChild(buildOrgRow(name, id));
      });
    }
  }

  // Employment
  const empContainer = document.getElementById("employment-container");
  if (empContainer) {
    empContainer.innerHTML = "";
    const emps = a.employment_hist || [];
    if (emps.length === 0) {
      empContainer.appendChild(buildEmploymentRow());
    } else {
      emps.forEach(emp => empContainer.appendChild(buildEmploymentRow(emp)));
    }
  }

  // Academic history
  const gradContainer = document.getElementById("graduate-container");
  if (gradContainer) {
    gradContainer.innerHTML = "";
    const gradInfos = a.academic_hist || [];
    if (gradInfos.length === 0) {
      gradContainer.appendChild(buildGraduateRow());
    } else {
      gradInfos.forEach(g => gradContainer.appendChild(buildGraduateRow(g, g.degree_name || "")));
    }
  }

  // Academic achievements
  const achieveInput = form.querySelector('input[placeholder="e.g. Best Thesis Awardee, Dean\'s Lister, etc."]');
  if (achieveInput) achieveInput.value = a.academic_achievements || "";
}

// ── Collect form data and call updateAlumni ──────────────────────

async function saveEdit() {
  const raw = sessionStorage.getItem("editAlumni");
  if (!raw) { alert("Session expired. Please go back to Records."); return; }
  const original = JSON.parse(raw);

  const form = document.querySelector(".alumni-form");
  const getVal = (sel) => {
    const el = form.querySelector(sel);
    return el ? (el.value.trim() || null) : null;
  };

  // ── alumni_info ────────────────────────────────────────────────
  const alumni_info = {
    alumni_id:    original.alumni_id,
    first_name:   getVal('input[placeholder="First Name"]'),
    last_name:    getVal('input[placeholder="Last Name"]'),
    middle_name:  getVal('input[placeholder="M.I."]'),
    suffix:       getVal('input[placeholder="Jr., III, etc."]'),
    maiden_name:  getVal('input[placeholder="Maiden Name"]'),
    gender:       getVal('select.sex'),
    current_email:   getVal('input[placeholder="jdelacruz@up.edu.ph"]'),
    phone_number:    (() => {
      let p = getVal('input[placeholder="e.g. 09XXXXXXXXX"]');
      if (!p) return null;
      p = p.replace(/[-\s]/g, "");
      if (p.startsWith("0") && p.length === 11) p = p.substring(1);
      else if (p.startsWith("+63")) p = p.substring(3);
      return p;
    })(),
    current_address: getVal('input[placeholder="Your Home Address"]'),
    student_number:  getVal('input[placeholder="xxxx-xxxxx"]'),
    entry_date: (() => {
      const raw = getVal('input[placeholder="MM/YYYY"]');
      if (!raw) return null;
      if (raw.includes("/")) {
        const [m, y] = raw.split("/");
        return `${y}-${m.padStart(2, "0")}-01`;
      }
      return raw;
    })(),
    academic_achievements: getVal('input[placeholder="e.g. Best Thesis Awardee, Dean\'s Lister, etc."]'),
  };

  // ── employment_hist ────────────────────────────────────────────
  const origEmpIds = new Set((original.employment_hist || []).map(e => String(e.employment_id)));
  const seenEmpIds = new Set();

  const convertDate = (val) => {
    if (!val || val.toLowerCase() === "present") return null;
    if (val.includes("/")) { const [m, y] = val.split("/"); return `${y}-${m.padStart(2,"0")}-01`; }
    if (val.length === 4) return `${val}-01-01`;
    return null;
  };

  const parseYear = (str) => { const m = str?.match(/\b\d{4}\b/); return m ? parseInt(m[0]) : null; };
  const parseSem  = (str) => {
    if (!str) return null;
    const l = str.toLowerCase();
    if (l.includes("1st") || l.startsWith("1")) return 1;
    if (l.includes("2nd") || l.startsWith("2")) return 2;
    if (l.includes("mid") || l.includes("3rd") || l.startsWith("3")) return 3;
    return null;
  };

  const employment_hist = [];

  document.querySelectorAll("#employment-container .employment-row").forEach(row => {
    const employer  = row.querySelector('input[placeholder="e.g. Google, Inc."]')?.value.trim() || null;
    const position  = row.querySelector('input[placeholder="e.g. Head Software Engineer"]')?.value.trim() || null;
    const dates     = row.querySelectorAll('input[placeholder="MM/YYYY"]');
    const startRaw  = dates[0]?.value.trim() || "";
    const endRaw    = dates[1]?.value.trim() || "";
    const isPresent = endRaw.toLowerCase() === "present" || endRaw === "";

    if (!employer && !position) return;

    const empId = row.dataset.employmentId ? parseInt(row.dataset.employmentId) : -1;
    if (empId > 0) seenEmpIds.add(String(empId));

    employment_hist.push({
      employment_id:     empId,
      employer,
      last_position_held: position,
      start_date:  convertDate(startRaw),
      end_date:    isPresent ? null : convertDate(endRaw),
      is_current:  isPresent,
    });
  });

  // Mark deleted employment entries
  for (const id of origEmpIds) {
    if (!seenEmpIds.has(id)) {
      employment_hist.push({ employment_id: -2, idToDelete: parseInt(id) });
    }
  }

  // ── academic_hist ──────────────────────────────────────────────
  const origGradIds = new Set((original.academic_hist || []).map(g => String(g.graduation_id)));
  const seenGradIds = new Set();
  const academic_hist = [];

  document.querySelectorAll("#graduate-container .graduate-row").forEach(row => {
    const degree      = row.querySelector('input[placeholder="BS Economics"]')?.value.trim() || null;
    const university  = row.querySelector('input[placeholder="e.g. University of the Philippines"]')?.value.trim() || null;
    const latinRaw    = row.querySelector("select.latin-honors")?.value || null;
    const latin_honor = (!latinRaw || latinRaw === "N/A") ? null : latinRaw.toLowerCase().replace(/ /g, "_");
    const startStr    = row.querySelector('input[placeholder="1st Sem, 2026"]')?.value.trim() || "";
    const gradStr     = row.querySelector('input[placeholder="2nd Sem, 2030"]')?.value.trim() || "";

    if (!degree && !startStr && !gradStr) return;

    const gradId = row.dataset.graduationId ? parseInt(row.dataset.graduationId) : -1;
    if (gradId > 0) seenGradIds.add(String(gradId));

    academic_hist.push({
      graduation_id:      gradId,
      degree_name:        degree,
      granting_university: university,
      latin_honor,
      year_started:       parseYear(startStr),
      semester_started:   parseSem(startStr),
      year_graduated:     parseYear(gradStr),
      semester_graduated: parseSem(gradStr),
    });
  });

  // Mark deleted academic entries
  for (const id of origGradIds) {
    if (!seenGradIds.has(id)) {
      academic_hist.push({ graduation_id: -2, idToDelete: parseInt(id) });
    }
  }

  // ── active_orgs ────────────────────────────────────────────────
  const origOrgIds = new Set((original.active_orgs || []).map(o => String(o.org_id)));
  const seenOrgIds = new Set();
  const active_orgs = [];

  document.querySelectorAll("#organization-container .organization-row").forEach(row => {
    const name = row.querySelector('input[placeholder="Organization"]')?.value.trim() || null;
    if (!name) return;

    const orgId = row.dataset.orgId ? parseInt(row.dataset.orgId) : -1;
    if (orgId > 0) seenOrgIds.add(String(orgId));

    active_orgs.push({ org_id: orgId, organization_name: name });
  });

  // Mark deleted org entries
  for (const id of origOrgIds) {
    if (!seenOrgIds.has(id)) {
      active_orgs.push({ org_id: -2, idToDelete: parseInt(id) });
    }
  }

  // ── Send to server ─────────────────────────────────────────────
  const payload = { alumni_info, academic_hist, employment_hist, active_orgs };

  await updateAlumni(payload);

  // Update sessionStorage so a second Save reflects new state
  sessionStorage.setItem("editAlumni", JSON.stringify({
    ...original,
    ...alumni_info,
    employment_hist: employment_hist.filter(e => e.employment_id !== -2),
    academic_hist:   academic_hist.filter(g => g.graduation_id !== -2),
    active_orgs:     active_orgs.filter(o => o.org_id !== -2),
  }));
}

// Initialise edit form if on the edit page
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".alumni-form") && sessionStorage.getItem("editAlumni")) {
    // Only prefill on edit-records.html (not add-records.html which has no session data)
    if (window.location.pathname.includes("edit-records")) {
      prefillEditForm();
    }
  }

  // Wire Cancel / Save buttons on the edit page
  const cancelBtn = document.querySelector(".cancel-btn");
  const saveBtn   = document.querySelectorAll("#edit-save-cancel .add-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      sessionStorage.removeItem("editAlumni");
      window.location.href = "index.html";
    });
  }
  saveBtn.forEach(btn => btn.addEventListener("click", saveEdit));
});