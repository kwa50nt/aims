const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const joinOp = " AND "

  const colNames ={
    last_name: "last_name",
    first_name: "first_name",
    middle_name: "middle_name",
    suffix: "suffix",
    gender: "gender",
    student_number: "student_number",
    entry_date: "entry_date",
    current_email: "current_email",
    phone_number: "phone_number",
    current_address: "current_address",
    academic_achievements: "academic_achievements",
    degree_name: "degree_name",
    latin_honor: "latin_honor",
    year_started: "year_started",
    year_graduated: "year_graduated",
    semester_started: "semester_started",
    semester_graduated: "semester_graduated",
    granting_university: "granting_university",
    employer: "employer",
    end_date: "end_date",
    is_current: "is_current",
    start_date: "start_date",
    last_position_held: "last_position_held",
    organization_name: "organization_name"
  }
  const tableName = {
    alumni_info: "upsealumni",
    academic_hist: "academichistory",
    employment_hist: "employmenthistory",
    active_orgs: "activeorganizations",
  }
  const idName = {
    alumni_info: "alumni_id",
    academic_hist: "graduation_id",
    employment_hist: "employment_id",
    active_orgs: "org_id",
  }

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
function convertFlag(flag){
  if (flag == "include"){
    return "=";
  }
  else if (flag == "exclude"){
    return "!=";
  }
}

function getAlumniWhereQuery(filter){
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
  res = resFilters.filter(x => x !== "").join(joinOp);
  if (res != ""){
    res = "WHERE " + res;
  }
  return res;
}

function getEmploymentWhereQuery(filter){
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
  res = resFilters.filter(x => x !== "").join(joinOp);
  if (res != ""){
    res = "WHERE " + res;
  }
  return res;
}

function getActiveOrgsWhereQuery(filter){
  let resFilters = [];
  resFilters.push( filter["activOrgs"].map( g =>
     "organization_name " + convertFlag(g["flag"]) +" \'" + g["org"] + "\'"
  ).join(joinOp));
  res = resFilters.filter(x => x !== "").join(joinOp);
  if (res != ""){
    res = "WHERE " + res;
  }
  return res;
}

function getAcadHistWhereQuery(filter){
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
  res = resFilters.filter(x => x !== "").join(joinOp);
  if (res != ""){
    res = "WHERE " + res;
  }
  return res;
}
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "alumni_db",
  password: process.env.PGPASSWORD || "password",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});
