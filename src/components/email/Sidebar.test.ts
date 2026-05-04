import { describe, expect, it } from "vitest";
import { getSidebarFolderSections } from "./Sidebar";
import { MailFolder } from "@/types/email";

const folder = (overrides: Partial<MailFolder>): MailFolder => ({
  id: "folder",
  accountId: "account-1",
  displayName: "Folder",
  parentFolderId: "",
  wellKnownName: "",
  totalItemCount: 0,
  unreadItemCount: 0,
  ...overrides,
});

describe("getSidebarFolderSections", () => {
  it("keeps Inbox children reachable under the Inbox system folder", () => {
    const inbox = folder({
      id: "inbox-id",
      displayName: "Inbox",
      wellKnownName: "inbox",
    });
    const project = folder({
      id: "project-id",
      displayName: "Project",
      parentFolderId: inbox.id,
      path: "Inbox/Project",
    });

    const sections = getSidebarFolderSections([inbox, project], "account-1");

    expect(sections.systemFolders[0]).toMatchObject({
      key: "inbox",
      folder: inbox,
      hasChildren: true,
    });
    expect(sections.customRoots).toEqual([]);
  });
});
