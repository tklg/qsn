# QSN: Query String Notation

QSN is a compact, human-readable, and URL-safe encoding for JSON-like data structures. It is designed for use in query strings, URLs, and other contexts where you want to serialize objects, arrays, and primitive values in a way that is shorter and more readable than JSON, but still reversible and robust.

## Features
- Encodes and decodes all JSON-compatible values: objects, arrays, strings, numbers, booleans, and null
- Escapes special characters for safe embedding in URLs
- Handles nested and complex structures
- Much more compact than JSON+encodeURIComponent for most use cases
- Zero dependencies, TypeScript support

## Install
```sh
npm install qsn
```

## Usage

### Import
```ts
import { QSN } from "qsn";
```

### Encoding
```ts
const obj = { foo: "bar", arr: [1, 2, 3], flag: true };
const encoded = QSN.stringify(obj);
console.log(encoded); // [foo:bar,arr:[!1,!2,!3],flag:!t]
```

### Decoding
```ts
const decoded = QSN.parse(encoded);
console.log(decoded); // { foo: "bar", arr: [1, 2, 3], flag: true }
```

### Works with arrays and primitives
```ts
QSN.stringify([1, "two", false, null]); // [!1,two,!f,!n]
QSN.parse("[!1,two,!f,!n]"); // [1, "two", false, null]

QSN.stringify("hello, world!"); // hello!, world!!
QSN.parse("hello!, world!!"); // "hello, world!"
```

### Handles nested objects and arrays
```ts
const value = {
  arr: [1, { foo: "bar", baz: [true, false, null] }],
  str: "hello, world!",
  num: 123,
  bool: true,
  nil: null,
};
const encoded = QSN.stringify(value);
console.log(encoded); // [arr:[!1,[foo:bar,baz:[!t,!f,!n]]],str:hello!, world!!,num:!123,bool:!t,nil:!n]
console.log(QSN.parse(encoded)); // original object
```

## API

### QSN.stringify(value: JsonValue): string
Encodes a value (object, array, string, number, boolean, or null) into QSN format.

### QSN.parse(str: string): JsonValue
Decodes a QSN string back into the original value.

## When to use QSN?
- When you need to pass structured data in a URL or query string
- When you want something more compact and readable than JSON+encodeURIComponent
- When you want a reversible, robust, and dependency-free encoding

## License
MIT
