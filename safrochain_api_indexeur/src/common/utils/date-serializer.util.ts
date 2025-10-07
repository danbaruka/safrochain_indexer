import { Transform } from "class-transformer";

/**
 * Custom transformer to ensure dates are serialized as ISO strings
 */
export const DateSerializer = () =>
  Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "string" && !isNaN(Date.parse(value))) {
      return new Date(value).toISOString();
    }
    return value;
  });

/**
 * Serialize a date to ISO string format
 */
export function serializeDate(
  date: Date | string | null | undefined
): string | null {
  if (!date) return null;

  if (typeof date === "string") {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
  }

  if (date instanceof Date) {
    return date.toISOString();
  }

  return null;
}

/**
 * Serialize multiple dates in an object
 */
export function serializeDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }

  if (typeof obj === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if the key suggests it's a date field
      if (
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("time") ||
        key.toLowerCase().includes("timestamp") ||
        key.toLowerCase().includes("created") ||
        key.toLowerCase().includes("updated") ||
        key.toLowerCase().includes("jailed_until")
      ) {
        serialized[key] = serializeDate(value as any);
      } else {
        serialized[key] = serializeDates(value);
      }
    }
    return serialized;
  }

  return obj;
}
