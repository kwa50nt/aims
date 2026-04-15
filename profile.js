let isEditing = false;
let formSnapshot = ""; // Stores the entire HTML structure for 'Cancel'

function toggleEdit() {
    const container = document.querySelector('.profile-container');
    const form = document.getElementById('profile-form');
    const editBtn = document.getElementById('edit-cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    
    if (!isEditing) {
        // --- ENTER EDIT MODE ---
        isEditing = true;
        
        // 1. Take a snapshot of the HTML BEFORE any inputs are added
        formSnapshot = form.innerHTML; 
        
        container.classList.add('editing');
        editBtn.innerText = "Cancel";
        editBtn.classList.add('cancel-mode');
        saveBtn.style.display = "block";

        // 2. Convert text to inputs
        const fields = form.querySelectorAll('.data-field');
        fields.forEach(field => {
            const currentValue = field.innerText.trim();
            field.innerHTML = `<input type="text" value="${currentValue}">`;
        });
    } else {
        // --- CANCEL LOGIC ---
        isEditing = false;
        container.classList.remove('editing');
        editBtn.innerText = "Edit Your Data";
        editBtn.classList.remove('cancel-mode');
        saveBtn.style.display = "none";

        // 3. Restore the entire form to the snapshot (removes added rows)
        form.innerHTML = formSnapshot;
    }
}

function saveData() {
    const container = document.querySelector('.profile-container');
    const form = document.getElementById('profile-form');
    const editBtn = document.getElementById('edit-cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const fields = form.querySelectorAll('.data-field');

    // 1. Commit values from inputs back to plain text
    fields.forEach(field => {
        const input = field.querySelector('input');
        if (input) {
            field.innerText = input.value;
        }
    });

    // 2. Reset UI
    isEditing = false;
    container.classList.remove('editing');
    editBtn.innerText = "Edit Your Data";
    editBtn.classList.remove('cancel-mode');
    saveBtn.style.display = "none";
    
    // 3. Optional: Clear snapshot so it's fresh for next edit
    formSnapshot = ""; 
    
    alert("Changes saved successfully!");
}

function addEmployment() {
    const container = document.getElementById("employment-container");
    const newRow = document.createElement("div");
    newRow.className = "employment-row";
    
    newRow.innerHTML = `
        <div><label>Employer</label><div class="data-field"><input type="text" placeholder="e.g. Google, Inc."></div></div>
        <div><label>Position</label><div class="data-field"><input type="text" placeholder="e.g. Software Engineer"></div></div>
        <div><label>Start</label><div class="data-field"><input type="text" placeholder="MM/YYYY"></div></div>
        <div><label>End</label><div class="data-field"><input type="text" placeholder="MM/YYYY"></div></div>
        <button type="button" class="circle-btn minus" onclick="removeRow(this)"><i class="fas fa-minus"></i></button>
    `;
    container.appendChild(newRow);
}

function addGraduate() {
    const container = document.getElementById("graduate-container");
    const achieveRow = container.querySelector(".achievements-row");
    const newRow = document.createElement("div");
    newRow.className = "graduate-row";
    
    newRow.innerHTML = `
        <div><label>Degree</label><div class="data-field"><input type="text"></div></div>
        <div><label>Latin Honors</label><div class="data-field"><input type="text"></div></div>
        <div><label>University</label><div class="data-field"><input type="text"></div></div>
        <div><label>Sem/Year Started</label><div class="data-field"><input type="text" placeholder="1st Sem, 2026"></div></div>
        <div><label>Sem/Year Graduated</label><div class="data-field"><input type="text" placeholder="2nd Sem, 2030"></div></div>
        <button type="button" class="circle-btn minus" onclick="removeRow(this)"><i class="fas fa-minus"></i></button>
    `;
    container.insertBefore(newRow, achieveRow);
}

function addOrganization() {
    const container = document.getElementById("organization-container");
    const row = document.createElement("div");
    row.className = "organization-row";
    row.innerHTML = `
        <div class="row-data-grid">
            <div class="data-group"><label>Organization</label><div class="data-field"><input type="text"></div></div>
        </div>
        <button type="button" class="circle-btn minus" onclick="removeRow(this)"><i class="fas fa-minus"></i></button>
    `;
    container.appendChild(row);
}

function removeRow(button) {
    button.parentElement.remove();
}