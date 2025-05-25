export type JsonLeafValue = string | number | boolean | null;
export type JsonValue =
  | JsonLeafValue
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };
