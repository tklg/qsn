import { encode } from "./encode";

describe("encode", () => {
  it("encodes a simple string", () => {
    expect(encode("hello world")).toBe("hello%20world");
  });

  it("preserves commas and colons", () => {
    expect(encode("a,b:c")).toBe("a,b:c");
  });

  it("encodes other special characters", () => {
    expect(encode("a/b?c=d&e")).toBe("a%2Fb%3Fc%3Dd%26e");
  });

  it("handles strings with percent-encoded commas and colons", () => {
    expect(encode("foo,bar:baz")).toBe("foo,bar:baz");
  });

  it("handles empty string", () => {
    expect(encode("")).toBe("");
  });

  it("encodes unicode characters", () => {
    expect(encode("你好,世界:!")).toBe("%E4%BD%A0%E5%A5%BD,%E4%B8%96%E7%95%8C:!");
  });
});
