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
npm install @objectively/qsn
```

## Usage

### Import
```ts
import { QSN } from "@objectively/qsn";
```

### Stringify
```ts
const obj = { foo: "bar", arr: [1, 2, 3], flag: true };
const encoded = QSN.stringify(obj);
console.log(encoded); // (foo:bar,arr:(!1,!2,!3),flag:!t)
```

### Parse
```ts
const decoded = QSN.parse(encoded);
console.log(decoded); // { foo: "bar", arr: [1, 2, 3], flag: true }
```

### Works with arrays and primitives
```ts
QSN.stringify([1, "two", false, null]); // (!1,two,!f,!n)
QSN.parse("(!1,two,!f,!n)"); // [1, "two", false, null]

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
console.log(encoded); // (arr:(!1,(foo:bar,baz:(!t,!f,!n))),str:hello!, world!!,num:!123,bool:!t,nil:!n)
console.log(QSN.parse(encoded)); // original object
```

## API

### QSN.stringify(value: JsonValue): string
Encodes a value (object, array, string, number, boolean, or null) into QSN format.

### QSN.parse(str: string): JsonValue
Decodes a QSN string back into the original value.

### QSN.encode(value: JsonValue): string
Similar to `stringify`, but runs the result through a modified `encodeURIComponent` that does not %-encode the comma (`,`) and colon (`:`) characters.

### QSN.decode(value: string): JsonValue
Similar to `parse`, but runs the input through `decodeURIComponent` first.

## Example: Constructing a Query String

You can use QSN to easily encode structured data for use in a URL query string:

```ts
import { QSN } from "@objectively/qsn";

const params = {
  user: "alice",
  filters: { tags: ["cat", "dog"], active: true },
  page: 2,
};

const queryString = `?data=${QSN.encode(params)}`;
// Result: ?data=(user:alice,filters:(tags:(!cat,!dog),active:!t),page:!2)

// To decode on the other side:
const decoded = QSN.decode(queryString.slice(6));
// decoded is the original params object
```

## When to use QSN?
- When you need to pass structured data in a URL or query string
- When you want something more compact and readable than JSON+encodeURIComponent
- When you want a reversible, robust, and dependency-free encoding

## License
MIT
