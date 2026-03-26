const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

function excelSerialToDate(serial) {
  if (!serial) return null;

  if (typeof serial === "string") {
    if (/^\d{4}-\d{1,2}$/.test(serial)) {
      const [year, month] = serial.split("-");
      return `${year}-${month.padStart(2, "0")}-01`;
    }
    return serial;
  }

  const utc_days = serial - 25569;
  const utc_value = utc_days * 86400;
  const date = new Date(utc_value * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
    academicHist,
    employmentHist,
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
    // console.log("Inserting webaccount:", email, password, role_id);
    // const accountResult = await client.query(
    //   `INSERT INTO webaccount (email, password, role_id)
    //    VALUES ($1, $2, $3)
    //    RETURNING account_id`,
    //   [email, password, role_id]
    // );

    // const account_id = accountResult.rows[0].account_id;

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
        current_address
        )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
      ]
    );
    const alumni_id = alumniResult.rows[0].alumni_id;
    console.log(alumniResult.rows[0]);
    let acadHistoryEntry;
    for (i = 0 ; i < academicHist.length; i++){
      acadHistoryEntry = academicHist[i];
      await client.query(
        `INSERT INTO academicHistory
        (
          alumni_id, 
          degree_name,
          year_started, 
          semester_started, 
          year_graduated, 
          semester_graduated, 
          latin_honor,
          granting_university
          )

        VALUES ($1,$2,$3,$4,$5,$6, $7, $8)
        RETURNING *`,
        [
          alumni_id, 
          acadHistoryEntry.degree_name, 
          acadHistoryEntry.year_started, 
          acadHistoryEntry.semester_started, 
          acadHistoryEntry.year_graduated, 
          acadHistoryEntry.semester_graduated, 
          acadHistoryEntry.latin_honor,
          acadHistoryEntry.granting_university
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
    resSql = alumniResult.rows[0]
    resSql["error"] = "None"
    res.json(resSql);

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
    const { 
      sortBy = "none", 
      order = "none" } = req.query;
    
    let SQLQuery =  "SELECT * FROM upsealumni";
    console.log(sortBy, order);
    if (sortBy != "none"){
      if (sortBy == "last_name"){
        SQLQuery = SQLQuery + " ORDER BY " + sortBy + " " + order + ", first_name " + order;
      }
      else{
        SQLQuery = SQLQuery + " ORDER BY " + sortBy + " " + order + ", last_name " + order + ", first_name " + order;
      }
    }

    const alumnis = await client.query(SQLQuery);
    const academicHistory = await client.query("SELECT * FROM academichistory");
    const employmentHistory = await client.query("SELECT * FROM employmenthistory");
    const activeOrganizations = await client.query("SELECT * FROM activeorganizations");
    console.log(alumnis);
    const alumniDict = Object.fromEntries(
      alumnis.rows.map((row, index) => [
        row.alumni_id,
        {
          ...row,
          academicHist: [],
          employmentHist: [],
          activeOrgs: [],
          order: index
        }
      ])
    );

    academicHistory.rows.forEach(r => {
      if (alumniDict[r.alumni_id]) alumniDict[r.alumni_id].academicHist.push(r);
    });
    employmentHistory.rows.forEach(r => {
      if (alumniDict[r.alumni_id]) alumniDict[r.alumni_id].employmentHist.push(r);
    });
    activeOrganizations.rows.forEach(r => {
      if (alumniDict[r.alumni_id]) alumniDict[r.alumni_id].activeOrgs.push(r.organization_name);
    });

    const orderedAlumniDict = Object.fromEntries(
      alumnis.rows.map((row, index) => [
        index,alumniDict[row.alumni_id]
      ])
    );
    // send as JSON
    res.json(orderedAlumniDict);

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

const portNumber = 3001;
app.listen(3001, () => {
  console.log("Server running on http://localhost:", portNumber);
});

const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload-excel", upload.single("file"), async (req, res) => {
  const client = await pool.connect();

  try {
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();
    const workbook = XLSX.read(req.file.buffer, { 
      type: "buffer",
      raw: fileExtension === "csv"  // tells xlsx to treat commas as delimiters
    });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet);

    await client.query("BEGIN");

    for (const row of rows) {
      const {
        email,
        password,
        last_name,
        first_name,
        middle_name,
        suffix,
        gender,
        student_number,
        current_email,
        phone_number,
        current_address
      } = row;
      const entry_date = excelSerialToDate(row.entry_date);

      // Insert into webaccount + alumni
      const roleResult = await client.query(
        "SELECT role_id FROM userrole WHERE role_name = $1",
        ["Alumni"]
      );

      const role_id = roleResult.rows[0]?.role_id;

      // await client.query(
      //   `INSERT INTO webaccount (email, password, role_id)
      //    VALUES ($1, $2, $3)`,
      //   [email, password, role_id]
      // );

      const alumniResult = await client.query(
        `INSERT INTO upsealumni
        (last_name, first_name, middle_name, suffix, gender, student_number, entry_date, current_email, phone_number, current_address)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING alumni_id`,
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
          current_address
        ]
      );

      const alumni_id = alumniResult.rows[0].alumni_id;
    }

    await client.query("COMMIT");
    res.json({ message: "Excel data imported successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

