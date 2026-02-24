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
    role_name,
    last_name,
    first_name,
    gender,
    student_number,
    current_email,
    phone_number
  } = req.body;

  const client = await pool.connect();

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

    const accountResult = await client.query(
      `INSERT INTO webaccount (email, password, role_id)
       VALUES ($1, $2, $3)
       RETURNING account_id`,
      [email, password, role_id]
    );

    const account_id = accountResult.rows[0].account_id;

    const alumniResult = await client.query(
      `INSERT INTO upsealumni
       (last_name, first_name, gender, student_number, current_email, phone_number, account_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        last_name,
        first_name,
        gender,
        student_number,
        current_email,
        phone_number,
        account_id
      ]
    );

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
  const id = req.params.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    console.log("begin getting alumni");
    alumnis = await client.query("SELECT * FROM upsealumni ");
    alumniDict = Object.fromEntries(alumnis.rows.map(row=> {
        const newRow = {
          ... row,
          "graduationInfo": [],
          "employmentHist": [],
          "alumniDegs": [],
          "activeOrgs": [],
        }
        return [row.alumni_id, newRow];
      }));
    graduationInfo = await client.query("SELECT * FROM graduationinfo");
    employmentHistory = await client.query("SELECT * FROM employmenthistory ");
    alumniDegrees = await client.query("SELECT * FROM alumnidegrees ");
    activeOrganizations = await client.query("SELECT * FROM activeorganizations ");

    // const appendToAlumni = (arr, dest) => {
    //   arr.forEach(r => {
    //     if (!r) return;
    //     alumniDict[r.alumni_id.toString()].dest.push(r);
    //   });
    // }
    alumniDegrees.rows.forEach(r => {
      alumniDict[r.alumni_id.toString()].alumniDegs.push(r.degree_name);
    });
    activeOrganizations.rows.forEach(r => {
      alumniDict[r.alumni_id.toString()].activeOrgs.push(r.organization_name);
    });
    for (i = 0 ; i < graduationInfo.rows.length; i++){
      alumID = graduationInfo.rows[i].alumni_id.toString();
      alumniDict[alumID].graduationInfo.push(graduationInfo.rows[i]);
    }
    for (i = 0 ; i < employmentHistory.rows.length; i++){
      alumID = employmentHistory.rows[i].alumni_id.toString();
      alumniDict[alumID].employmentHist.push(employmentHistory.rows[i]);
    }
    console.log(alumniDict);
    console.log(alumniDict["56"].employmentHist);
    console.log(alumniDict["57"].employmentHist);
    res.json(JSON.stringify(alumniDict));

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
