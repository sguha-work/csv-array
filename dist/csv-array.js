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
// ─── Constants ───────────────────────────────────────────────────────────────
/** Files larger than this (bytes) will be parsed on a dedicated Worker thread */
const LARGE_FILE_THRESHOLD_BYTES = 3 * 1024 * 1024; // 3 MB
// ─── Internal helpers ────────────────────────────────────────────────────────
/**
 * Parses a single CSV line and returns an array of field values.
 * Handles quoted fields that may contain commas.
 */
function getDataFromLine(line) {
    const dataArray = [];
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
function buildOutputData(tempAttributeNameArray, line, considerFirstRowAsHeading) {
    const dataArray = getDataFromLine(line);
    if (!considerFirstRowAsHeading) {
        if (tempAttributeNameArray.length === 1) {
            return dataArray[0] ?? "";
        }
        else {
            return dataArray;
        }
    }
    else {
        const tempObject = {};
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
function parseFile(fileName, resolve, considerFirstRowAsHeading) {
    const readStream = new LineByLine(fileName);
    const tempDataArray = [];
    let tempAttributeNameArray = [];
    let tempLineCounter = 0;
    readStream.on("error", () => {
        console.log("Cannot read the file any more.");
    });
    readStream.on("line", (line) => {
        readStream.pause();
        if (tempLineCounter === 0) {
            tempAttributeNameArray = line.split(",");
            if (!considerFirstRowAsHeading) {
                if (tempAttributeNameArray.length === 1) {
                    tempDataArray.push(line);
                }
                else {
                    tempDataArray.push(tempAttributeNameArray);
                }
            }
            tempLineCounter = 1;
        }
        else {
            tempDataArray.push(buildOutputData(tempAttributeNameArray, line, considerFirstRowAsHeading));
        }
        readStream.resume();
    });
    readStream.on("end", () => {
        const result = tempDataArray.length === 0 ? tempAttributeNameArray : tempDataArray;
        resolve(result);
    });
}
/**
 * Offloads parsing to a Worker thread (used when file size > 3 MB).
 * The compiled worker script is expected at dist/csv-worker.js.
 */
function parseFileInWorker(fileName, resolve, considerFirstRowAsHeading, pagination) {
    // Resolve the compiled worker path (dist/csv-worker.js)
    const workerScriptPath = path.resolve(__dirname, "csv-worker.js");
    const worker = new Worker(workerScriptPath, {
        workerData: { fileName, considerFirstRowAsHeading, pagination },
    });
    worker.on("message", (msg) => {
        if (msg.error) {
            console.log("Worker error: " + msg.error);
        }
        else {
            resolve(msg.data ?? []);
        }
    });
    worker.on("error", (err) => {
        console.log("Worker encountered an error: " + err.message);
    });
    worker.on("exit", (code) => {
        if (code !== 0) {
            console.log("Worker stopped with exit code " + code);
        }
    });
}
export function parseCSV(fileName, callBack, considerFirstRowAsHeading = true, pagination) {
    const run = (resolve) => {
        fs.exists(fileName, (exists) => {
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
                }
                else {
                    // Small / medium file → parse on the main thread
                    parseFile(fileName, resolve, considerFirstRowAsHeading);
                }
            }
            else {
                console.log(`The provided file ${fileName} doesn't exist or is inaccessible`);
            }
        });
    };
    if (callBack) {
        run(callBack);
        return;
    }
    return new Promise((resolve) => run(resolve));
}
//# sourceMappingURL=csv-array.js.map