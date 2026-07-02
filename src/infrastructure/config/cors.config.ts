export function parseCorsOrigins(value: string): string[] {
  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  const rawOrigins = trimmed.startsWith('[') ? parseJsonArray(trimmed) : trimmed.split(',');

  const origins = rawOrigins.map(normalizeOrigin).filter(Boolean);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one valid origin');
  }

  return origins;
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      throw new Error('CORS_ORIGINS must be a JSON array');
    }

    return parsed.map((origin) => String(origin));
  } catch {
    throw new Error('CORS_ORIGINS invalid JSON array');
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
