export interface ImapConnectionConfig {
  email: string;
  displayName: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export function validateImapConnectionConfig(
  value: unknown,
): ImapConnectionConfig {
  if (!value || typeof value !== "object") {
    throw new TypeError("IMAP connection payload is required.");
  }

  const payload = value as Partial<Record<keyof ImapConnectionConfig, unknown>>;
  const email = assertText(payload.email, "IMAP email address", 320).toLowerCase();
  const displayName = assertText(payload.displayName, "Display name", 128);
  const host = assertText(payload.host, "IMAP host", 253).toLowerCase();
  const username = assertText(payload.username, "IMAP username", 320);
  const password = assertText(payload.password, "IMAP app password", 8192);
  const port = normalizePort(payload.port);
  const secure = payload.secure !== false;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TypeError("IMAP email address is invalid.");
  }

  if (!/^[A-Za-z0-9.-]+$/.test(host) || !host.includes(".")) {
    throw new TypeError("IMAP host is invalid.");
  }

  if (secure && port !== 993) {
    throw new TypeError("Secure IMAP connections must use port 993.");
  }

  if (!secure && port !== 143) {
    throw new TypeError("Plain IMAP connections must use port 143.");
  }

  return {
    email,
    displayName,
    host,
    port,
    secure,
    username,
    password,
  };
}

export function buildImapAccountId(email: string) {
  return `imap-${email.toLowerCase().replace(/[^A-Za-z0-9._-]/g, "_")}`;
}

function assertText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string") {
    throw new TypeError(`${label} is required.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new TypeError(`${label} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new TypeError(`${label} is too long.`);
  }

  return trimmed;
}

function normalizePort(value: unknown) {
  const port = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new TypeError("IMAP port is invalid.");
  }

  return port;
}
