const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "alumni_db",
  password: process.env.PGPASSWORD || "password",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

app.post("/add-alumni", async (req, res) => {
  const {
    email,
    password,
    last_name,
    first_name,
    middle_name,
    suffix,
    gender,
    student_number,
    entry_date,
    current_email,
    phone_number,
    current_address,
    graduationInfo,
    employmentHist,
    alumniDegs,
    activeOrgs
  } = req.body;

  const client = await pool.connect();
  const role_name = "Alumni"
  try {
    await client.query("BEGIN");

    const roleResult = await client.query(
      "SELECT role_id FROM userrole WHERE role_name = $1",
      [role_name]
    );

    let role_id;

    if (roleResult.rows.length === 0) {
      const newRole = await client.query(
        "INSERT INTO userrole (role_name) VALUES ($1) RETURNING role_id",
        [role_name]
      );
      role_id = newRole.rows[0].role_id;
    } else {
      role_id = roleResult.rows[0].role_id;
    }
    console.log("Inserting webaccount:", email, password, role_id);
    const accountResult = await client.query(
      `INSERT INTO webaccount (email, password, role_id)
       VALUES ($1, $2, $3)
       RETURNING account_id`,
      [email, password, role_id]
    );

    const account_id = accountResult.rows[0].account_id;

    const alumniResult = await client.query(
      `INSERT INTO upsealumni
       (
        last_name, 
        first_name, 
        middle_name, 
        suffix, 
        gender, 
        student_number, 
        entry_date,
        current_email, 
        phone_number, 
        current_address,
        account_id
        )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        last_name,
        first_name,
        middle_name,
        suffix,
        gender,
        student_number,
        entry_date,
        current_email,
        phone_number,
        current_address,
        account_id
      ]
    );
    const alumni_id = alumniResult.rows[0].alumni_id;
    console.log(alumniResult.rows[0]);
    let gradInfoEntry;
    for (i = 0 ; i < graduationInfo.length; i++){
      gradInfoEntry = graduationInfo[i];
      await client.query(
        `INSERT INTO graduationinfo
        (
          alumni_id, 
          year_started, 
          semester_started, 
          year_graduated, 
          semester_graduated, 
          latin_honor
          )

        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
          alumni_id, 
          gradInfoEntry.year_started, 
          gradInfoEntry.semester_started, 
          gradInfoEntry.year_graduated, 
          gradInfoEntry.semester_graduated, 
          gradInfoEntry.latin_honor
        ]
      );
    }

    let employmentHistEntry;
    for (i = 0 ; i < employmentHist.length; i++){
      employmentHistEntry = employmentHist[i];
      await client.query(
        `INSERT INTO employmenthistory
        (
          alumni_id, 
          employer, 
          last_position_held, 
          start_date, 
          end_date, 
          is_current
          )

        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
          alumni_id, 
          employmentHistEntry.employer, 
          employmentHistEntry.last_position_held, 
          employmentHistEntry.start_date, 
          employmentHistEntry.end_date, 
          employmentHistEntry.is_current
        ]
      );
    }

    let alumnidegreeEntry;
    for (i = 0 ; i < alumniDegs.length; i++){
      alumnidegreeEntry = alumniDegs[i];
      await client.query(
        `INSERT INTO alumnidegrees
        (
          alumni_id, 
          degree_name
          )

        VALUES ($1,$2)
        RETURNING *`,
        [
          alumni_id, 
          alumnidegreeEntry.degree_name
        ]
      );
    }
    
    let activeOrgEntry;
    for (i = 0 ; i < activeOrgs.length; i++){
      activeOrgEntry = activeOrgs[i];
      await client.query(
        `INSERT INTO activeorganizations
        (
          alumni_id, 
          organization_name
          )

        VALUES ($1,$2)
        RETURNING *`,
        [
          alumni_id, 
          activeOrgEntry.organization_name
        ]
      );
    }
    
    await client.query("COMMIT");

    res.json(alumniResult.rows[0]);

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });

  } finally {
    client.release();
  }
});

app.delete("/delete-alumni/:id", async (req, res) => {
  const id = req.params.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    
    webID = await client.query("SELECT account_id FROM upsealumni WHERE alumni_id = $1", [id]);
    await client.query("DELETE FROM upsealumni WHERE alumni_id = $1", [id]);
    await client.query("DELETE FROM webaccount WHERE account_id = $1", [webID.rows[0].account_id]);

    await client.query("COMMIT");

    res.json("Alumni deleted successfully");

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});
app.get("/get-alumnis", async (req, res) => {
  const client = await pool.connect();
  try {
    const alumnis = await client.query("SELECT * FROM upsealumni");
    const alumniDict = Object.fromEntries(
      alumnis.rows.map(row => [
        row.alumni_id,
        {
          ...row,
          graduationInfo: [],
          employmentHist: [],
          alumniDegs: [],
          activeOrgs: []
        }
      ])
    );

    const graduationInfo = await client.query("SELECT * FROM graduationinfo");
    const employmentHistory = await client.query("SELECT * FROM employmenthistory");
    const alumniDegrees = await client.query("SELECT * FROM alumnidegrees");
    const activeOrganizations = await client.query("SELECT * FROM activeorganizations");

    graduationInfo.rows.forEach(r => {
      if (alumniDict[r.alumni_id]) alumniDict[r.alumni_id].graduationInfo.push(r);
    });
    employmentHistory.rows.forEach(r => {
      if (alumniDict[r.alumni_id]) alumniDict[r.alumni_id].employmentHist.push(r);
    });
    alumniDegrees.rows.forEach(r => {
      if (alumniDict[r.alumni_id]) alumniDict[r.alumni_id].alumniDegs.push(r.degree_name);
    });
    activeOrganizations.rows.forEach(r => {
      if (alumniDict[r.alumni_id]) alumniDict[r.alumni_id].activeOrgs.push(r.organization_name);
    });

    // send as JSON
    res.json(alumniDict);

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
