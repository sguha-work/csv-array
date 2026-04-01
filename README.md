# csv-array

> Simple, lightweight, intelligent CSV-parser for Node.js — now in **TypeScript**

## What's New
- **TypeScript rewrite** — full type definitions, strict mode, ES2022 output.
- **Promise support** — callbacks are now optional; you can `await` the result.
- **Worker-thread support** — parsing of CSV files larger than **3 MB** is automatically off-loaded to a separate `worker_threads` thread so your main thread stays responsive.
- **Pagination** — query large datasets selectively and securely using `{ start, count }`.

---

## Installation

```bash
npm install csv-array
```

---

## How to Use the Package

This package exports a highly efficient function to parse CSV files. Under the hood, it intelligently shifts between main-thread streaming and worker-thread batching depending on the size of the target payload.

### API: `parseCSV`

```ts
function parseCSV(
  fileName: string,
  callBack?: ParseCSVCallback,
  considerFirstRowAsHeading?: boolean,
  pagination?: Pagination
): void | Promise<CSVRow[]>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fileName` | `string` | **Required** | The relative or absolute path to the CSV file you want to parse. |
| `callBack` | `function` | `undefined` | A callback function receiving the parsed rows array. If omitted, `parseCSV` returns a **Promise**. |
| `considerFirstRowAsHeading` | `boolean` | `true` | When `true`, rows are parsed as objects mapping column headers to row values. When `false`, rows are returned as plain string arrays. |
| `pagination` | `{ start: number, count: number }` | `undefined` | (For files > 3MB) Fetches a specific slice of the parsed rows without bloating memory. **Note:** If omitted on >3MB files, it defaults to `{start: 0, count: 100}`. A console warning occurs if `count > 10000`. |

### Behavior & Features

#### Promises vs Callbacks
You can use standard callbacks or omit the callback parameter entirely to receive a `Promise<CSVRow[]>`:
```js
// Standard async/await Promises
const data = await parseCSV("data.csv");

// Callbacks
parseCSV("data.csv", (data) => console.log(data));
```

#### Large File Execution (Worker Thread)
If your provided file exceeds **10 MB** in size, `csv-array` automatically spawns a Node.js `worker_threads` instance. This completely isolates heavy disk I/O and string parsing logic, meaning your main server thread will never freeze. Your API usage patterns remain identical whether the file is 1 MB or 2 GB.

#### Memory-safe Pagination
Reading massive CSV files into an array often results in Out of Memory crash errors. To prevent this, structural `pagination` can be strictly applied. The internal stream closes the moment your requested chunk is achieved, ensuring optimal execution times.

---

## Change log

| Version | Notes |
|---------|-------|
| 0.0.23 | Complete TypeScript rewrite (ES2022). Optional Promises/async compatibility. Worker-thread execution scaling for large files > 10 MB. Stream pagination and safe default limitations. |
| 0.0.22 | Dramatic speed improvements — please avoid versions 0.0.1x |

---

## Example of Use in TypeScript

The library is cleanly typed, exporting standard module boundaries like `parseCSV`, and typings like `CSVRow`, `CSVObjectRow`, and `Pagination`. This allows deep integration into strict typed pipelines.

### Initialization & usage

```ts
import { parseCSV, CSVRow, Pagination } from 'csv-array';

async function processData() {
  
  // Example 1: Standard usage with headings (Returns an array of objects)
  // No callback is passed, so we can await it cleanly!
  const users = await parseCSV('users.csv');
  console.log('First user name:', users[0]['Name']);

  // Example 2: Without heading objects (Returns an array of raw strings)
  const rawRows = await parseCSV('data.csv', undefined, false);
  console.log('Header keys:', rawRows[0]);
  console.log('First entry payload:', rawRows[1]);

  // Example 3: Handling massive files using Pagination & Callbacks
  const paginationConfig: Pagination = { start: 1500, count: 25 };
  
  parseCSV(
    'massive-system-dataset.csv', 
    (data: CSVRow[]) => {
       console.log(`Memory-safe slice executed! Received ${data.length} records.`);
    }, 
    true, 
    paginationConfig
  );

}

processData();
```

---

*If you find any issues feel free to contact me at sguha1988.life@gmail.com*
