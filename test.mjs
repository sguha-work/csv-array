/**
 * test.mjs — Manual test suite for csv-array (compiled from csv-array.ts)
 *
 * Run with:  node test.mjs
 *
 * data.csv is ~8.4 MB, so it exercises the Worker-thread path (> 10 MB threshold).
 */

import { parseCSV } from "./dist/csv-array.js";


// ─── Tiny test runner ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, extra = "") {
  if (condition) {
    console.log(`  ✅  PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌  FAIL — ${label}${extra ? ` → ${extra}` : ""}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(60));
}

// ── 1. parseCSV(data.csv) — Promise style, WITH headings (default) ────────

section("1. parseCSV Promise — with headings (data.csv ≈ 8.4 MB → Worker thread)");

try {
  const rows = await parseCSV("data.csv");

  assert("resolves to an array", Array.isArray(rows), typeof rows);
  assert("row count > 0", rows.length > 0, `rows.length = ${rows.length}`);

  // data.csv columns: Year, Industry_aggregation_NZSIOC, Industry_code_NZSIOC,
  //   Industry_name_NZSIOC, Units, Variable_code, Variable_name,
  //   Variable_category, Value, Industry_code_ANZSIC06
  const first = rows[0];
  assert("first row is a plain object",
    typeof first === "object" && !Array.isArray(first));

  const expectedKeys = [
    "Year",
    "Industry_aggregation_NZSIOC",
    "Industry_code_NZSIOC",
    "Industry_name_NZSIOC",
    "Units",
    "Variable_code",
    "Variable_name",
    "Variable_category",
    "Value",
    "Industry_code_ANZSIC06",
  ];
  for (const key of expectedKeys) {
    assert(
      `first row has key "${key}"`,
      key in first,
      `actual keys: ${JSON.stringify(Object.keys(first))}`
    );
  }

  assert("Year field is a numeric string",
    !isNaN(Number(first["Year"])),
    `Year = "${first["Year"]}"`);

  console.log(`\n  ℹ️   Total rows parsed: ${rows.length}`);
  console.log(`  ℹ️   First row: ${JSON.stringify(rows[0])}`);
} catch (err) {
  console.error("  ❌  Promise (with headings) threw:", err);
  failed++;
}

// ── 2. parseCSV(data.csv) — Callback style, WITH headings ────────────────

section("2. parseCSV Callback — with headings (data.csv)");

await new Promise((done) => {
  parseCSV("data.csv", (rows) => {
    assert("callback receives an array", Array.isArray(rows));
    assert("callback row count > 0", rows.length > 0, `rows.length = ${rows.length}`);

    const first = rows[0];
    assert("callback first row is a plain object",
      typeof first === "object" && !Array.isArray(first));
    assert("callback first row has 'Year'", "Year" in first);
    assert("callback first row has 'Value'", "Value" in first);

    console.log(`\n  ℹ️   Callback total rows: ${rows.length}`);
    done();
  });
});

// ── 3. parseCSV(data.csv) — Promise style, WITHOUT headings ──────────────

section("3. parseCSV Promise — WITHOUT headings (data.csv)");

try {
  const rows = await parseCSV("data.csv", undefined, false);

  assert("no-heading resolves to array", Array.isArray(rows));
  assert("no-heading row count > 1", rows.length > 1, `rows.length = ${rows.length}`);

  // When considerFirstRowAsHeading = false the first line is emitted as data,
  // and since it has multiple columns it should be returned as an array.
  const headerRow = rows[0];
  assert("row[0] is an array (multi-column, no-heading mode)",
    Array.isArray(headerRow),
    JSON.stringify(headerRow));

  assert("row[0][0] === 'Year' — original header returned as data",
    Array.isArray(headerRow) && headerRow[0] === "Year",
    JSON.stringify(headerRow));

  assert("row[1] is also an array (data rows are arrays)",
    Array.isArray(rows[1]),
    JSON.stringify(rows[1]));

  console.log(`\n  ℹ️   No-heading total rows: ${rows.length}`);
  console.log(`  ℹ️   Row[0] (header-as-data): ${JSON.stringify(rows[0])}`);
  console.log(`  ℹ️   Row[1] (first data row): ${JSON.stringify(rows[1])}`);
} catch (err) {
  console.error("  ❌  Promise (without headings) threw:", err);
  failed++;
}

// ── 4. parseCSV(data.csv) — Pagination ─────────────────────────────────────

section("4. parseCSV Promise — Pagination (data.csv)");

try {
  const rows = await parseCSV("data.csv", undefined, true, { start: 10, count: 5 });

  assert("pagination resolves to an array", Array.isArray(rows));
  assert("pagination row count exactly 5", rows.length === 5, `rows.length = ${rows.length}`);

  const first = rows[0];
  assert("paginated first row is a plain object",
    typeof first === "object" && !Array.isArray(first));
  assert("paginated first row has 'Year'", "Year" in first);

  console.log(`\n  ℹ️   Paginated total rows returned: ${rows.length}`);
  console.log(`  ℹ️   First paginated row: ${JSON.stringify(first)}`);
} catch (err) {
  console.error("  ❌  Promise (Pagination) threw:", err);
  failed++;
}

// ── 5. parseCSV — Non-existent file (graceful degradation) ───────────────

section("5. parseCSV — non-existent file (graceful degradation)");

// The library should log a warning and NOT resolve/reject.
// We race against a short timeout to confirm behaviour.
const TIMEOUT_MS = 500;
try {
  const racer = Promise.race([
    parseCSV("__does_not_exist__.csv"),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)
    ),
  ]);
  await racer;
  // If we get here the library unexpectedly resolved for a missing file.
  assert("missing file — should NOT resolve", false, "resolved unexpectedly");
} catch (err) {
  if (err.message === "timeout") {
    assert(
      "missing file — Promise neither resolves nor rejects within 500 ms (expected)",
      true
    );
  } else {
    assert("missing file — did not throw a hard error", false, err.message);
  }
}

// ─── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(60)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log("═".repeat(60));

if (failed > 0) process.exit(1);