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
/** A row parsed with headings: keys are column names, values are cell strings */
export type CSVObjectRow = Record<string, string>;
/** A row parsed without headings: array of cell strings, or a bare string */
export type CSVRow = CSVObjectRow | string[] | string;
/** Callback signature that consumers may supply to parseCSV */
export type ParseCSVCallback = (data: CSVRow[]) => void;
/**
 * Parses a single CSV line and returns an array of field values.
 * Handles quoted fields that may contain commas.
 */
declare function getDataFromLine(line: string): string[];
/**
 * Builds the output row for a given raw line, using the header array and the
 * considerFirstRowAsHeading flag to decide what shape the return value takes.
 */
declare function buildOutputData(tempAttributeNameArray: string[], line: string, considerFirstRowAsHeading: boolean): CSVRow;
/**
 * Parses the file using the main-thread line-by-line reader.
 * Used for files that are ≤ 3 MB.
 */
declare function parseFile(fileName: string, resolve: (data: CSVRow[]) => void, considerFirstRowAsHeading: boolean): void;
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
export declare function parseCSV(fileName: string, callBack: ParseCSVCallback, considerFirstRowAsHeading?: boolean): void;
export declare function parseCSV(fileName: string, callBack?: undefined, considerFirstRowAsHeading?: boolean): Promise<CSVRow[]>;
declare const csvArray: {
    parseCSV: typeof parseCSV;
    /** @internal Exposed for testing; prefer parseCSV for normal use */
    getDataFromLine: typeof getDataFromLine;
    /** @internal Exposed for testing; prefer parseCSV for normal use */
    buildOutputData: typeof buildOutputData;
    /** @internal Exposed for testing; prefer parseCSV for normal use */
    parseFile: typeof parseFile;
};
export default csvArray;
//# sourceMappingURL=csv-array.d.ts.map