function parseInsertQuery(tName, data, alumni_id){

  let insertQuery = ""; 
  let valArr = []; 
  if (tName == "academichistory"){
    try{
      insertQuery =  `
      INSERT INTO academicHistory
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

        VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
        )
        RETURNING *`;
        valArr = [
            alumni_id,
            data.degree_name,
            data.year_started,
            data.semester_started,
            data.year_graduated,
            data.semester_graduated,
            data.latin_honor,
            data.granting_university]
    }
    catch(err){
      console.log(`Error parsing academic history insert into \n `,err);
    }
    
  }
  else if (tName == "employmenthistory"){
    try{
      insertQuery =  `
      INSERT INTO employmenthistory
        (
          alumni_id, 
          employer, 
          last_position_held, 
          start_date, 
          end_date, 
          is_current
          )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *`;
      valArr = [
        alumni_id,
        data.employer,
        data.last_position_held,
        data.start_date,
        data.end_date,
        data.is_current
      ]
    }
    
    catch(err){
      console.log(`Error parsing employment history insert into \n `,err);
    }
    
  }
  else if (tName == "activeorganizations"){
    try{
      insertQuery = `
      INSERT INTO activeorganizations
        (
          alumni_id, 
          organization_name
          )

        VALUES (
        $1,
        $2
        )
        RETURNING *`;
      valArr = [
        alumni_id,
        data.organization_name
      ]
    }
    catch(err){
      console.log(`Error parsing active organization insert into \n `,err);
    }
  }
  console.log(insertQuery,valArr );
  return {insertQuery, valArr};
}

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
    academic_hist,
    employment_hist,
    active_orgs
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
    for (i = 0 ; i < academic_hist.length; i++){
      acadHistoryEntry = academic_hist[i];
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
    for (i = 0 ; i < employment_hist.length; i++){
      employmentHistEntry = employment_hist[i];
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
    for (i = 0 ; i < active_orgs.length; i++){
      activeOrgEntry = active_orgs[i];
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
    
    let alumniOrder = "";

    // create SQL query
    if (sortBy != "none"){
      if (sortBy == "last_name"){
        alumniOrder = "ORDER BY " + sortBy + " " + order + ", first_name " + order;
      }
      else{
        alumniOrder = "ORDER BY " + sortBy + " " + order + ", last_name " + order + ", first_name " + order;
      }
    }
    console.log(filters)
    filter = JSON.parse(filters);

    console.log(filter)
    const alumniWhereQuery = getAlumniWhereQuery(filter);
    console.log(`alumni \n ${alumniWhereQuery}`);

    const employmentWhereQuery = getEmploymentWhereQuery(filter);
    console.log(`employment \n ${employmentWhereQuery}`);

    const activeOrgWhereQuery = getActiveOrgsWhereQuery(filter);
    console.log(`activeOrgs \n ${activeOrgWhereQuery}`);

    const acadHistWhereQuery = getAcadHistWhereQuery(filter);
    console.log(`acadHist \n ${acadHistWhereQuery}`);

    const alumniBase = `WITH alumni_base AS (
    SELECT *
    FROM upsealumni
    ${alumniWhereQuery}),
    `;

    const acadHist = `acad_hist AS (
    SELECT *
    FROM academichistory
    ${acadHistWhereQuery}),
    `;

    const empHist = `emp_hist AS (
    SELECT *
    FROM employmenthistory
    ${employmentWhereQuery}),
    `;

    const activeOrg = `active_org AS (
    SELECT *
    FROM activeorganizations
    ${activeOrgWhereQuery})
    `;

    const finalQuery = `
    SELECT
        a.alumni_id,
        a.last_name,
        a.first_name,
        a.middle_name,
        a.suffix,
        a.gender,
        a.student_number,
        a.entry_date,
        a.current_email,
        a.phone_number,
        a.current_address,

        COALESCE(
            jsonb_agg(
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

        COALESCE(
            jsonb_agg(
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

        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'org_id', ao.org_id,
                    'organization_name', ao.organization_name
                )
            ) FILTER (WHERE ao.org_id IS NOT NULL),
            '[]'
        ) AS active_orgs

    FROM alumni_base a
    LEFT JOIN acad_hist ah
        ON a.alumni_id = ah.alumni_id
    LEFT JOIN emp_hist eh
        ON a.alumni_id = eh.alumni_id
    LEFT JOIN active_org ao
        ON a.alumni_id = ao.alumni_id

    GROUP BY
        a.alumni_id,
        a.last_name,
        a.first_name,
        a.middle_name,
        a.suffix,
        a.gender,
        a.student_number,
        a.entry_date,
        a.current_email,
        a.phone_number,
        a.current_address

    ${alumniOrder}`;

    // final query
    console.log(alumniBase + acadHist + empHist + activeOrg + finalQuery)
    const alumniDB = await client.query(alumniBase + acadHist + empHist + activeOrg + finalQuery)
    console.log(alumniDB.rows);

    // send as JSON
    res.json(alumniDB.rows);

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
app.post("/update-alumni", async (req, res) => {
  const {
    alumni_info,
    academic_hist,
    employment_hist,
    active_orgs
  } = req.body;
  const aeo = {
    academic_hist,
    employment_hist,
    active_orgs
  };
  console.log("============================updating alumni============================");

  const client = await pool.connect();
  console.log(req.body);
  try {
    let resQuery;
    await client.query("BEGIN");
    if (alumni_info != null){
      for (const [k,v] of Object.entries(alumni_info)){
        console.log(k, v);
        if (k == 'alumni_id') continue;

        // SAFETY CHECK: Skip fields that don't exist in the database schema
        if (!colNames[k]) {
            console.log(`Skipping unsupported field: ${k}`);
            continue;
        }

        console.log(`
          UPDATE ${tableName.alumni_info}
          SET ${colNames[k]} = $1
          WHERE alumni_id = $2
          `,[
            v,
            alumni_info.alumni_id
          ])
        resQuery = await client.query(`
          UPDATE ${tableName.alumni_info}
          SET ${colNames[k]} = $1
          WHERE alumni_id = $2
          `,[
            v,
            alumni_info.alumni_id
          ])
        console.log(resQuery);
      }
    }
    
    for (const [table, arr] of Object.entries(aeo)){
      if (arr == null) continue;
      for (const elem of arr){
        const idStr = idName[table];
        const idNum = elem[idStr];
        const tableToEdit = tableName[table];
        if (idNum >= 0){
          for (const [k,v] of Object.entries(elem)){
            if (k == idStr) continue;
              console.log(`
                UPDATE ${tableToEdit}
                SET ${colNames[k]} = $1
                WHERE ${idStr} = $2
                `, [
                  v,
                  idNum
                ]);
              resQuery = await client.query(`
                UPDATE ${tableToEdit}
                SET ${colNames[k]} = $1
                WHERE ${idStr} = $2
                `, [
                  v,
                  idNum
                ]);
            console.log(resQuery);
          }            
        }
        else if (idNum == -1){
          const {insertQuery, valArr} = parseInsertQuery(tableToEdit, elem, alumni_info.alumni_id);
          console.log(insertQuery, valArr);
          if (insertQuery != ""){
            resQuery = await client.query(insertQuery, valArr);
            console.log(resQuery);
          }
        }
        else if (idNum == -2){
          console.log(`
            DELETE FROM ${tableToEdit}
            WHERE ${idStr} = $1
            `,
            [
             elem.idToDelete 
            ]);
          resQuery = await client.query(`
            DELETE FROM ${tableToEdit}
            WHERE ${idStr} = $1
            `,
            [
             elem.idToDelete 
            ]);
          console.log(resQuery);
        }
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });

  } finally {
    client.release();
  }

});
