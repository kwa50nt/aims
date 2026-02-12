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
  // placeholder data
  const data = {
    email: "cpcheng@up.edu.ph",
    password: "hehe",
    role_name: 'Alumni',
    last_name: "cheng",
    first_name: "cellin",
    gender: "F",
    student_number: "2023-04362",
    current_email: "cpcheng@up.edu.ph",
    phone_number: "9690877666"
  };

  try {
    // fetching the server
    const response = await fetch("http://localhost:3000/add-alumni", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    // result of fetching
    const fetched = await response.json();
    console.log("Server Response:", fetched);
  }
  catch (err){
    console.log("error adding alumni:", err);
  }
}

async function deleteAlumni(){
alumniId = "0"; // will work kahit wala sa databse 
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