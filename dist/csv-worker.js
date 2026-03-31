/**
 * csv-worker.ts
 * Worker thread that handles CSV parsing for large files (> 3MB).
 * Receives { fileName, considerFirstRowAsHeading } via workerData,
 * processes the file using line-by-line, and posts the result back
 * to the main thread via parentPort.
 */
import { workerData, parentPort } from "worker_threads";
import LineByLine from "line-by-line";
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
 * Builds the output row data for a given line.
 * Returns an object (keyed by headings) or a primitive / array depending on config.
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
        for (let i = 0; i < tempAttributeNameArray.length; i++) {
            tempObject[tempAttributeNameArray[i]] =
                dataArray[i] !== undefined ? dataArray[i] : "";
        }
        return tempObject;
    }
}
const { fileName, considerFirstRowAsHeading } = workerData;
const readStream = new LineByLine(fileName);
const tempDataArray = [];
let tempAttributeNameArray = [];
let tempLineCounter = 0;
readStream.on("error", () => {
    parentPort?.postMessage({ error: "Cannot read the file any more." });
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
    parentPort?.postMessage({ data: result });
});
//# sourceMappingURL=csv-worker.js.map