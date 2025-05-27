import type { JsonLeafValue, JsonValue } from "./types";
import {
  ESCAPE_CHAR,
  SEPARATOR_CHAR,
  OBJECT_KV_CHAR,
  COLLECTION_START_CHAR,
  COLLECTION_END_CHAR,
  ESCAPABLE_CHARS,
  REGEX_SPECIAL_CHARS,
  PLUS_EXPONENT_REGEX,
} from "./constants";

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

const stringifyLeafValue = (value: JsonLeafValue): string => {
  if (value === null) {
    return `${ESCAPE_CHAR}n`;
  }
  if (typeof value === "boolean") {
    return `${ESCAPE_CHAR}${value.toString()[0]}`;
  }
  if (typeof value === "number") {
    let str = value.toString();
    if (PLUS_EXPONENT_REGEX.test(str)) {
      str = str.replace("e+", "e");
    }
    return `${ESCAPE_CHAR}${str}`;
  }
  return escapeString(value);
};

export const stringify = (json: JsonValue): string => {
  if (json === undefined) {
    return "";
  }
  if (isLeafValue(json)) {
    return stringifyLeafValue(json);
  }
  if (Array.isArray(json)) {
    return `${COLLECTION_START_CHAR}${json.map(stringify).join(SEPARATOR_CHAR)}${COLLECTION_END_CHAR}`;
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
        return `${escapeString(k)}${OBJECT_KV_CHAR}${stringify(v)}`;
      })
      .join(SEPARATOR_CHAR);
    return `${COLLECTION_START_CHAR}${encodedObject}${COLLECTION_END_CHAR}`;
  }
  throw new Error(`Unsupported value type: ${typeof json}`);
};
