export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

export function normalizeBooleanInput(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }

  return null;
}

export function parseOptionalBoolean(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return normalizeBooleanInput(value);
}
