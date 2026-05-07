export function isValidAccountId(value: string) {
  return /^(ms|google|imap)-[A-Za-z0-9._-]+$/.test(value);
}
