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
        email: "test1@example.com",
        password: "123456",
        role_name: "Alumni",
        last_name: "Doe",
        first_name: "Jane",
        gender: "M",
        student_number: "2023-02154",
        current_email: "test1@example.com",
        phone_number: "9123456789"
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
    const fetched = JSON.parse(await response.json());
    console.log(JSON.stringify(fetched));
    console.log(fetched["56"]);

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
  }

}