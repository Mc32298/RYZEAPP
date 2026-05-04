import { describe, expect, it } from "vitest";
import { buildGraphReplyPayload } from "./mailReplyPayload";

describe("buildGraphReplyPayload", () => {
  it("uses a Graph reply comment instead of requiring recipients", () => {
    expect(buildGraphReplyPayload("Hello")).toEqual({ comment: "Hello" });
  });

  it("keeps Graph happy when the reply text is empty", () => {
    expect(buildGraphReplyPayload("")).toEqual({ comment: " " });
  });
});
