import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const inputPath = resolve(process.argv[2] ?? "items.csv");
const outputPath = resolve(process.argv[3] ?? "static/items.json");

const arrayColumns = new Set([
  "item_effect",
  "item_trigger",
  "stats",
]);

const ignoredColumns = new Set(["effect_type"]);

const numberColumns = new Set(["tier", "upgrades_from", "upgrades_to"]);
const emptyValues = new Set(["", "N/A", "None"]);

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted value");

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function toSnakeCase(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toArray(value: string): string[] {
  if (emptyValues.has(value.trim())) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function convertValue(key: string, rawValue: string): string | number | null | string[] {
  const value = rawValue.trim();

  if (arrayColumns.has(key)) return toArray(value);
  if (emptyValues.has(value)) return null;

  if (numberColumns.has(key)) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      throw new Error(`Expected a number in ${key}, received "${value}"`);
    }
    return number;
  }

  return value;
}

const csv = await readFile(inputPath, "utf8");
const [headerRow, ...dataRows] = parseCsv(csv);

if (!headerRow) throw new Error("CSV is empty");

const headers = headerRow.map(toSnakeCase);
const items = dataRows.map((row, rowIndex) => {
  if (row.length !== headers.length) {
    throw new Error(
      `Row ${rowIndex + 2} has ${row.length} columns; expected ${headers.length}`,
    );
  }

  return Object.fromEntries(
    headers.flatMap((key, columnIndex) =>
      ignoredColumns.has(key) ? [] : [[key, convertValue(key, row[columnIndex])]],
    ),
  );
});

await writeFile(outputPath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
console.log(`Converted ${items.length} items from ${inputPath} to ${outputPath}`);
