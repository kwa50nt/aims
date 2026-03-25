const portNumberBackEnd = 3001

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
      <label>End</label>
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
      <input type="text" placeholder="Degree">
    </div>

    <div>
      <label>University Studied</label>
      <input type="text" placeholder="e.g. University of the Philippines">
    </div>

    <div>
      <label>Graduation Year</label>
      <input type="text" placeholder="MM/YYYY">
    </div>
    
    <div>
      <label>Year and Semester Started</label>
      <input type="text" placeholder="2nd Sem, 2026">
    </div>

    <div>
      <label>Semester Graduated</label>
      <select required>
        <option value="" disabled selected hidden>1st, 2nd</option>
        <option value="1st">1st</option>
        <option value="2nd">2nd</option>
      </select>
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
      <input type="text" placeholder="Another Organization">
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

async function addAlumni() {
  const form = document.querySelector(".alumni-form");

  const userEmail = form.querySelector('input[placeholder="Your Email"]').value;

  // Generate unique account email (for testing duplicate constraint)
  const randomSuffix = Math.floor(Math.random() * 100000);
  const accountEmail = `test+${randomSuffix}@example.com`;

  const graduationInfo = Array.from(
  document.querySelectorAll("#graduate-container .graduate-row")
)
  .map(row => {
    const degree = row.querySelector('input[placeholder="Degree"]').value.trim();
    const latinHonor = row.querySelector('input[placeholder="Latin Honor"]').value.trim();

    const gradYearInput = row.querySelector('input[placeholder="MM/YYYY"]').value.trim();
    const yearStartedInput = row.querySelector('input[placeholder="YYYY"]').value.trim();

    const year_graduated =
      gradYearInput && gradYearInput.includes("/")
        ? parseInt(gradYearInput.split("/")[1])
        : null;

    const year_started =
      parseInt(yearStartedInput) ? parseInt(yearStartedInput) > 999 ? parseInt(yearStartedInput) :"wrong" :null;
    const selects = row.querySelectorAll("select");

    const semester_started =
      selects[0]?.value === "1st" ? 1 :
      selects[0]?.value === "2nd" ? 2 :
      null;

    const semester_graduated =
      selects[1]?.value === "1st" ? 1 :
      selects[1]?.value === "2nd" ? 2 :
      null;

    // Skip completely empty rows
    if (!degree && !year_started && !year_graduated) return null;

    return {
      degree_name: degree,
      year_started,
      semester_started,
      year_graduated,
      semester_graduated,
      latin_honor: latinHonor || null
    };
  })
  .filter(Boolean);

  const employmentHist = Array.from(
    document.querySelectorAll("#employment-container .employment-row")
  )
    .map(row => {
      const employer = row.querySelector('input[placeholder="Employer"]').value.trim() === "" 
        ? null 
        : row.querySelector('input[placeholder="Employer"]').value.trim();
      const position = row.querySelector('input[placeholder="Position"]').value.trim() === "" 
        ? null
        : row.querySelector('input[placeholder="Position"]').value.trim();

      const dateInputs = row.querySelectorAll('input[placeholder="MM/YYYY"]');

      const startRaw = dateInputs[0]?.value || "";
      const endRaw = dateInputs[1]?.value || "";

      const convertToSQLDate = (val) => {
        if (!val ) return null;
        if (!val.includes("/")) return val;
        const [month, year] = val.split("/");
        return `${year}-${month.padStart(2, "0")}-01`;
      };

      if (!employer && !position) return null; 

      return {
        employer,
        last_position_held: position,
        start_date: convertToSQLDate(startRaw),
        end_date: endRaw.toLowerCase() === "present"
          ? null
          : convertToSQLDate(endRaw),
        is_current: endRaw.toLowerCase() === "present"
      };
    })
    .filter(Boolean);
  const alumniDegs = graduationInfo.map(g => ({
    degree_name: g.degree_name
  }));

  const activeOrgsInput =
    form.querySelector('input[placeholder="Org1, org2, org3"]').value;

  const activeOrgs = activeOrgsInput
    .split(",")
    .map(org => org.trim())
    .filter(org => org.length > 0)
    .map(org => ({ organization_name: org }));

  const data = {
    email: accountEmail,
    password: "123456",
    last_name: form.querySelector('input[placeholder="Your Full Name"]').value.split(' ')[1] || null,
    first_name: form.querySelector('input[placeholder="Your Full Name"]').value.split(' ')[0] || null,
    middle_name: "",
    suffix: "",
    gender: form.querySelector('input[placeholder="Gender"]').value,
    student_number: form.querySelector('input[placeholder="xxxx-xxxxx"]').value ? form.querySelector('input[placeholder="xxxx-xxxxx"]').value:null,
    entry_date: form.querySelector('input[placeholder="DD/MM/YYYY"]').value ? form.querySelector('input[placeholder="DD/MM/YYYY"]').value : null,
    current_email: userEmail ? userEmail : null,
    phone_number: form.querySelector('input[placeholder="Your Number"]').value ? form.querySelector('input[placeholder="Your Number"]').value : null,
    current_address: form.querySelector('input[placeholder="Your Home Address"]').value ? form.querySelector('input[placeholder="Your Home Address"]').value : null,
    graduationInfo,
    employmentHist,
    alumniDegs,
    activeOrgs
  };

  try {
    const response = await fetch(`http://localhost:${portNumberBackEnd}/add-alumni`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    errorMsgParsing = {}
    errorMsgParsing["enum genders"] = "Invalid input for gender" 
    errorMsgParsing["null value in column \"entry_date\""] = "Please add entry date"
    errorMsgParsing["type date"] = "Please follow prescribed format for date"
    errorMsgParsing["violates check constraint \"email_format\""] = "Please input a valid email address"
    errorMsgParsing["phone_number_format"] = "Please input a valid number"
    errorMsgParsing["null value in column \"phone_number\""] = "Please input a number"
    errorMsgParsing["null value in column \"student_number\""] = "Please add a student number"
    errorMsgParsing["student_number_format"] = "Please follow student number format XXXX-XXXXX"
    errorMsgParsing["null value in column \"start_date\""] = "Please input a entry date for the employment history"
    errorMsgParsing["null value in column \"end_date\" "] = "Please input a end date for the employment history"
    errorMsgParsing["time field value out of range"] = "Please input valid date"
    errorMsgParsing["null value in column \"employer\" "] = "Please input an employer"
    errorMsgParsing["null value in column \"last_position_held\" "] = "Please input last position held"
    errorMsgParsing["duplicate key value violates unique constraint \"upsealumni_student_number_key\""] = "Student number already in system"
    errorMsgParsing["invalid input syntax for type integer: \"false\""] = "Please input a valid year"
    errorMsgParsing["null value in column \"year_started\""] = "Please input year started"
    errorMsgParsing["invalid input syntax for type integer: \"wrong\""] = "Please input valid year"
    errorMsgParsing["null value in column \"semester_started\""] = "Please select which semester started"
    errorMsgParsing["null value in column \"current_email\""] = "Please input an email"
    // errorMsgParsing["null value in column "] = "Please input year started"
    // errorMsgParsing["null value in column "] = "Please input year started"
    // errorMsgParsing["null value in column "] = "Please input year started"
    // errorMsgParsing["null value in column "] = "Please input year started"
    
    const fetched = await response.json();
    const errorMsg = fetched["error"]
    console.log("Server Response:", fetched);
    if (errorMsg != "None"){
      for (key in errorMsgParsing){
        if (errorMsg.includes(key)){
          alert(errorMsgParsing[key])
      }
      }     
    }
  } catch (err) {
    console.log("error adding alumni:", err);
  }
}

async function deleteAlumni(){
alumniId = "50"; // will work kahit wala sa databse 
  try {
    // fetching the server
    const response = await fetch(`http://localhost:${portNumberBackEnd}/delete-alumni/${alumniId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });


    // result of fetching
    const fetched = await response.json();
    console.log("Server Response:", fetched);
  }
  catch (err){
    console.log("error deleting alumni:", err);
  }
}

async function getAlumnis(sortBy = "none", order= "none"){
  try {
    // frontend: comment out the fetching and result of fetching para di mag error sainyo
    // fetching the server
    const response = await fetch(`http://localhost:${portNumberBackEnd}/get-alumnis?sortBy=${sortBy}&order=${order}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    // result of fetching
    const fetched = await response.json();
    console.log(JSON.stringify(fetched));
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
    const response = await fetch(`http://localhost:${portNumberBackEnd}/upload-excel`, {
      method: "POST",
      body: formData
    });

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

  // alumniData is in extracted from JSON format
  const entries = Object.values(alumniData);

  if (entries.length == 0) {
    main.innerHTML = `<p class="no-records">No alumni records.</p>`;
    return;
  }

  entries.forEach(alumni => {
    main.appendChild(renderAlumniRow(alumni));
  })
}

function renderAlumniRow(alumni) {
  // Name
  const fullName = [alumni.first_name, alumni.middle_name, alumni.last_name, alumni.suffix].filter(Boolean).join(" ");

  // Organizations
  const orgsHTML = (alumni.activeOrgs || []).map(org => {
    const name = typeof org === "object" ? org.organization_name : org;
    return `
      <div class="mini-info">
        <img src="assets/black-circle.png" alt="">
        <p>${name}</p>
      </div>`;
  }).join("") || "<p>—</p>";

  // Employment
  const employments = alumni.employmentHist || [];
  const sorted = [...employments].sort((a, b) => b.is_current - a.is_current);
  const empHTML = sorted.map(emp => `
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
    </div>`).join("") || "<p>—</p>";

  const workCellHTML = employments.length > 1
    ? `<img src="assets/CaretCircleDown.png" alt="" class="toggle-emp" title="Toggle all employment">
       <div class="emp-entries collapsed">${empHTML}</div>`
    : `<div class="emp-entries">${empHTML}</div>`;

  // Graduation info
  const gradInfos = alumni.graduationInfo || [];
  const degrees = alumni.alumniDegs || [];

  const gradHTML = gradInfos.map((g, i) => {
    const degree = degrees[i] ? (typeof degrees[i] === "object" ? degrees[i].degree_name : degrees[i]) : null;
    const honor = g.latin_honor;
    const gradYear = g.year_graduated
      ? `${g.semester_graduated === 1 ? "01" : "06"}/${g.year_graduated}`
      : null;

    return `
      ${degree ? `<div class="mini-info"><img src="assets/GraduationCap.png" alt=""><p>${degree}</p></div>` : ""}
      ${honor ? `<div class="mini-info"><img src="assets/Student.png" alt=""><p>${honor}</p></div>` : ""}
      ${gradYear ? `<div class="mini-info"><img src="assets/calendar.png" alt=""><p>${gradYear}</p></div>` : ""}
    `;
  }).join("") || "<p>—</p>";

  // Row element
  const row = document.createElement("div");
  row.className = "alumni-row";
  row.dataset.alumniId = alumni.alumni_id;
  // store email to make exporting easier
  row.dataset.email = alumni.current_email || "";

  row.innerHTML = `
    <input type="checkbox">
    <div class="name-cell">
      <img src="assets/email popup.png" alt="" title="${alumni.current_email}">
      <img src="assets/number popup.png" alt="" title="${alumni.phone_number}">
      <img src="assets/location popup.png" alt="" title="${alumni.current_address || 'No address on record'}">
      <p>${fullName}</p>
    </div>
    <p>${alumni.gender || "—"}</p>
    <p>${alumni.student_number}</p>
    <p>${formatDate(alumni.entry_date)}</p>
    <div class="orgs-cell">${orgsHTML}</div>
    <div class="work-cell">${workCellHTML}</div>
    <div class="grad-cell">${gradHTML}</div>
    <div class="action-cell">
      <a href="edit-records.html"><img src="assets/edit.png" alt="Edit"></a>
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
      tableBody.querySelectorAll(".alumni-row input[type='checkbox']").forEach(box => {
        box.checked = headerCheckbox.checked;
      })
      updateSelectedCount();
    })
  }
});

function updateSelectedCount() {
  const checked = document.querySelectorAll(".alumni-row input[type='checkbox']:checked");
  const checkedCount = document.getElementById("selected-label");
  if (checkedCount) {
    checkedCount.textContent = `${checked.length}`;
  }
}

function exportEmails() {
  let targetRows = [...document.querySelectorAll(".alumni-row input[type='checkbox']:checked")].map(box => box.closest(".alumni-row"));
  if (targetRows.length == 0) {
    targetRows = [...document.querySelectorAll(".alumni-row")];
  }

  const emails = targetRows.map(row => row.dataset.email).filter(Boolean);

  if (emails.length === 0) {
    alert("No email addresses found in the selected records.");
    return;
  }

  const csv = ["UPSE Alumni Email Addresses", ...emails].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const downloadCSV = document.createElement("a");
  const url = URL.createObjectURL(blob);
  downloadCSV.href = url;
  downloadCSV.download = "upse_alumni_emails.csv";
  downloadCSV.click();

  URL.revokeObjectURL(url);
}

// Add Records Tab view switching
function showView(view) {
  const views = ['excel', 'add', 'confirm'];
  const sidebar = { excel: 'sidebar-excel', add: 'sidebar-add', confirm: 'sidebar-confirm' };

  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.style.display = (v === view) ? (v === 'excel' ? 'block' : 'flex') : 'none';
    const sidebarEl = document.getElementById(sidebar[v]);
    if (sidebarEl) sidebarEl.classList.toggle('active-sidebar', v === view);
  });
}

async function loadSampleExcelData() {
  const wrapper = document.getElementById('excel-table-wrapper');
  const body = document.getElementById('import-table-body');

  // If already visible, don't re-upload
  if (wrapper.style.display === 'block') return;

  // Create a hidden file input
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx,.xls";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:${portNumberBackEnd}/upload-excel`, {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      console.log("Excel upload response:", result);

      if (!response.ok) {
        alert(result.error || "Upload failed");
        return;
      }

      // OPTIONAL: render preview if backend returns data
      const rows = result.data || [];

      body.innerHTML = rows.map(row => `
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
      `).join("");

      wrapper.style.display = 'block';

    } catch (err) {
      console.log("Excel upload error:", err);
      alert("Upload failed");
    }
  };

  input.click();
}


// Start with Excel view when opening Add Records tab
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById('sidebar-excel')) {
    showView('excel');
  }
});

function toggleAdminPanel() {
    const panel = document.getElementById("admin-panel");

    if(panel.style.display === "block"){
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
}