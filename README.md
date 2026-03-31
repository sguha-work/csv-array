# csv-array

> Simple, lightweight, intelligent CSV-parser for Node.js — now in **TypeScript**

## What's New (v0.0.23)

- **TypeScript rewrite** — full type definitions, strict mode, ES2022 output
- **Worker-thread support** — CSV files larger than **3 MB** are automatically parsed on a separate `worker_threads` thread so your main thread stays responsive
- Exported types: `CSVObjectRow`, `CSVRow`, `ParseCSVCallback`
- Named export `parseCSV` in addition to the default export (backward-compatible)

---

## Dependencies

| Package | Purpose |
|---|---|
| `line-by-line` | Memory-efficient line streaming |
| `typescript` *(dev)* | Compiler |
| `@types/node` *(dev)* | Node.js type definitions |
| `@types/line-by-line` *(dev)* | Type definitions for line-by-line |

---

## Building from source

```bash
# install dependencies
npm install

# compile TypeScript → dist/ (ES2022 / CommonJS)
npm run build

# watch mode during development
npm run build:watch

# remove compiled output
npm run clean
```

The compiled output lands in `dist/`:

```
dist/
  csv-array.js       ← main entry (listed in package.json "main")
  csv-array.d.ts     ← type declarations
  csv-worker.js      ← worker thread (loaded automatically for large files)
```

---

## Installing (from npm)

```bash
npm install csv-array
```

---

## API

```ts
parseCSV(fileName, callBack, considerFirstRowAsHeading?)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | — | Path to the CSV file |
| `callBack` | `(data: CSVRow[]) => void` | — | Receives the parsed rows |
| `considerFirstRowAsHeading` | `boolean` | `true` | When `true` rows are objects keyed by the header row; when `false` all rows (including the header) are returned as arrays |

### Worker-thread behaviour

When the file size exceeds **3 MB** the library automatically spawns a `worker_threads` Worker to parse the CSV. The callback is still invoked in the **main thread** once parsing completes — your code does not change.

---

## Usage — TypeScript

```ts
import { parseCSV } from './dist/csv-array';
// or with default export:
import csvArray from './dist/csv-array';

// With heading (default)
parseCSV('test.csv', (data) => {
  console.log(JSON.stringify(data));
});

// Without heading
parseCSV('test.csv', (data) => {
  console.log(JSON.stringify(data));
}, false);
```

---

## Usage — JavaScript (unchanged)

```javascript
var csv = require('csv-array');

csv.parseCSV('test.csv', function(data) {
  console.log(JSON.stringify(data));
});
```

---

## Examples

`test.csv` contains:

```
Question Statement,Option 1,Option 2,Option 3,Option 4,Option 5,Answer,Deficulty,Category
this is a test question answer it?,answer 1,answer 2,answer3,answer 4,,answer 2,3,test
this is another test question answer it?,"answer1,answer2","answer2,answer3","answer4,answer5","answer5,answer6","answer7,answer8","answer1,answer2",2,test
```

### `considerFirstRowAsHeading = true` (default)

```javascript
csv.parseCSV('test.csv', function(data) {
  console.log(JSON.stringify(data));
});
```

Output:

```json
[
  {
    "Question Statement": "this is a test question answer it?",
    "Option 1": "answer 1",
    "Option 2": "answer 2",
    "Option 3": "answer3",
    "Option 4": "answer 4",
    "Option 5": "",
    "Answer": "answer 2",
    "Deficulty": "3",
    "Category": "test"
  },
  {
    "Question Statement": "this is another test question answer it?",
    "Option 1": "answer1,answer2",
    "Option 2": "answer2,answer3",
    "Option 3": "answer4,answer5",
    "Option 4": "answer5,answer6",
    "Option 5": "answer7,answer8",
    "Answer": "answer1,answer2",
    "Deficulty": "2",
    "Category": "test"
  }
]
```

### `considerFirstRowAsHeading = false`

```javascript
csv.parseCSV('test.csv', function(data) {
  console.log(JSON.stringify(data));
}, false);
```

Output:

```json
[
  ["Question Statement","Option 1","Option 2","Option 3","Option 4","Option 5","Answer","Deficulty","Category"],
  ["this is a test question answer it?","answer 1","answer 2","answer3","answer 4","","answer 2","3","test"],
  ["this is another test question answer it?","answer1,answer2","answer2,answer3","answer4,answer5","answer5,answer6","answer7,answer8","answer1,answer2","2","test"]
]
```

---

## Change log

| Version | Notes |
|---|---|
| 0.0.23 | TypeScript rewrite (ES2022), Worker-thread support for files > 3 MB |
| 0.0.22 | Dramatic speed improvements — please avoid versions 0.0.1x |

---

If you find any issues feel free to contact me at sguha1988.life@gmail.com
