export function isValidAccountId(value: string) {
  return /^(ms|google)-[A-Za-z0-9._-]+$/.test(value);
}
