/**
 * csv-array.ts
 * TypeScript port of csv-array.js
 *
 * Identical functionality to the original JS version with the addition of:
 *  - Full TypeScript types
 *  - Worker-thread based parsing for CSV files larger than 3 MB
 *
 * Compiles to ES2022 / CommonJS via tsconfig.json.
 */

import fs from "fs";
import path from "path";
import { Worker } from "worker_threads";
import LineByLine from "line-by-line";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Types ───────────────────────────────────────────────────────────────────

/** A row parsed with headings: keys are column names, values are cell strings */
export type CSVObjectRow = Record<string, string>;

/** A row parsed without headings: array of cell strings, or a bare string */
export type CSVRow = CSVObjectRow | string[] | string;

export type Pagination = {
  start: number;
  count: number;
};

/** Callback signature that consumers may supply to parseCSV */
export type ParseCSVCallback = (data: CSVRow[]) => void;

// ─── Constants ───────────────────────────────────────────────────────────────

/** Files larger than this (bytes) will be parsed on a dedicated Worker thread */
const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Parses a single CSV line and returns an array of field values.
 * Handles quoted fields that may contain commas.
 */
function getDataFromLine(line: string): string[] {
  const dataArray: string[] = [];
  let tempString = "";
  const lineLength = line.length;
  let index = 0;

  while (index < lineLength) {
    if (line[index] === '"') {
      let index2 = index + 1;
      while (index2 < lineLength && line[index2] !== '"') {
        tempString += line[index2];
        index2++;
      }
      dataArray.push(tempString);
      tempString = "";
      index = index2 + 2;
      continue;
    }
    if (line[index] !== ",") {
      tempString += line[index];
      index++;
      continue;
    }
    if (line[index] === ",") {
      dataArray.push(tempString);
      tempString = "";
      index++;
      continue;
    }
  }

  dataArray.push(tempString);
  return dataArray;
}

/**
 * Builds the output row for a given raw line, using the header array and the
 * considerFirstRowAsHeading flag to decide what shape the return value takes.
 */
function buildOutputData(
  tempAttributeNameArray: string[],
  line: string,
  considerFirstRowAsHeading: boolean
): CSVRow {
  const dataArray = getDataFromLine(line);

  if (!considerFirstRowAsHeading) {
    if (tempAttributeNameArray.length === 1) {
      return dataArray[0] ?? "";
    } else {
      return dataArray;
    }
  } else {
    const tempObject: CSVObjectRow = {};
    for (let index = 0; index < tempAttributeNameArray.length; index++) {
      tempObject[tempAttributeNameArray[index]] =
        dataArray[index] !== undefined ? dataArray[index] : "";
    }
    return tempObject;
  }
}

/**
 * Parses the file using the main-thread line-by-line reader.
 * Used for files that are ≤ 3 MB.
 */
function parseFile(
  fileName: string,
  resolve: (data: CSVRow[]) => void,
  considerFirstRowAsHeading: boolean
): void {
  const readStream = new LineByLine(fileName);

  const tempDataArray: CSVRow[] = [];
  let tempAttributeNameArray: string[] = [];
  let tempLineCounter = 0;

  readStream.on("error", () => {
    console.log("Cannot read the file any more.");
  });

  readStream.on("line", (line: string) => {
    readStream.pause();

    if (tempLineCounter === 0) {
      tempAttributeNameArray = line.split(",");
      if (!considerFirstRowAsHeading) {
        if (tempAttributeNameArray.length === 1) {
          tempDataArray.push(line);
        } else {
          tempDataArray.push(tempAttributeNameArray);
        }
      }
      tempLineCounter = 1;
    } else {
      tempDataArray.push(
        buildOutputData(tempAttributeNameArray, line, considerFirstRowAsHeading)
      );
    }

    readStream.resume();
  });

  readStream.on("end", () => {
    const result: CSVRow[] =
      tempDataArray.length === 0 ? tempAttributeNameArray : tempDataArray;
    resolve(result);
  });
}

/**
 * Offloads parsing to a Worker thread (used when file size > 3 MB).
 * The compiled worker script is expected at dist/csv-worker.js.
 */
function parseFileInWorker(
  fileName: string,
  resolve: (data: CSVRow[]) => void,
  considerFirstRowAsHeading: boolean,
  pagination: Pagination
): void {
  // Resolve the compiled worker path (dist/csv-worker.js)
  const workerScriptPath = path.resolve(__dirname, "csv-worker.js");

  const worker = new Worker(workerScriptPath, {
    workerData: { fileName, considerFirstRowAsHeading, pagination },
  });

  worker.on(
    "message",
    (msg: { data?: CSVRow[]; error?: string }) => {
      if (msg.error) {
        console.log("Worker error: " + msg.error);
      } else {
        resolve(msg.data ?? []);
      }
    }
  );

  worker.on("error", (err: Error) => {
    console.log("Worker encountered an error: " + err.message);
  });

  worker.on("exit", (code: number) => {
    if (code !== 0) {
      console.log("Worker stopped with exit code " + code);
    }
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Parses a CSV file and delivers the parsed rows either via callback or Promise.
 *
 * @param fileName                  - Path to the CSV file
 * @param callBack                  - Optional. When supplied, it is called with
 *                                    the parsed rows and `undefined` is returned.
 *                                    When omitted, a `Promise<CSVRow[]>` is
 *                                    returned instead.
 * @param considerFirstRowAsHeading - When `true` (default) the first row is used
 *                                    as object keys; when `false` all rows
 *                                    (including the first) are returned as arrays.
 *
 * @example — callback style
 * parseCSV('data.csv', (rows) => console.log(rows));
 *
 * @example — promise style
 * const rows = await parseCSV('data.csv');
 */
export function parseCSV(
  fileName: string,
  callBack: ParseCSVCallback,
  considerFirstRowAsHeading?: boolean,
  pagination?: Pagination
): void;
export function parseCSV(
  fileName: string,
  callBack?: undefined,
  considerFirstRowAsHeading?: boolean,
  pagination?: Pagination
): Promise<CSVRow[]>;
export function parseCSV(
  fileName: string,
  callBack?: ParseCSVCallback,
  considerFirstRowAsHeading = true,
  pagination?: Pagination
): void | Promise<CSVRow[]> {
  const run = (resolve: (data: CSVRow[]) => void): void => {
    fs.exists(fileName, (exists: boolean) => {
      if (exists) {
        const stat = fs.statSync(fileName);
        const fileSizeBytes = stat.size;

        if (fileSizeBytes > LARGE_FILE_THRESHOLD_BYTES) {
          // Large file → off-load to a Worker thread
          const activePagination = pagination ?? { start: 0, count: 100 };
          if (activePagination.count > 10000) {
            console.warn("Warning: count is set more than 10000");
          }
          parseFileInWorker(fileName, resolve, considerFirstRowAsHeading, activePagination);
        } else {
          // Small / medium file → parse on the main thread
          parseFile(fileName, resolve, considerFirstRowAsHeading);
        }
      } else {
        console.log(
          `The provided file ${fileName} doesn't exist or is inaccessible`
        );
      }
    });
  };

  if (callBack) {
    run(callBack);
    return;
  }

  return new Promise<CSVRow[]>((resolve) => run(resolve));
}
