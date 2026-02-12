const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "alumni_db",
  password: "", // database password
  port: 5432,
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

    await client.query("DELETE FROM graduationinfo WHERE alumni_id = $1", [id]);
    await client.query("DELETE FROM employmenthistory WHERE alumni_id = $1", [id]);
    await client.query("DELETE FROM alumnidegrees WHERE alumni_id = $1", [id]);
    await client.query("DELETE FROM activeorganizations WHERE alumni_id = $1", [id]);

    await client.query("DELETE FROM upsealumni WHERE alumni_id = $1", [id]);

    await client.query("COMMIT");

    res.json("Alumni deleted successfully");

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
