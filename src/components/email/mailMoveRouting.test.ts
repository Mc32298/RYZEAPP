import { describe, expect, it } from "vitest";

import { resolveMailMoveOperation } from "./mailMoveRouting";

describe("resolveMailMoveOperation", () => {
  it("routes microsoft moves by folder id", () => {
    expect(
      resolveMailMoveOperation({
        provider: "microsoft",
        destinationFolderId: "archive-id",
      }),
    ).toEqual({
      provider: "microsoft",
      destinationFolderId: "archive-id",
    });
  });

  it("maps gmail trash moves to the TRASH system label", () => {
    expect(
      resolveMailMoveOperation({
        provider: "google",
        destinationFolderId: "TRASH",
      }),
    ).toEqual({
      provider: "google",
      destination: "TRASH",
    });
  });

  it("maps gmail archive moves to the ARCHIVE system destination", () => {
    expect(
      resolveMailMoveOperation({
        provider: "google",
        destinationFolderId: "ARCHIVE",
      }),
    ).toEqual({
      provider: "google",
      destination: "ARCHIVE",
    });
  });

  it("normalizes deleteditems to gmail trash", () => {
    expect(
      resolveMailMoveOperation({
        provider: "google",
        destinationFolderId: "deleteditems",
      }),
    ).toEqual({
      provider: "google",
      destination: "TRASH",
    });
  });
});
