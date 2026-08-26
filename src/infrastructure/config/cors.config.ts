export function parseCorsOrigins(value: string): string[] {
  // Env UIs (Vercel/Lambda) often wrap values in extra quotes or strip JSON quotes.
  const trimmed = unwrapEnvQuotes(value.trim());

  if (!trimmed) {
    return [];
  }

  const rawOrigins = trimmed.startsWith('[')
    ? parseJsonArrayOrCsvFallback(trimmed)
    : trimmed.split(',');

  const origins = rawOrigins.map(normalizeOrigin).filter(Boolean);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one valid origin');
  }

  return origins;
}

function unwrapEnvQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
}

function parseJsonArrayOrCsvFallback(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      throw new Error('CORS_ORIGINS must be a JSON array');
    }

    return parsed.map((origin) => String(origin));
  } catch {
    // e.g. [https://app.com,https://www.app.com] after the platform strips quotes
    const inner = value.replace(/^\[/, '').replace(/\]$/, '');
    const parts = inner
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      throw new Error('CORS_ORIGINS invalid JSON array');
    }
    return parts;
  }
}

function normalizeOrigin(origin: string): string {
  const trimmed = origin
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '');

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
