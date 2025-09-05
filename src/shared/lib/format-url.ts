// Normalize a URL string by ensuring it has a protocol and trimming whitespace
export function formatUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  let value = String(raw).trim();
  if (!value) return "";
  // If starts with protocol-like scheme already, return as-is
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return value;
  // If starts with // treat as https
  if (value.startsWith("//")) return `https:${value}`;
  // Otherwise, prepend https://
  return `https://${value.replace(/^https?:\/\//, "")}`;
}

export default formatUrl;

