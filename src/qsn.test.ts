import { QSN } from "./qsn";

describe("QSN", () => {
  describe("stringify and parse", () => {
    it("should encode and decode null", () => {
      const value: null = null;
      const encoded = QSN.stringify(value);
      expect(encoded).toBe("!n");
      expect(QSN.parse(encoded)).toBe(null);

      expect(encoded).toMatchSnapshot();
    });

    it("should encode and decode booleans", () => {
      expect(QSN.parse(QSN.stringify(true))).toBe(true);
      expect(QSN.parse(QSN.stringify(false))).toBe(false);

      expect(QSN.stringify(true)).toMatchSnapshot();
      expect(QSN.stringify(false)).toMatchSnapshot();
    });

    it("should encode and decode numbers", () => {
      expect(QSN.parse(QSN.stringify(42))).toBe(42);
      expect(QSN.parse(QSN.stringify(-3.14))).toBe(-3.14);

      expect(QSN.stringify(42)).toMatchSnapshot();
      expect(QSN.stringify(-3.14)).toMatchSnapshot();
    });

    it("should encode and decode strings", () => {
      expect(QSN.parse(QSN.stringify("hello"))).toBe("hello");
      expect(QSN.parse(QSN.stringify("!,:["))).toBe("!,:[");

      expect(QSN.stringify("hello")).toMatchSnapshot();
      expect(QSN.stringify("!,:[")).toMatchSnapshot();
    });

    it("should encode and decode arrays", () => {
      const arr = [1, "two", false, null];
      const encoded = QSN.stringify(arr);
      expect(QSN.parse(encoded)).toEqual(arr);
      expect(encoded).toMatchSnapshot();
    });

    it("should encode and decode nested arrays", () => {
      const arr = [1, [2, [3, null]], "test"];
      const encoded = QSN.stringify(arr);
      expect(QSN.parse(encoded)).toEqual(arr);
      expect(encoded).toMatchSnapshot();
    });

    it("should encode and decode objects", () => {
      const obj = { a: 1, b: "two", c: false, d: null };
      const encoded = QSN.stringify(obj);
      expect(QSN.parse(encoded)).toEqual(obj);
      expect(encoded).toMatchSnapshot();
    });

    it("should encode and decode nested objects", () => {
      const obj = { a: { b: { c: [1, 2, 3] } }, d: "test" };
      const encoded = QSN.stringify(obj);
      expect(QSN.parse(encoded)).toEqual(obj);
      expect(encoded).toMatchSnapshot();
    });

    it("should encode and decode complex structures", () => {
      const value = {
        arr: [1, { foo: "bar", baz: [true, false, null] }],
        str: "hello,world!",
        num: 123,
        bool: true,
        nil: null,
      };
      const encoded = QSN.stringify(value);
      expect(QSN.parse(encoded)).toEqual(value);
      expect(encoded).toMatchSnapshot();
    });

    it("should handle empty array and object", () => {
      expect(QSN.parse(QSN.stringify([]))).toEqual([]);
      expect(QSN.parse(QSN.stringify({}))).toEqual({});
      expect(QSN.stringify([])).toMatchSnapshot();
      expect(QSN.stringify({})).toMatchSnapshot();
    });

    it("should escape and unescape special characters in keys and values", () => {
      const obj = { "!key,:[": "!value,:[" };
      const encoded = QSN.stringify(obj);
      expect(QSN.parse(encoded)).toEqual(obj);
      expect(encoded).toMatchSnapshot();
    });
  });
});
