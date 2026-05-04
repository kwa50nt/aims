let isEditing = false;
let formSnapshot = "";
let currentData = null;

// Decode JWT to get email 

function getEmailFromToken() {
  const token = localStorage.getItem("aims_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email;
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("aims_token");
}

// Format date from ISO to MM/YYYY

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${year}`;
}

// Convert MM/YYYY to YYYY-MM-DD for the backend

function toSQLDate(str) {
  if (!str) return null;
  const [month, year] = str.split("/");
  return `${year}-${month.padStart(2, "0")}-01`;
}

// Load and populate profile data from backend

async function loadProfile() {
  const token = getToken();
  try {
    const res = await fetch("http://localhost:3001/alumni-profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 404) {
      // No alumni record linked — show empty edit form
      currentData = null;
      populateProfile({
        first_name: "", last_name: "", middle_name: "", suffix: "",
        gender: "", current_email: "", phone_number: "", current_address: "",
        student_number: "", entry_date: "",
        academicHist: [], employmentHist: [], activeOrgs: []
      });
      // Auto-enter edit mode so they can fill it in
      toggleEdit();
      // Change save button label to make it clear
      document.getElementById("save-btn").innerText = "Submit Profile";
      return;
    }

    currentData = await res.json();
    populateProfile(currentData);

  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

function populateProfile(data) {
  const set = (key, val) => {
    const el = document.querySelector(`.data-field[data-key="${key}"]`);
    if (el) el.innerText = val || "";
  };

  set("fname",   data.first_name);
  set("lname",   data.last_name);
  set("mi",      data.middle_name);
  set("suffix",  data.suffix);
  set("sex",     data.gender);
  set("email",   data.current_email);
  set("mobile",  data.phone_number);
  set("address", data.current_address);
  set("sno",     data.student_number);
  set("entry",   formatDate(data.entry_date));

  // Organizations
  const orgContainer = document.getElementById("organization-container");
  orgContainer.innerHTML = "";
  (data.activeOrgs || []).forEach(org => {
    orgContainer.appendChild(makeOrgRow(org.organization_name));
  });
  if (data.activeOrgs.length === 0) orgContainer.appendChild(makeOrgRow(""));

  // Employment
  const empContainer = document.getElementById("employment-container");
  empContainer.innerHTML = "";
  (data.employmentHist || []).forEach(e => {
    empContainer.appendChild(makeEmpRow(
      e.employer, e.last_position_held,
      formatDate(e.start_date), formatDate(e.end_date)
    ));
  });
  if (data.employmentHist.length === 0) empContainer.appendChild(makeEmpRow("","","",""));

  // Academic history
  const gradContainer = document.getElementById("graduate-container");
  const achieveRow = gradContainer.querySelector(".achievements-row");
  // Remove old grad rows but keep achievements row
  gradContainer.querySelectorAll(".graduate-row").forEach(r => r.remove());
  (data.academicHist || []).forEach(a => {
    gradContainer.insertBefore(makeGradRow(a), achieveRow);
  });
  if (data.academicHist.length === 0) gradContainer.insertBefore(makeGradRow({}), achieveRow);
}

// Row builders

function makeOrgRow(value) {
  const div = document.createElement("div");
  div.className = "organization-row";
  div.innerHTML = `
    <div class="data-group">
      <label>Organization</label>
      <div class="data-field" data-key="org">${value}</div>
    </div>
    <button type="button" class="circle-btn minus" onclick="removeRow(this)" style="display:none;">
      <i class="fas fa-minus"></i>
    </button>`;
  return div;
}

function makeEmpRow(employer, position, start, end) {
  const div = document.createElement("div");
  div.className = "employment-row";
  div.innerHTML = `
    <div class="data-group"><label>Employer</label><div class="data-field" data-key="emp">${employer}</div></div>
    <div class="data-group"><label>Last Position Held</label><div class="data-field" data-key="pos">${position}</div></div>
    <div class="data-group"><label>Start of Employment</label><div class="data-field" data-key="empstart">${start}</div></div>
    <div class="data-group"><label>End of Employment</label><div class="data-field" data-key="empend">${end}</div></div>
    <button type="button" class="circle-btn minus" onclick="removeRow(this)" style="display:none;">
      <i class="fas fa-minus"></i>
    </button>`;
  return div;
}

function makeGradRow(a) {
  const div = document.createElement("div");
  div.className = "graduate-row";
  div.innerHTML = `
    <div class="data-group"><label>Degree</label><div class="data-field" data-key="deg">${a.degree_name || ""}</div></div>
    <div class="data-group"><label>Latin Honors</label><div class="data-field" data-key="hon">${a.latin_honor || ""}</div></div>
    <div class="data-group"><label>University Studied</label><div class="data-field" data-key="univ">${a.granting_university || ""}</div></div>
    <div class="data-group"><label>Year and Semester Started</label><div class="data-field" data-key="semstart">${a.year_started && a.semester_started ? (a.semester_started === 1 ? "1st" : "2nd") + " Sem, " + a.year_started : ""}</div></div>
    <div class="data-group"><label>Year and Semester Graduated</label><div class="data-field" data-key="semend">${a.year_graduated && a.semester_graduated ? (a.semester_graduated === 1 ? "1st" : "2nd") + " Sem, " + a.year_graduated : ""}</div></div>
    <button type="button" class="circle-btn minus" onclick="removeRow(this)" style="display:none;">
      <i class="fas fa-minus"></i>
    </button>`;
  return div;
}

// Toggle edit mode

function toggleEdit() {
  const container = document.querySelector(".profile-container");
  const form = document.getElementById("profile-form");
  const editBtn = document.getElementById("edit-cancel-btn");
  const saveBtn = document.getElementById("save-btn");

  if (!isEditing) {
    isEditing = true;
    formSnapshot = form.innerHTML;
    container.classList.add("editing");
    editBtn.innerText = "Cancel";
    editBtn.classList.add("cancel-mode");
    saveBtn.style.display = "block";

    // Show all minus buttons
    form.querySelectorAll(".circle-btn.minus").forEach(b => b.style.display = "block");
    form.querySelectorAll(".add-row-btn").forEach(b => b.style.display = "block");

    // Convert data-fields to inputs
    // Convert text to inputs with placeholders
    const fields = form.querySelectorAll('.data-field');
    fields.forEach(field => {
    const currentValue = field.innerText.trim();
    const key = field.dataset.key;

    // Map data-keys to placeholders matching add-records.html
    const placeholders = {
        fname:   "First Name",
        lname:   "Last Name",
        mi:      "M.I.",
        suffix:  "Jr., III, etc.",
        maiden:  "Maiden Name",
        sex:     "M or F",
        email:   "jdelacruz@up.edu.ph",
        mobile:  "09XXXXXXXXX",
        address: "Your Home Address",
        sno:     "xxxx-xxxxx",
        entry:   "MM/YYYY",
        org:     "e.g. UP Economics Society",
        emp:     "e.g. Google, Inc.",
        pos:     "e.g. Head Software Engineer",
        empstart:"MM/YYYY",
        empend:  "MM/YYYY",
        deg:     "BS Economics",
        hon:     "e.g. Magna Cum Laude",
        univ:    "e.g. University of the Philippines",
        semstart:"1st Sem, 2026",
        semend:  "2nd Sem, 2030",
        achieve: "e.g. Best Thesis Awardee, Dean's Lister, etc.",
    };

    const placeholder = placeholders[key] || "";
    field.innerHTML = `<input type="text" value="${currentValue}" placeholder="${placeholder}">`;
    });

  } else {
    // Cancel — restore snapshot
    isEditing = false;
    container.classList.remove("editing");
    editBtn.innerText = "Edit Your Data";
    editBtn.classList.remove("cancel-mode");
    saveBtn.style.display = "none";
    form.innerHTML = formSnapshot;
  }
}

// Save data to backend
async function saveData() {
  const form = document.getElementById("profile-form");

  const get = (key) => {
    const el = form.querySelector(`.data-field[data-key="${key}"] input`);
    return el ? el.value.trim() : "";
  };

  // Parse semester string e.g. "1st Sem, 2022" → { sem: 1, year: 2022 }
  const parseSem = (str) => {
    if (!str) return { sem: null, year: null };
    const parts = str.split(",");
    const sem = str.includes("1st") ? 1 : 2;
    const year = parseInt(parts[1]?.trim()) || null;
    return { sem, year };
  };

  const academicHist = [...form.querySelectorAll(".graduate-row")].map(row => {
    const started  = parseSem(row.querySelector('[data-key="semstart"] input')?.value);
    const ended    = parseSem(row.querySelector('[data-key="semend"] input')?.value);
    return {
      degree_name:         row.querySelector('[data-key="deg"] input')?.value || "",
      latin_honor:         row.querySelector('[data-key="hon"] input')?.value || null,
      granting_university: row.querySelector('[data-key="univ"] input')?.value || "",
      year_started:        started.year,
      semester_started:    started.sem,
      year_graduated:      ended.year,
      semester_graduated:  ended.sem,
    };
  });

  const employmentHist = [...form.querySelectorAll(".employment-row")].map(row => ({
    employer:            row.querySelector('[data-key="emp"] input')?.value || "",
    last_position_held:  row.querySelector('[data-key="pos"] input')?.value || "",
    start_date:          toSQLDate(row.querySelector('[data-key="empstart"] input')?.value),
    end_date:            toSQLDate(row.querySelector('[data-key="empend"] input')?.value),
    is_current:          false,
  }));

  const activeOrgs = [...form.querySelectorAll(".organization-row")].map(row => ({
    organization_name: row.querySelector('[data-key="org"] input')?.value || "",
  })).filter(o => o.organization_name);

  const payload = {
    first_name:      get("fname"),
    last_name:       get("lname"),
    middle_name:     get("mi"),
    suffix:          get("suffix"),
    gender:          get("sex"),
    phone_number:    get("mobile"),
    current_address: get("address"),
    student_number: get("sno"),
    entry_date:      toSQLDate(get("entry")),
    academicHist,
    employmentHist,
    activeOrgs,
  };

    // Format phone number to match DB constraint (^9[0-9]{9}$)
    if (payload.phone_number) {
    let phone = payload.phone_number.replace(/[-\s]/g, ""); // remove spaces/dashes
    if (phone.startsWith("0") && phone.length === 11) {
        phone = phone.substring(1); // 09XXXXXXXXX → 9XXXXXXXXX
    } else if (phone.startsWith("+63")) {
        phone = phone.substring(3); // +639XXXXXXXXX → 9XXXXXXXXX
    }
    payload.phone_number = phone;
    }

  try {
    const isNewRecord = currentData === null;
    const url = "http://localhost:3001/alumni-profile";
    const method = isNewRecord ? "POST" : "PUT";

    const res = await fetch(url, {
    method,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error saving: " + data.error);
      return;
    }

    alert("Changes saved successfully!");
    isEditing = false;
    document.querySelector(".profile-container").classList.remove("editing");
    document.getElementById("edit-cancel-btn").innerText = "Edit Your Data";
    document.getElementById("edit-cancel-btn").classList.remove("cancel-mode");
    document.getElementById("save-btn").style.display = "none";

    // Reload fresh data from server
    await loadProfile();

  } catch (err) {
    alert("Could not reach the server.");
    console.error(err);
  }
}

// Add row helpers

function addEmployment() {
  document.getElementById("employment-container").appendChild(makeEmpRow("","","",""));
  // Convert the new row's fields to inputs immediately since we're in edit mode
  document.querySelectorAll("#employment-container .data-field").forEach(f => {
    if (!f.querySelector("input")) f.innerHTML = `<input type="text" value="">`;
  });
  document.querySelectorAll("#employment-container .circle-btn.minus")
    .forEach(b => b.style.display = "block");
}

function addGraduate() {
  const container = document.getElementById("graduate-container");
  const achieveRow = container.querySelector(".achievements-row");
  container.insertBefore(makeGradRow({}), achieveRow);
  container.querySelectorAll(".graduate-row .data-field").forEach(f => {
    if (!f.querySelector("input")) f.innerHTML = `<input type="text" value="">`;
  });
  container.querySelectorAll(".graduate-row .circle-btn.minus")
    .forEach(b => b.style.display = "block");
}

function addOrganization() {
  document.getElementById("organization-container").appendChild(makeOrgRow(""));
  document.querySelectorAll("#organization-container .data-field").forEach(f => {
    if (!f.querySelector("input")) f.innerHTML = `<input type="text" value="">`;
  });
  document.querySelectorAll("#organization-container .circle-btn.minus")
    .forEach(b => b.style.display = "block");
}

function removeRow(button) {
  button.parentElement.remove();
}

loadProfile();