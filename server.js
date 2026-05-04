const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const joinOp = " AND "
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
  const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_prod";

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

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

function getAlumniWhereQuery(filter, keyWord = "none"){
  let resFilters = [];
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

  if (keyWord != "none"){
    resFilters.push (`(first_name ILIKE '%' || $1 || '%'
    OR last_name ILIKE '%' || $1 || '%'
    OR middle_name ILIKE '%' || $1 || '%'
    OR suffix ILIKE '%' || $1 || '%'
    OR current_email ILIKE '%' || $1 || '%'
    OR current_address ILIKE '%' || $1 || '%')`)
  }

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
function parseInsertQuery(tName, data, alumniID){
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
        `;
        valArr = [
            alumniID,
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
        `;
      valArr = [
        alumniID,
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
        `;
      valArr = [
        alumniID,
        data.organization_name
      ]
    }
    catch(err){
      console.log(`Error parsing active organization insert into \n `,err);
    }
  }
  return {insertQuery, valArr};
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"
 
  if (!token) return res.status(401).json({ error: "No token provided." });
 
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
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
    const newAlumniID = alumniResult.rows[0].alumni_id;
    let acadHistoryEntry;
    for (i = 0 ; i < academic_hist.length; i++){
      acadHistoryEntry = academic_hist[i];
      const {insertQuery, valArr} = parseInsertQuery(tableName.academic_hist,acadHistoryEntry, newAlumniID )
      await client.query(insertQuery, valArr);
    }

    let employmentHistEntry;
    for (i = 0 ; i < employment_hist.length; i++){
      employmentHistEntry = employment_hist[i];
      const {insertQuery, valArr} = parseInsertQuery(tableName.employment_hist,employmentHistEntry, newAlumniID )
      await client.query(insertQuery, valArr);
    }
    
    let activeOrgEntry;
    for (i = 0 ; i < active_orgs.length; i++){
      activeOrgEntry = active_orgs[i];
      const {insertQuery, valArr} = parseInsertQuery(tableName.active_orgs,activeOrgEntry, newAlumniID )
      await client.query(insertQuery, valArr);
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
    if (webID.rows[0]?.account_id) {
      await client.query("DELETE FROM webaccount WHERE account_id = $1", 
        [webID.rows[0].account_id]);
}

    await client.query("COMMIT");

    res.json("Alumni deleted successfully");

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete("/delete-account/:email", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM webaccount WHERE email = $1", [req.params.email]);
    res.json({ message: "Account deleted." });
  } catch (err) {
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
      filters,
      searchKeyword
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
    filter = JSON.parse(filters);

    const alumniWhereQuery = getAlumniWhereQuery(filter, searchKeyword);
    // console.log(`alumni \n ${alumniWhereQuery}`);

    const employmentWhereQuery = getEmploymentWhereQuery(filter);
    // console.log(`employment \n ${employmentWhereQuery}`);

    const activeOrgWhereQuery = getActiveOrgsWhereQuery(filter);
    // console.log(`activeOrgs \n ${activeOrgWhereQuery}`);

    const acadHistWhereQuery = getAcadHistWhereQuery(filter);
    // console.log(`acadHist \n ${acadHistWhereQuery}`);

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
    // console.log(alumniBase + acadHist + empHist + activeOrg + finalQuery)
    const alumniDB = await client.query(alumniBase + acadHist + empHist + activeOrg + finalQuery, 
      searchKeyword !== "none" ? [searchKeyword] : []
    )
    // print final query
    // console.log(alumniBase + acadHist + empHist + activeOrg + finalQuery)
    // send as JSON
    res.json(alumniDB.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
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
  let added =[];

  const client = await pool.connect();
  try {
    let resQuery;
    await client.query("BEGIN");
    if (alumni_info != null){
      for (const [k,v] of Object.entries(alumni_info)){
        if (k == 'alumni_id') continue;

        // SAFETY CHECK: Skip fields that don't exist in the database schema
        if (!colNames[k]) {
            console.log(`Skipping unsupported field: ${k}`);
            continue;
        }
        resQuery = await client.query(`
          UPDATE ${tableName.alumni_info}
          SET ${colNames[k]} = $1
          WHERE alumni_id = $2
          RETURNING *;
          `,[
            v,
            alumni_info.alumni_id
          ])
        added.push({
          command: resQuery.command,
          new: resQuery.rows
        });
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
              resQuery = await client.query(`
                UPDATE ${tableToEdit}
                SET ${colNames[k]} = $1
                WHERE ${idStr} = $2
                RETURNING *;
                `, [
                  v,
                  idNum
                ]);
              added.push({
                command: resQuery.command,
                new: resQuery.rows
              });
          }            
        }
        else if (idNum == -1){
          const {insertQuery, valArr} = parseInsertQuery(tableToEdit, elem, alumni_info.alumni_id);
          if (insertQuery != ""){
            resQuery = await client.query(insertQuery, valArr);
            added.push({
                command: resQuery.command,
                new: resQuery.rows
              });
          }
        }
        else if (idNum == -2){
          resQuery = await client.query(`
            DELETE FROM ${tableToEdit}
            WHERE ${idStr} = $1
            RETURNING *;
            `,
            [
             elem.idToDelete 
            ]);
          added.push({
                command: resQuery.command,
                new: resQuery.rows
              });
        }
      }
    }
    await client.query("COMMIT");
    res.json(added);

  } catch (err) {
    await client.query("ROLLBACK");
    console.log("error updating alumni ", err.message)
    res.status(500).json({ error: err.message });

  } finally {
    client.release();
  }

});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
 
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
 
    const existing = await client.query(
      "SELECT account_id FROM webaccount WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "An account already exists for this email." });
    }
 
    let role_id;
    const roleResult = await client.query(
      "SELECT role_id FROM userrole WHERE role_name = $1",
      ["Alumni"]
    );
    if (roleResult.rows.length === 0) {
      const newRole = await client.query(
        "INSERT INTO userrole (role_name) VALUES ($1) RETURNING role_id",
        ["Alumni"]
      );
      role_id = newRole.rows[0].role_id;
    } else {
      role_id = roleResult.rows[0].role_id;
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
    const accountResult = await client.query(
      "INSERT INTO webaccount (email, password, role_id) VALUES ($1, $2, $3) RETURNING account_id",
      [email, hashedPassword, role_id]
    );
    const new_account_id = accountResult.rows[0].account_id;

    // Auto-link to alumni record if one exists with the same email
    await client.query(
      "UPDATE upsealumni SET account_id = $1 WHERE current_email = $2 AND account_id IS NULL",
      [new_account_id, email]
    );
 
    await client.query("COMMIT");
    res.json({ message: "Account created successfully." });
 
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
 
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT w.account_id, w.email, w.password, r.role_name
       FROM webaccount w
       JOIN userrole r ON w.role_id = r.role_id
       WHERE w.email = $1`,
      [email]
    );
 
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
 
    const account = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, account.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
 
    const token = jwt.sign(
      { account_id: account.account_id, email: account.email, role: account.role_name },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
 
    const redirect =
      account.role_name === "Alumni" ? "/profile.html" : "/index.html";
 
    res.json({ token, role: account.role_name, redirect });
 
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /alumni-profile
// Returns the logged-in alumni's data using their email from the JWT
app.get("/alumni-profile", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const email = req.user.email;

    const alumniResult = await client.query(
      "SELECT * FROM upsealumni WHERE current_email = $1",
      [email]
    );

    if (alumniResult.rows.length === 0) {
      return res.status(404).json({ error: "No alumni record found for this account." });
    }

    const alumni = alumniResult.rows[0];
    const alumni_id = alumni.alumni_id;

    const academicHist = await client.query(
      "SELECT * FROM academichistory WHERE alumni_id = $1", [alumni_id]
    );
    const employmentHist = await client.query(
      "SELECT * FROM employmenthistory WHERE alumni_id = $1", [alumni_id]
    );
    const activeOrgs = await client.query(
      "SELECT * FROM activeorganizations WHERE alumni_id = $1", [alumni_id]
    );

    res.json({
      ...alumni,
      academicHist: academicHist.rows,
      employmentHist: employmentHist.rows,
      activeOrgs: activeOrgs.rows,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /alumni-profile
// Updates the logged-in alumni's data
app.put("/alumni-profile", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const email = req.user.email;
    const {
      first_name, last_name, middle_name, suffix, gender,
      phone_number, current_address, entry_date,
      academicHist, employmentHist, activeOrgs
    } = req.body;

    const alumniResult = await client.query(
      "SELECT alumni_id FROM upsealumni WHERE current_email = $1", [email]
    );
    if (alumniResult.rows.length === 0) {
      return res.status(404).json({ error: "No alumni record found." });
    }
    const alumni_id = alumniResult.rows[0].alumni_id;

    await client.query("BEGIN");

    // Update main alumni record
    await client.query(
      `UPDATE upsealumni SET
        first_name = $1, last_name = $2, middle_name = $3, suffix = $4,
        gender = $5, phone_number = $6, current_address = $7, entry_date = $8
       WHERE alumni_id = $9`,
      [first_name, last_name, middle_name, suffix, gender,
       phone_number, current_address, entry_date, alumni_id]
    );

    // Replace academic history
    await client.query("DELETE FROM academichistory WHERE alumni_id = $1", [alumni_id]);
    for (const a of academicHist) {
      await client.query(
        `INSERT INTO academichistory
         (alumni_id, degree_name, granting_university, year_started, semester_started, year_graduated, semester_graduated, latin_honor)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [alumni_id, a.degree_name, a.granting_university, a.year_started,
         a.semester_started, a.year_graduated, a.semester_graduated, a.latin_honor]
      );
    }

    // Replace employment history
    await client.query("DELETE FROM employmenthistory WHERE alumni_id = $1", [alumni_id]);
    for (const e of employmentHist) {
      await client.query(
        `INSERT INTO employmenthistory
         (alumni_id, employer, last_position_held, start_date, end_date, is_current)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [alumni_id, e.employer, e.last_position_held, e.start_date, e.end_date, e.is_current]
      );
    }

    // Replace active organizations
    await client.query("DELETE FROM activeorganizations WHERE alumni_id = $1", [alumni_id]);
    for (const o of activeOrgs) {
      await client.query(
        "INSERT INTO activeorganizations (alumni_id, organization_name) VALUES ($1,$2)",
        [alumni_id, o.organization_name]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Profile updated successfully." });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});