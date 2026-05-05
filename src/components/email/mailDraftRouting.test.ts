import { describe, expect, it } from "vitest";

import type { Account } from "@/types/email";

import {
  createComposeDraft,
  resolveCurrentUserEmail,
  resolveComposerAccount,
} from "./mailDraftRouting";

const microsoftAccount: Account = {
  id: "ms-1",
  name: "Outlook",
  email: "outlook@mail.test",
  initials: "O",
  color: "#123",
  provider: "microsoft",
};

const googleAccount: Account = {
  id: "google-1",
  name: "Gmail",
  email: "gmail@mail.test",
  initials: "G",
  color: "#456",
  provider: "google",
};

describe("resolveComposerAccount", () => {
  it("uses the message owning account when present", () => {
    expect(
      resolveComposerAccount([microsoftAccount, googleAccount], microsoftAccount, "google-1"),
    ).toMatchObject({
      id: "google-1",
      provider: "google",
      email: "gmail@mail.test",
    });
  });

  it("falls back to the current account when the owner is missing", () => {
    expect(
      resolveComposerAccount([microsoftAccount], microsoftAccount, "google-1"),
    ).toMatchObject({
      id: "ms-1",
      provider: "microsoft",
      email: "outlook@mail.test",
    });
  });
});

describe("createComposeDraft", () => {
  it("stamps the current account onto a fresh draft", () => {
    const draft = createComposeDraft({
      currentAccount: microsoftAccount,
      signatureHtml: "<div>Sig</div>",
    });

    expect(draft).toMatchObject({
      accountId: "ms-1",
      provider: "microsoft",
      body: "<div>Sig</div>",
    });
  });

  it("preserves the owning account when opening a reply draft", () => {
    const draft = createComposeDraft({
      currentAccount: microsoftAccount,
      signatureHtml: "<div>Sig</div>",
      prefill: {
        accountId: "google-1",
        provider: "google",
        to: "sender@mail.test",
        subject: "Re: hello",
      },
    });

    expect(draft).toMatchObject({
      accountId: "google-1",
      provider: "google",
      to: "sender@mail.test",
      subject: "Re: hello",
    });
  });
});

describe("resolveCurrentUserEmail", () => {
  it("uses the message owning account email for reading-pane reply context", () => {
    expect(
      resolveCurrentUserEmail(
        [microsoftAccount, googleAccount],
        microsoftAccount,
        "google-1",
      ),
    ).toBe("gmail@mail.test");
  });

  it("falls back to the selected account email when the owner is missing", () => {
    expect(
      resolveCurrentUserEmail([microsoftAccount], microsoftAccount, "google-1"),
    ).toBe("outlook@mail.test");
  });
});
