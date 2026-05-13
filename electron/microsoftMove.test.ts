import { describe, expect, it } from "vitest";

import { resolveMicrosoftDestinationId } from "./microsoftMove";

describe("resolveMicrosoftDestinationId", () => {
  it("keeps explicit Outlook folder ids intact", () => {
    expect(
      resolveMicrosoftDestinationId({
        destination:
          "AAMkAGYxZTk2YzBmLTY4ZmEtNGEzYi05YjMwLTAwAi0AAADQ-custom-folder",
        folders: [
          {
            id: "AAMkAGYxZTk2YzBmLTY4ZmEtNGEzYi05YjMwLTAwAi0AAADQ-custom-folder",
            wellKnownName: "",
          },
        ],
      }),
    ).toBe("AAMkAGYxZTk2YzBmLTY4ZmEtNGEzYi05YjMwLTAwAi0AAADQ-custom-folder");
  });

  it("maps well-known deleteditems to the actual Outlook folder id when present", () => {
    expect(
      resolveMicrosoftDestinationId({
        destination: "deleteditems",
        folders: [
          {
            id: "AAMkAGYxZTk2YzBmLTY4ZmEtNGEzYi05YjMwLTAwAi0AAADQ-trash-folder",
            wellKnownName: "deleteditems",
          },
        ],
      }),
    ).toBe("AAMkAGYxZTk2YzBmLTY4ZmEtNGEzYi05YjMwLTAwAi0AAADQ-trash-folder");
  });

  it("falls back to the well-known name when no local folder row exists yet", () => {
    expect(
      resolveMicrosoftDestinationId({
        destination: "archive",
        folders: [],
      }),
    ).toBe("archive");
  });
});
