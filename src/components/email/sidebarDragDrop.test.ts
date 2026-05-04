import { describe, expect, it } from "vitest";
import {
  buildFolderDropPayload,
  DRAG_MIME_TYPE,
  hasDraggedEmailData,
  parseDraggedEmailData,
} from "./sidebarDragDrop";

describe("parseDraggedEmailData", () => {
  it("parses a valid dragged email payload", () => {
    const payload = parseDraggedEmailData((type) =>
      type === DRAG_MIME_TYPE
        ? JSON.stringify({
            emailId: "email-1",
            messageId: "message-1",
            folderId: "inbox",
            subject: "Quarterly review",
          })
        : "",
    );

    expect(payload).toEqual({
      emailId: "email-1",
      messageId: "message-1",
      folderId: "inbox",
      subject: "Quarterly review",
    });
  });

  it("returns null for malformed data", () => {
    const payload = parseDraggedEmailData(() => "{not-json");

    expect(payload).toBeNull();
  });

  it("returns null when required fields are missing", () => {
    const payload = parseDraggedEmailData(() =>
      JSON.stringify({
        emailId: "email-1",
        folderId: "inbox",
      }),
    );

    expect(payload).toBeNull();
  });
});

describe("buildFolderDropPayload", () => {
  it("returns null when dropping into the same folder", () => {
    const payload = buildFolderDropPayload(
      () =>
        JSON.stringify({
          emailId: "email-1",
          messageId: "message-1",
          folderId: "archive",
        }),
      "archive",
    );

    expect(payload).toBeNull();
  });

  it("builds a full move payload for a valid destination", () => {
    const payload = buildFolderDropPayload(
      () =>
        JSON.stringify({
          emailId: "email-1",
          messageId: "message-1",
          folderId: "inbox",
          subject: "Quarterly review",
        }),
      "archive",
    );

    expect(payload).toEqual({
      emailId: "email-1",
      messageId: "message-1",
      folderId: "inbox",
      subject: "Quarterly review",
      sourceFolderId: "inbox",
      destinationFolderId: "archive",
    });
  });
});

describe("hasDraggedEmailData", () => {
  it("accepts drags that advertise the email mime type", () => {
    expect(
      hasDraggedEmailData(["text/plain", DRAG_MIME_TYPE, "text/uri-list"]),
    ).toBe(true);
  });

  it("rejects unrelated drag types", () => {
    expect(hasDraggedEmailData(["Files", "text/plain"])).toBe(false);
  });
});
