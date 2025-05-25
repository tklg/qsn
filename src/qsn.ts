import type { JsonLeafValue, JsonValue } from "./types";

const ESCAPE_CHAR = "!";
const SEPARATOR_CHAR = ",";
const OBJECT_KV_CHAR = ":";
const COLLECTION_START_CHAR = "[";
const COLLECTION_END_CHAR = "]";
const QUOTE_CHAR = "'";
const ESCAPABLE_CHARS = [
  ESCAPE_CHAR,
  SEPARATOR_CHAR,
  OBJECT_KV_CHAR,
  COLLECTION_START_CHAR,
  COLLECTION_END_CHAR,
  QUOTE_CHAR,
];
const REGEX_SPECIAL_CHARS = ["[", "("];

const isLeafValue = (value: unknown): value is JsonLeafValue => {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
};

const escapeString = (str: string): string => {
  if (str === "") {
    return "''";
  }

  const reg = new RegExp(
    `(${ESCAPABLE_CHARS.map((c) => (REGEX_SPECIAL_CHARS.includes(c) ? `\\${c}` : c)).join("|")})`,
    "g",
  );
  return str.replace(reg, "!$1");
};

const unescapeString = (str: string): string => {
  if (str === "''") {
    return "";
  }

  const reg = new RegExp(
    `${ESCAPE_CHAR}(${ESCAPABLE_CHARS.map((c) => (REGEX_SPECIAL_CHARS.includes(c) ? `\\${c}` : c)).join("|")})`,
    "g",
  );
  return str.replace(reg, "$1");
};

const encodeLeafValue = (value: JsonLeafValue): string => {
  if (value === null) {
    return `${ESCAPE_CHAR}n`;
  }

  if (typeof value === "boolean") {
    return `${ESCAPE_CHAR}${value.toString()[0]}`;
  }

  if (typeof value === "number") {
    return `${ESCAPE_CHAR}${value}`;
  }

  return escapeString(value);
};

const decodeLeafValue = (value: string): JsonLeafValue => {
  switch (value) {
    case `${ESCAPE_CHAR}n`:
      return null;
    case `${ESCAPE_CHAR}t`:
      return true;
    case `${ESCAPE_CHAR}f`:
      return false;
    default: {
      if (new RegExp(`^${ESCAPE_CHAR}-?\\d+(\\.\\d+)?(e[+-]\\d+)?$`).test(value)) {
        return Number.parseFloat(value.slice(ESCAPE_CHAR.length));
      }

      return unescapeString(value);
    }
  }
};

const encode = (json: JsonValue): string => {
  if (json === undefined) {
    return "";
  }

  if (isLeafValue(json)) {
    return encodeLeafValue(json);
  }

  if (Array.isArray(json)) {
    return `${COLLECTION_START_CHAR}${json.map(encode).join(SEPARATOR_CHAR)}${COLLECTION_END_CHAR}`;
  }

  if (typeof json === "object") {
    if (Object.keys(json).length === 0) {
      return `${COLLECTION_START_CHAR}${OBJECT_KV_CHAR}${COLLECTION_END_CHAR}`;
    }

    const encodedObject = Object.entries(json)
      .map(([k, v]) => {
        if (typeof k !== "string") {
          throw new Error("Keys must be strings.");
        }

        return `${escapeString(k)}${OBJECT_KV_CHAR}${encode(v)}`;
      })
      .join(SEPARATOR_CHAR);

    return `${COLLECTION_START_CHAR}${encodedObject}${COLLECTION_END_CHAR}`;
  }

  throw new Error(`Unsupported value type: ${typeof json}`);
};

const decode = <T extends JsonValue = JsonValue>(encoded: string): T => {
  if (encoded.startsWith(ESCAPE_CHAR)) {
    return decodeLeafValue(encoded) as T;
  }

  if (encoded.startsWith(COLLECTION_START_CHAR)) {
    // Remove the surrounding brackets
    const inner = encoded.slice(1, -1);

    if (inner === OBJECT_KV_CHAR) {
      return {} as T;
    }

    if (inner === "") {
      return [] as unknown as T; // empty array
    }

    // Helper to check if a character at pos is escaped
    const isEscaped = (str: string, pos: number) => {
      let count = 0;
      for (let i = pos - 1; i >= 0 && str[i] === ESCAPE_CHAR; i--) {
        count++;
      }
      return count % 2 === 1;
    };

    // Find first unescaped separator or colon
    const findUnescaped = (char: string) => {
      for (let i = 0; i < inner.length; i++) {
        if (inner[i] === char && !isEscaped(inner, i)) {
          return i;
        }
      }
      return -1;
    };

    // [[:],[:]]
    // [:],[:]
    const firstUnescapedSep = findUnescaped(SEPARATOR_CHAR);
    const firstUnescapedColon = findUnescaped(OBJECT_KV_CHAR);

    if (
      !inner.startsWith(COLLECTION_START_CHAR) && // If the inner part also starts with "[", it is in an array
      firstUnescapedColon !== -1 &&
      (firstUnescapedSep === -1 || firstUnescapedColon < firstUnescapedSep)
    ) {
      // Object
      const result: Record<string, JsonValue> = {};
      let i = 0;
      while (i < inner.length) {
        // Find key
        let keyEnd = i;
        while (
          keyEnd < inner.length &&
          !(inner[keyEnd] === OBJECT_KV_CHAR && !isEscaped(inner, keyEnd))
        ) {
          keyEnd++;
        }
        let key = inner.slice(i, keyEnd);
        key = unescapeString(key);

        // Find value (may be nested)
        const valueStart = keyEnd + 1;
        let depth = 0;
        let valueEnd = valueStart;
        while (valueEnd < inner.length) {
          const char = inner[valueEnd];
          if (char === COLLECTION_START_CHAR && !isEscaped(inner, valueEnd)) {
            depth++;
          }
          if (char === COLLECTION_END_CHAR && !isEscaped(inner, valueEnd)) {
            depth--;
          }
          if (depth === 0 && inner[valueEnd] === SEPARATOR_CHAR && !isEscaped(inner, valueEnd)) {
            break;
          }
          valueEnd++;
        }
        const value = inner.slice(valueStart, valueEnd);
        result[key] = decode(value);
        // Move to next
        i = valueEnd + 1;
      }
      return result as T;
    }

    // Array
    const items: JsonValue[] = [];
    let i = 0;
    while (i < inner.length) {
      let depth = 0;
      let itemEnd = i;
      while (itemEnd < inner.length) {
        const char = inner[itemEnd];
        if (char === COLLECTION_START_CHAR && !isEscaped(inner, itemEnd)) {
          depth++;
        }
        if (char === COLLECTION_END_CHAR && !isEscaped(inner, itemEnd)) {
          depth--;
        }
        if (depth === 0 && inner[itemEnd] === SEPARATOR_CHAR && !isEscaped(inner, itemEnd)) {
          break;
        }
        itemEnd++;
      }
      const item = inner.slice(i, itemEnd);
      items.push(decode(item));
      i = itemEnd + 1;
    }

    return items as T;
  }

  return decodeLeafValue(encoded) as T;
};

export const QSN = { stringify: encode, parse: decode };
