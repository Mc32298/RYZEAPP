export function resolveMarkReadValue(value: unknown) {
  return typeof value === "boolean" ? value : true;
}
