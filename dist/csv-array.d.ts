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
export type Pagination = {
    start: number;
    count: number;
};
/** Callback signature that consumers may supply to parseCSV */
export type ParseCSVCallback = (data: CSVRow[]) => void;
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
export declare function parseCSV(fileName: string, callBack: ParseCSVCallback, considerFirstRowAsHeading?: boolean, pagination?: Pagination): void;
export declare function parseCSV(fileName: string, callBack?: undefined, considerFirstRowAsHeading?: boolean, pagination?: Pagination): Promise<CSVRow[]>;
//# sourceMappingURL=csv-array.d.ts.map