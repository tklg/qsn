/**
 * Encodes a string using `encodeURIComponent`, but preserves commas (`,`) and colons (`:`)
 * by decoding their percent-encoded representations back to the original characters.
 *
 * @param value - The string to encode.
 * @returns The encoded string with commas and colons preserved.
 */
export const encode = (value: string) => {
  return encodeURIComponent(value).replace(/%2C/g, ",").replace(/%3A/g, ":");
};
