import { describe, expect, it } from "vitest";

import { validateImapConnectionConfig } from "./imapConfig";

describe("validateImapConnectionConfig", () => {
  it("normalizes a secure IMAP connection payload", () => {
    expect(
      validateImapConnectionConfig({
        email: "  user@example.com ",
        displayName: " User Example ",
        host: " IMAP.EXAMPLE.COM ",
        port: 993,
        secure: true,
        username: " user@example.com ",
        password: "app-password",
      }),
    ).toEqual({
      email: "user@example.com",
      displayName: "User Example",
      host: "imap.example.com",
      port: 993,
      secure: true,
      username: "user@example.com",
      password: "app-password",
    });
  });

  it("rejects insecure IMAP ports unless TLS is disabled explicitly", () => {
    expect(() =>
      validateImapConnectionConfig({
        email: "user@example.com",
        displayName: "User Example",
        host: "imap.example.com",
        port: 143,
        secure: true,
        username: "user@example.com",
        password: "app-password",
      }),
    ).toThrow("Secure IMAP connections must use port 993.");
  });

  it("rejects missing app passwords", () => {
    expect(() =>
      validateImapConnectionConfig({
        email: "user@example.com",
        displayName: "User Example",
        host: "imap.example.com",
        port: 993,
        secure: true,
        username: "user@example.com",
        password: " ",
      }),
    ).toThrow("IMAP app password is required.");
  });
});
