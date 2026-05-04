import { describe, expect, it } from "vitest";
import { resolveMarkReadValue } from "./mailReadState";

describe("resolveMarkReadValue", () => {
  it("defaults missing payload values to true for mark-read requests", () => {
    expect(resolveMarkReadValue(undefined)).toBe(true);
  });

  it("preserves explicit boolean values", () => {
    expect(resolveMarkReadValue(true)).toBe(true);
    expect(resolveMarkReadValue(false)).toBe(false);
  });
});
