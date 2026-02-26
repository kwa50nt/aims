function addEmployment() {
  const container = document.getElementById("employment-container");

  const newRow = document.createElement("div");
  newRow.className = "employment-row";

  newRow.innerHTML = `
    <div>
      <label>Employer</label>
      <input type="text" placeholder="Employer">
    </div>

    <div>
      <label>Position</label>
      <input type="text" placeholder="Position">
    </div>

    <div>
      <label>Start</label>
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

  const newRow = document.createElement("div");
  newRow.className = "graduate-row";

  newRow.innerHTML = `
    <div>
      <label>Degree</label>
      <input type="text" placeholder="Degree">
    </div>

    <div>
      <label>Latin Honor</label>
      <input type="text" placeholder="Latin Honor">
    </div>

    <div>
      <label>Graduation Year</label>
      <input type="text" placeholder="MM/YYYY">
    </div>

    <div>
      <label>Semester Started</label>
      <select>
        <option value="">Select</option>
        <option value="1st">1st</option>
        <option value="2nd">2nd</option>
      </select>
    </div>

    <div>
      <label>Semester Graduated</label>
      <select>
        <option value="">Select</option>
        <option value="1st">1st</option>
        <option value="2nd">2nd</option>
      </select>
    </div>
    
    <button type="button" class="circle-btn minus" onclick="removeRow(this)">
      <i class="fas fa-minus"></i>
    </button>
  `;

  container.appendChild(newRow);
}

function removeRow(button) {
  const row = button.parentElement;
  row.remove();
}

async function addAlumni() {
  const form = document.querySelector(".alumni-form");

  const userEmail = form.querySelector('input[placeholder="Your Email"]').value;
  // generate a unique account email for testing
  const randomSuffix = Math.floor(Math.random() * 100000);
  const accountEmail = `test+${randomSuffix}@example.com`;

  const data = {
    email: accountEmail,      // unique login email
    password: "123456", // you can still hardcode for testing
    last_name: form.querySelector('input[placeholder="Your Full Name"]').value.split(' ')[1] || "",
    first_name: form.querySelector('input[placeholder="Your Full Name"]').value.split(' ')[0] || "",
    middle_name: "",
    suffix: "",
    gender: form.querySelector('input[placeholder="Gender"]').value,
    student_number: form.querySelector('input[placeholder="xxxx-xxxxx"]').value,
    entry_date: form.querySelector('input[placeholder="DD/MM/YYYY"]').value,
    current_email: form.querySelector('input[placeholder="Your Email"]').value,
    phone_number: form.querySelector('input[placeholder="Your Number"]').value,
    current_address: form.querySelector('input[placeholder="Your Home Address"]').value,
    graduationInfo: [
      {
        year_started: 2015,
        semester_started: 1,
        year_graduated: 2019,
        semester_graduated: 2,
        latin_honor: 'magna_cum_laude'
      }
    ],
    employmentHist: [
      {
        employer: 'Tech Corp',
        last_position_held: 'Software Engineer',
        start_date: "2019-05-31",
        end_date: "2022-12-30",
        is_current: false
      }
    ],
    alumniDegs: [
      { degree_name: 'bs math' }
    ],
    activeOrgs: [
      { organization_name: 'cursor' },
      { organization_name: 'csi' }
    ]
  };

  try {
    const response = await fetch("http://localhost:3000/add-alumni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const fetched = await response.json();
    console.log("Server Response:", fetched);
  } catch (err) {
    console.log("error adding alumni:", err);
  }
}

async function deleteAlumni(){
alumniId = "50"; // will work kahit wala sa databse 
  try {
    // fetching the server
    const response = await fetch(`http://localhost:3000/delete-alumni/${alumniId}`, {
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

async function getAlumnis(){
  try {
    // frontend: comment out the fetching and result of fetching para di mag error sainyo
    // fetching the server
    const response = await fetch(`http://localhost:3000/get-alumnis`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    

    // result of fetching
    const fetched = await response.json();
    console.log(JSON.stringify(fetched));
    renderAlumniTable(fetched);
    // console.log(fetched["56"]);

    // const fetched = {
    //   '56': {
    //     alumni_id: '56',
    //     last_name: 'Doe',
    //     first_name: 'John',
    //     middle_name: null,
    //     suffix: null,
    //     gender: 'M',
    //     student_number: '2023-12345',
    //     entry_date: null,
    //     current_email: 'john@example.com',
    //     phone_number: '9123456789',
    //     current_address: null,
    //     account_id: 104,
    //     graduationInfo: [
    //       {
    //         graduation_id: '2',
    //         alumni_id: 56,
    //         year_started: 2015,
    //         semester_started: 1,
    //         year_graduated: 2019,
    //         semester_graduated: 2,
    //         latin_honor: 'magna_cum_laude'
    //       }
    //     ],
    //     employmentHist: [
    //       {
    //         employment_id: '1',
    //         alumni_id: 56,
    //         employer: 'Tech Corp',
    //         last_position_held: 'Software Engineer',
    //         start_date: 2019-05-31T16:00:00.000Z,
    //         end_date: 2022-12-30T16:00:00.000Z,
    //         is_current: false
    //       }
    //     ],
    //     alumniDegs: [ 'bs math' ],
    //     activeOrgs: [ 'cursor', 'cursor', 'csi' ]
    //   },
    //   '57': {
    //     alumni_id: '57',
    //     last_name: 'Doe',
    //     first_name: 'Jane',
    //     middle_name: null,
    //     suffix: null,
    //     gender: 'M',
    //     student_number: '2023-02154',
    //     entry_date: null,
    //     current_email: 'test1@example.com',
    //     phone_number: '9123456789',
    //     current_address: null,
    //     account_id: 105,
    //     graduationInfo: [
    //       {
    //         graduation_id: '3',
    //         alumni_id: 57,
    //         year_started: 2015,
    //         semester_started: 1,
    //         year_graduated: 2019,
    //         semester_graduated: 2,
    //         latin_honor: 'summa_cum_laude'
    //       }
    //     ],
    //     employmentHist: [
    //       {
    //         employment_id: '2',
    //         alumni_id: 57,
    //         employer: 'Startup',
    //         last_position_held: 'Quality control',
    //         start_date: 2019-05-31T16:00:00.000Z,
    //         end_date: 2022-12-30T16:00:00.000Z,
    //         is_current: true
    //       }
    //     ],
    //     alumniDegs: [ 'bs cs' ],
    //     activeOrgs: [ 'csi' ]
    //   }
    // };
  //   format of data is
  //   {
  //     "alumni_id" : {
  //     "last_name" : "data",
  //     "first_name" : "data",
  //     "middle_name" : "data",
  //     "suffix" : "data",
  //     "gender" : "data",
  //     "student_number" : "data",
  //     "entry_date" : "data",
  //     "current_email" : "data",
  //     "phone_number" : "data",
  //     "current_address" : "data",
  //     "account_id" : "data",
  //     "graduationInfo": [ 
  //       {
  //         "graduation_id" : "data"
  //         "alumni_id" : "data"
  //         "year_started" : "data"
  //         "semester_started" : "data"
  //         "year_graduated" : "data"
  //         "semester_graduated" : "data"
  //         "latin_honor" : "data"
  //       }
  //     ],
  //     "employmentHist" : [
  //       {
  //         "employer" : "data",
  //         "last_position_held" : "2019-05-31T16:00:00.000Z", //sorry ganito kasi date obj ng js
  //         "start_date" : "data",
  //         "end_date" : "data",
  //         "is_current" : "FALSE || TRUE",
  //       }
  //     ],
  //     "alumniDegs" : [
  //       {
  //         "degree_name" : "data"
  //       }
  //     ],
  //     "activeOrgs" : [
  //       {
  //         "organization_name" : "name"
  //       }
  //     ],
  //   }
  // }
  }
  catch (err){
    console.log("error getting alumni:", err);
    document.getElementById("alumni-table-body").innerHTML = `<p class="no-records">Failed to load alumni records. Please try again.</p>`;
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
      <img src="assets/edit.png" alt="Edit" onclick="editAlumni('${alumni.alumni_id}')">
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

// Once page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("alumni-table-body")) {
    getAlumnis();
  }
});