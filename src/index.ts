import { encode } from "./encode";
import { parse } from "./parse";
import { stringify } from "./stringify";
import type { JsonValue } from "./types";

/**
 * Utility object for encoding, decoding, stringifying, and parsing JSON-compatible values.
 */
export const QSN = {
  /** Serializes a `JsonValue` into a string */
  stringify,
  /** Parses an encoded string into a JSON-compatible value of type `T` */
  parse,
  /** Encodes a JSON-compatible value as a URI-safe string. */
  encode: (value: JsonValue): string => {
    return encode(stringify(value));
  },
  /** Decodes a URI-encoded string into a JSON-compatible value. */
  decode: <T extends JsonValue>(value: string): T => {
    return parse(decodeURIComponent(value));
  },
};
