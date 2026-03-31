/**
 * csv-worker.ts
 * Worker thread that handles CSV parsing for large files (> 3MB).
 * Receives { fileName, considerFirstRowAsHeading } via workerData,
 * processes the file using line-by-line, and posts the result back
 * to the main thread via parentPort.
 */
export {};
//# sourceMappingURL=csv-worker.d.ts.map