import { QSN } from "./index";
import type { JsonValue } from "./types";

describe("QSN", () => {
  describe("encode and decode", () => {
    it("should encode and decode null", () => {
      const value: null = null;
      const encoded = QSN.encode(value);
      expect(encoded).toBe("!n");
      expect(QSN.decode(encoded)).toBe(null);

      expect(encoded).toMatchSnapshot();
    });

    it("should encode and decode booleans", () => {
      expect(QSN.decode(QSN.encode(true))).toBe(true);
      expect(QSN.decode(QSN.encode(false))).toBe(false);

      expect(QSN.encode(true)).toMatchSnapshot();
      expect(QSN.encode(false)).toMatchSnapshot();
    });

    it.each([
      [1234567890],
      [0.123456789e-12],
      [-9876.54321],
      [23456789012e66],
      [0],
      [1],
      [0.5],
      [98.6],
      [99.44],
      [1066],
      [1e1],
      [0.1e1],
      [1e-1],
      [1],
      [2],
      [2],
      [-42],
    ])("should encode and decode numbers - %s", (n) => {
      expect(QSN.decode(QSN.encode(n))).toBe(n);

      expect(QSN.encode(n)).toMatchSnapshot();
    });

    it("should encode e+ notation numbers as just e, with no +", () => {
      expect(QSN.encode(1.234e25)).toBe("!1.234e25");
    });

    it.each([
      [""],
      [";"],
      ["@"],
      ["/"],
      ["|"],
      ["&"],
      [" "],
      ['"'],
      ["\\"],
      ["\b\f\t"],
      ["/ & /"],
      ["abcdefghijklmnopqrstuvwyz"],
      ["ABCDEFGHIJKLMNOPQRSTUVWYZ"],
      ["0123456789"],
      ["space character"],
      ["`1~!@#$%^&*()_+-={':[,]}|;.</>?"],
      ["\u0123\u4567\u89AB\uCDEF\uabcd\uef4A"],
      ["// /* <!-- --"],
      ["# -- --> */"],
      ["@:0&@:0&@:0&:0"],
      ['{"object with 1 member":["array with 1 element"]}'],
      ["&#34; \u0022 %22 0x22 034 &#x22;"],
      ["/\\\"\uCAFE\uBABE\uAB98\uFCDE\ubcda\uef4A\b\f\t`1~!@#$%^&*()_+-=[]{}|;:',./<>?"],
    ])("should encode and decode strings - %s", (s) => {
      const encoded = QSN.encode(s);
      expect(QSN.decode(encoded)).toBe(s);
      expect(encoded).toMatchSnapshot();
    });

    it.each([
      [[]],
      [[[0]]],
      [[[[[[0]]]]]],
      [[[[[[0], 0]], 0]]],
      [[1, [2, [3, null]]]],
      [[1, "two", false, null]],
      [[null]],
    ])("should encode and decode arrays - %s", (s) => {
      const encoded = QSN.encode(s as JsonValue);
      expect(QSN.decode(encoded)).toEqual(s);

      expect(encoded).toMatchSnapshot();
    });

    it.each([[{}], [{ "": "" }], [{ a: 1, b: "two", c: false, d: null }]])(
      "should encode and decode objects - %s",
      (s) => {
        const encoded = QSN.encode(s);
        expect(QSN.decode(encoded)).toEqual(s);

        expect(encoded).toMatchSnapshot();
      },
    );

    it.each([
      [[{}, {}]],
      [[[], []]],
      [[[], {}]],
      [[{}, []]],
      [[{ "[]": "{}" }]],
      [{ foo: [2, { bar: [4, { baz: [6, { "deep enough": 7 }] }] }] }],
      [
        {
          num: 1,
          alpha: "abc",
          ignore: "me",
          change: "to a function",
          toUpper: true,
          obj: {
            nested_num: 50,
            alpha: "abc",
            nullable: null,
          },
          arr: [1, 7, 2],
        },
      ],
      [
        [
          "JSON makeTest Pattern pass1",
          { "object with 1 member": ["array with 1 element"] },
          {},
          [],
          -42,
          true,
          false,
          null,
          {
            integer: 1234567890,
            real: -9876.54321,
            e: 0.123456789e-12,
            E: 1.23456789e34,
            "": 23456789012e66,
            zero: 0,
            one: 1,
            space: " ",
            quote: '"',
            backslash: "\\",
            controls: "\b\f\n\r\t",
            slash: "/ & /",
            alpha: "abcdefghijklmnopqrstuvwyz",
            ALPHA: "ABCDEFGHIJKLMNOPQRSTUVWYZ",
            digit: "0123456789",
            "0123456789": "digit",
            special: "`1~!@#$%^&*()_+-={':[,]}|;.</>?",
            hex: "\u0123\u4567\u89AB\uCDEF\uabcd\uef4A",
            true: true,
            false: false,
            null: null,
            array: [],
            object: {},
            address: "50 St. James Street",
            url: "http://www.JSON.org/",
            comment: "// /* <!-- --",
            "# -- --> */": " ",
            " s p a c e d ": [1, 2, 3, 4, 5, 6, 7],
            compact: [1, 2, 3, 4, 5, 6, 7],
            jsontext: '{"object with 1 member":["array with 1 element"]}',
            quotes: "&#34; \u0022 %22 0x22 034 &#x22;",
            "/\\\"\uCAFE\uBABE\uAB98\uFCDE\ubcda\uef4A\b\f\n\r\t`1~!@#$%^&*()_+-=[]{}|;:',./<>?":
              "A key can be any string",
          },
          0.5,
          98.6,
          99.44,
          1066,
          1e1,
          0.1e1,
          1e-1,
          1,
          2,
          2,
          "beans",
        ],
      ],
    ])("should encode and decode complex structures - %s", (s) => {
      const encoded = QSN.encode(s as JsonValue);
      expect(QSN.decode(encoded)).toEqual(s);

      expect(encoded).toMatchSnapshot();
    });

    it("should escape and unescape special characters in keys and values", () => {
      const obj = { "!key,:[": "!value,:[" };
      const encoded = QSN.encode(obj);
      expect(QSN.decode(encoded)).toEqual(obj);
      expect(encoded).toMatchSnapshot();
    });
  });
});
