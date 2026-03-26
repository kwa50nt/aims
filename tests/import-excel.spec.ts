import { test, expect } from "@playwright/test";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// -----------------------------------------------------------------------
// Sample Data
// -----------------------------------------------------------------------
const rows = [
  { email: "test1@gmail.com", password: "123456", last_name: "Santos", first_name: "Maria", middle_name: "Cruz", suffix: "", gender: "F", student_number: "2019-90001", entry_date: "06-06-2019", current_email: "maria@gmail.com", phone_number: 9181111111, current_address: "Makati" },
  { email: "test2@gmail.com", password: "123456", last_name: "Reyes", first_name: "Jose", middle_name: "Bautista", suffix: "Jr.", gender: "M", student_number: "2019-90002", entry_date: "06-06-2019", current_email: "jose@gmail.com", phone_number: 9182222222, current_address: "Pasig" },
];

// -----------------------------------------------------------------------
// File Helpers
// -----------------------------------------------------------------------
const tmpDir = path.join(__dirname, "_tmp_files");
const xlsxPath = path.join(tmpDir, "test.xlsx");
const csvPath = path.join(tmpDir, "test.csv");

function createXlsx(rows: any[]) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  fs.writeFileSync(xlsxPath, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

function createCsv(rows: any[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  fs.writeFileSync(csvPath, csv);
}

// -----------------------------------------------------------------------
// Backend Helpers
// -----------------------------------------------------------------------
async function uploadFile(filePath: string) {
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(filePath)]), path.basename(filePath));

  const res = await fetch("http://localhost:3001/upload-excel", {
    method: "POST",
    body: formData,
  });

  return res.json();
}

async function getIds(studentNumbers: string[]) {
  const res = await fetch("http://localhost:3001/get-alumnis");
  const data = await res.json();

  const ids: number[] = [];
  for (const entry of Object.values(data) as any[]) {
    if (studentNumbers.includes(entry.student_number)) {
      ids.push(entry.alumni_id);
    }
  }
  return ids;
}

async function deleteIds(ids: number[]) {
  for (const id of ids) {
    await fetch(`http://localhost:3001/delete-alumni/${id}`, {
      method: "DELETE",
    });
  }
}

// -----------------------------------------------------------------------
// TEST SUITE
// -----------------------------------------------------------------------
test.describe("Excel Import (API-based)", () => {
  const studentNumbers = rows.map(r => r.student_number);
  let insertedIds: number[] = [];

  test.beforeAll(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  });

  test.afterAll(() => {
    if (fs.existsSync(xlsxPath)) fs.unlinkSync(xlsxPath);
    if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
  });

  // ---------------- XLSX FLOW ----------------
  test("Upload XLSX → verify → delete", async () => {
    createXlsx(rows);

    const response = await uploadFile(xlsxPath);
    expect(response.error).toBeFalsy();

    insertedIds = await getIds(studentNumbers);
    expect(insertedIds.length).toBe(rows.length);

    await deleteIds(insertedIds);

    const afterDelete = await getIds(studentNumbers);
    expect(afterDelete.length).toBe(0);
  });

  // ---------------- CSV FLOW ----------------
  test("Upload CSV → verify → delete", async () => {
    createCsv(rows);

    const response = await uploadFile(csvPath);
    expect(response.error).toBeFalsy();

    insertedIds = await getIds(studentNumbers);
    expect(insertedIds.length).toBe(rows.length);

    await deleteIds(insertedIds);

    const afterDelete = await getIds(studentNumbers);
    expect(afterDelete.length).toBe(0);
  });
});