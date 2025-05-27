import type { JsonLeafValue, JsonValue } from "./types";
import {
  ESCAPE_CHAR,
  SEPARATOR_CHAR,
  OBJECT_KV_CHAR,
  COLLECTION_START_CHAR,
  COLLECTION_END_CHAR,
  ESCAPABLE_CHARS,
  REGEX_SPECIAL_CHARS,
} from "./constants";

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

const parseLeafValue = (value: string): JsonLeafValue => {
  switch (value) {
    case `${ESCAPE_CHAR}n`:
      return null;
    case `${ESCAPE_CHAR}t`:
      return true;
    case `${ESCAPE_CHAR}f`:
      return false;
    default: {
      if (new RegExp(`^${ESCAPE_CHAR}-?\\d+(\\.\\d+)?(e[+-]?\\d+)?$`).test(value)) {
        return Number.parseFloat(value.slice(ESCAPE_CHAR.length));
      }
      return unescapeString(value);
    }
  }
};

/**
 * Parses an encoded string into a JSON-compatible value of type `T`.
 *
 * The function supports parsing of primitive values, arrays, and objects
 * encoded with custom escape and separator characters. It handles nested
 * structures and escaped characters within the encoded string.
 *
 * @typeParam T - The expected return type, extending `JsonValue`. Defaults to `JsonValue`.
 * @param encoded - The encoded string to parse.
 * @returns The parsed value as type `T`.
 */
export const parse = <T extends JsonValue = JsonValue>(encoded: string): T => {
  if (encoded.startsWith(ESCAPE_CHAR)) {
    return parseLeafValue(encoded) as T;
  }
  if (encoded.startsWith(COLLECTION_START_CHAR)) {
    const inner = encoded.slice(1, -1);
    if (inner === OBJECT_KV_CHAR) {
      return {} as T;
    }
    if (inner === "") {
      return [] as unknown as T;
    }
    const isEscaped = (str: string, pos: number) => {
      let count = 0;
      for (let i = pos - 1; i >= 0 && str[i] === ESCAPE_CHAR; i--) {
        count++;
      }
      return count % 2 === 1;
    };
    const findUnescaped = (char: string) => {
      for (let i = 0; i < inner.length; i++) {
        if (inner[i] === char && !isEscaped(inner, i)) {
          return i;
        }
      }
      return -1;
    };
    const firstUnescapedSep = findUnescaped(SEPARATOR_CHAR);
    const firstUnescapedColon = findUnescaped(OBJECT_KV_CHAR);
    if (
      !inner.startsWith(COLLECTION_START_CHAR) &&
      firstUnescapedColon !== -1 &&
      (firstUnescapedSep === -1 || firstUnescapedColon < firstUnescapedSep)
    ) {
      const result: Record<string, JsonValue> = {};
      let i = 0;
      while (i < inner.length) {
        let keyEnd = i;
        while (
          keyEnd < inner.length &&
          !(inner[keyEnd] === OBJECT_KV_CHAR && !isEscaped(inner, keyEnd))
        ) {
          keyEnd++;
        }
        let key = inner.slice(i, keyEnd);
        key = unescapeString(key);
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
        result[key] = parse(value);
        i = valueEnd + 1;
      }

      return result as T;
    }

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
      items.push(parse(item));
      i = itemEnd + 1;
    }
    return items as T;
  }

  return parseLeafValue(encoded) as T;
};
