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