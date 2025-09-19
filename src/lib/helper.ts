import { SENSITIVE_FIELDS } from "./const";
export function redactSensitiveFields<T extends Record<string, any>>(data: T): T {
  const result = { ...data };
  Object.keys(result).forEach((key) => {
    if (SENSITIVE_FIELDS.some(field => field.toLowerCase() === key.toLowerCase())) {
      (result[key as keyof T] as any) = "***REDACTED***";
    }
  });
  return result;
}
