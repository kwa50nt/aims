const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
const joinOp = " AND "
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
function convertFlag(flag){
  if (flag == "include"){
    return "=";
  }
  else if (flag == "exclude"){
    return "!=";
  }
}

function upsealumniWhereQuery(filter){
  let res = "WHERE "
  let resFilters = [];
  console.log(filter)
  resFilters.push( filter["gender"].map( g =>
     "gender " + convertFlag(g["flag"]) +" \'" + g["gender"] + "\'"
  ).join(joinOp));
  
  resFilters.push(filter["studentNum"].map(sn => {
    let part = "CAST(LEFT(student_number, 4) AS INT) "
    if (sn["flag"] == "exclude"){
      part += " NOT"
    }
    part += " BETWEEN " + sn["start"] + " AND " + sn["end"]
    return part
  }).join(joinOp));

  resFilters.push(filter["entryDate"].map(ed => {
    let part = "entry_date"
    if (ed["flag"] == "exclude"){
      part += " NOT"
    }
    part += " BETWEEN \'" + ed["start"] + "\' AND \'" + ed["end"] +"\'"
    return part
  }).join(joinOp));

  return resFilters.filter(x => x !== "").join(joinOp);
}

function employmentWhereQuery(filter){
  let res = "WHERE "
  let resFilters = [];
  resFilters.push( filter["employment"].map( (g) => {
    let ret = "(employer " + convertFlag(g["flag"]) +" \'" + g["company"] + "\'" ;
     if (g["isCurrent"] != "null"){
      if (g["flag"] == "include"){
        ret += " AND ";
      }
      else if (g["flag"] == "exclude"){
        ret += " OR ";
      }
      ret += "is_current" + convertFlag(g["flag"]) + " " + g["isCurrent"];
     }
     return ret + ")";
  }).join(joinOp));
  
  return resFilters.filter(x => x !== "").join(joinOp);
}

function activeOrgsWhereQuery(filter){
  let res = "WHERE "
  let resFilters = [];
  resFilters.push( filter["activOrgs"].map( g =>
     "organization_name " + convertFlag(g["flag"]) +" \'" + g["org"] + "\'"
  ).join(joinOp));
  
  return resFilters.filter(x => x !== "").join(joinOp);
}

function acadHistWhereQuery(filter){
  let resFilters = [];
  const test = filter["acadHist"]["degreeAndUniv"];
  console.log(test);
  resFilters.push( filter["acadHist"]["degreeAndUniv"].map( (g) =>{
    let ret = "(degree_name " + convertFlag(g["flag"]) +" \'" + g["degreeName"] + "\'";
    if (g["flag"] == "include"){
        ret += " AND ";
      }
      else if (g["flag"] == "exclude"){
        ret += " OR ";
      }
      ret += "granting_university " + convertFlag(g["flag"]) +" \'" + g["univName"] + "\')";
      return ret;
  }).join(joinOp));
  
  resFilters.push(filter["acadHist"]["dateStart"].map(ed => {
    let part = "year_started"
    if (ed["flag"] == "exclude"){
      part += " NOT"
    }
    part += " BETWEEN " + ed["start"] + " AND " + ed["end"]
    return part
  }).join(joinOp));

  resFilters.push(filter["acadHist"]["gradDate"].map(ed => {
    let part = "year_graduated"
    if (ed["flag"] == "exclude"){
      part += " NOT"
    }
    part += " BETWEEN " + ed["start"] + " AND " + ed["end"] 
    return part
  }).join(joinOp));

  return resFilters.filter(x => x !== "").join(joinOp + "\n");
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
      order = "none",
      filters
    } = req.query;
    
    let SQLQuery =  "SELECT * FROM upsealumni";

    // create SQL query
    if (sortBy != "none"){
      if (sortBy == "last_name"){
        SQLQuery = SQLQuery + " ORDER BY " + sortBy + " " + order + ", first_name " + order;
      }
      else{
        SQLQuery = SQLQuery + " ORDER BY " + sortBy + " " + order + ", last_name " + order + ", first_name " + order;
      }
    }

    console.log(filters)
    filter = JSON.parse(filters);

    console.log(filter)
    let alumniWhereQuery = employmentWhereQuery(filter);
    console.log(`employment \n ${alumniWhereQuery}`);

    alumniWhereQuery = activeOrgsWhereQuery(filter);
    console.log(`activeOrgs \n ${alumniWhereQuery}`);

    alumniWhereQuery = acadHistWhereQuery(filter);
    console.log(`acadHist \n ${alumniWhereQuery}`);
    const test = await client.query(`
  SELECT 
    a.alumni_id,
    a.student_number,
    a.last_name,
    a.first_name,
    a.middle_name,
    a.suffix,
    a.gender,
    a.entry_date,
    a.current_email,
    a.phone_number,
    a.current_address,
    a.academic_achievements,

    -- ✅ Academic History JSON
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'graduation_id', ah.graduation_id,
                'degree_name', ah.degree_name,
                'granting_university', ah.granting_university,
                'year_started', ah.year_started,
                'semester_started', ah.semester_started,
                'year_graduated', ah.year_graduated,
                'semester_graduated', ah.semester_graduated,
                'latin_honor', ah.latin_honor
            )
        ) FILTER (WHERE ah.graduation_id IS NOT NULL),
        '[]'
    ) AS academic_hist,

    -- ✅ Employment History JSON
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'employment_id', eh.employment_id,
                'employer', eh.employer,
                'last_position_held', eh.last_position_held,
                'start_date', eh.start_date,
                'end_date', eh.end_date,
                'is_current', eh.is_current
            )
        ) FILTER (WHERE eh.employment_id IS NOT NULL),
        '[]'
    ) AS employment_hist,

    -- ✅ Active Organizations JSON
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'org_id', ao.org_id,
                'organization_name', ao.organization_name
            )
        ) FILTER (WHERE ao.org_id IS NOT NULL),
        '[]'
    ) AS active_orgs

FROM upsealumni a

INNER JOIN academichistory ah 
    ON a.alumni_id = ah.alumni_id
    -- AND ah.degree_name = 'BS Computer Science'

INNER JOIN employmenthistory eh 
    ON a.alumni_id = eh.alumni_id
    -- AND eh.is_current = TRUE

INNER JOIN activeorganizations ao 
    ON a.alumni_id = ao.alumni_id
    -- AND ao.organization_name = 'Women in Tech PH'

WHERE a.gender = 'F'
GROUP BY 
    a.alumni_id,
    a.student_number,
    a.last_name,
    a.first_name,
    a.middle_name,
    a.suffix,
    a.gender,
    a.entry_date,
    a.current_email,
    a.phone_number,
    a.current_address,
    a.academic_achievements
	
ORDER BY a.last_name
;`);
  console.log(test.rows);

    // send as JSON
    res.json(test.rows);

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
const { start } = require("node:repl");

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

