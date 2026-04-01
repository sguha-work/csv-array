/**
 * csv-worker.ts
 * Worker thread that handles CSV parsing for large files (> 3MB).
 * Receives { fileName, considerFirstRowAsHeading } via workerData,
 * processes the file using line-by-line, and posts the result back
 * to the main thread via parentPort.
 */

import { workerData, parentPort } from "worker_threads";
import LineByLine from "line-by-line";

interface WorkerInput {
  fileName: string;
  considerFirstRowAsHeading: boolean;
  pagination: { start: number; count: number };
}

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
 * Builds the output row data for a given line.
 * Returns an object (keyed by headings) or a primitive / array depending on config.
 */
function buildOutputData(
  tempAttributeNameArray: string[],
  line: string,
  considerFirstRowAsHeading: boolean
): Record<string, string> | string[] | string {
  const dataArray = getDataFromLine(line);

  if (!considerFirstRowAsHeading) {
    if (tempAttributeNameArray.length === 1) {
      return dataArray[0] ?? "";
    } else {
      return dataArray;
    }
  } else {
    const tempObject: Record<string, string> = {};
    for (let i = 0; i < tempAttributeNameArray.length; i++) {
      tempObject[tempAttributeNameArray[i]] =
        dataArray[i] !== undefined ? dataArray[i] : "";
    }
    return tempObject;
  }
}

const { fileName, considerFirstRowAsHeading, pagination } = workerData as WorkerInput;

const readStream = new LineByLine(fileName);
const tempDataArray: (Record<string, string> | string[] | string)[] = [];
let tempAttributeNameArray: string[] = [];
let tempLineCounter = 0;
let dataRowCount = 0;

readStream.on("error", () => {
  parentPort?.postMessage({ error: "Cannot read the file any more." });
});

readStream.on("line", (line: string) => {
  readStream.pause();

  if (tempLineCounter === 0) {
    tempAttributeNameArray = line.split(",");
    if (!considerFirstRowAsHeading) {
      if (dataRowCount >= pagination.start && dataRowCount < pagination.start + pagination.count) {
        if (tempAttributeNameArray.length === 1) {
          tempDataArray.push(line);
        } else {
          tempDataArray.push(tempAttributeNameArray);
        }
      }
      dataRowCount++;
    }
    tempLineCounter = 1;
  } else {
    if (dataRowCount >= pagination.start && dataRowCount < pagination.start + pagination.count) {
      tempDataArray.push(
        buildOutputData(tempAttributeNameArray, line, considerFirstRowAsHeading)
      );
    }
    dataRowCount++;
    
    // Stop reading early if we have fulfilled the pagination count
    if (dataRowCount >= pagination.start + pagination.count) {
      // @ts-ignore - LineByLine has a close method but it might not be in the typings
      if (typeof readStream.close === "function") {
        readStream.close();
      }
    }
  }

  readStream.resume();
});

readStream.on("end", () => {
  const result =
    tempDataArray.length === 0 && pagination.start === 0 && dataRowCount === 0
      ? tempAttributeNameArray
      : tempDataArray;
  parentPort?.postMessage({ data: result });
});
