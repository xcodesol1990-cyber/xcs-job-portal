/**
 * Strips potentially dangerous tags and attributes from rich text input.
 */
export function sanitizeHtml(raw: string): string {
  if (!raw) return "";

  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "")
    .trim();
}

/**
 * Strips all HTML tags to produce clean plain text.
 */
export function stripHtml(raw: string): string {
  if (!raw) return "";
  return raw.replace(/<[^>]*>?/gm, "").trim();
}
