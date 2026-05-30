export type NavigationTarget =
  | {
      kind: 'url';
      url: string;
    }
  | {
      kind: 'search';
      query: string;
      url: string;
    };

const SEARCH_URL = 'https://duckduckgo.com/?q=';
const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:', 'about:', 'file:']);

export function normalizeAddressInput(input: string): NavigationTarget | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const directUrl = parseDirectUrl(trimmed);
  if (directUrl) {
    return {
      kind: 'url',
      url: directUrl
    };
  }

  const inferredUrl = parseInferredUrl(trimmed);
  if (inferredUrl) {
    return {
      kind: 'url',
      url: inferredUrl
    };
  }

  return {
    kind: 'search',
    query: trimmed,
    url: `${SEARCH_URL}${encodeURIComponent(trimmed)}`
  };
}

function parseDirectUrl(value: string): string | null {
  if (!/^[a-z][a-z\d+\-.]*:/i.test(value)) {
    return null;
  }

  try {
    const url = new URL(value);
    return SUPPORTED_PROTOCOLS.has(url.protocol) ? removeTrailingSlashForPathlessUrl(url.href, value) : null;
  } catch {
    return null;
  }
}

function parseInferredUrl(value: string): string | null {
  if (/\s/.test(value)) {
    return null;
  }

  if (isLocalAddress(value)) {
    return normalizeWithProtocol(`http://${value}`, value);
  }

  if (!looksLikeDomain(value)) {
    return null;
  }

  return normalizeWithProtocol(`https://${value}`, value);
}

function normalizeWithProtocol(candidate: string, originalValue: string): string | null {
  try {
    const url = new URL(candidate);
    return removeTrailingSlashForPathlessUrl(url.href, originalValue);
  } catch {
    return null;
  }
}

function isLocalAddress(value: string): boolean {
  return /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/.*)?$/i.test(value);
}

function looksLikeDomain(value: string): boolean {
  try {
    const url = new URL(`https://${value}`);
    return url.hostname.includes('.') && !url.hostname.startsWith('.') && !url.hostname.endsWith('.');
  } catch {
    return false;
  }
}

function removeTrailingSlashForPathlessUrl(normalized: string, originalValue: string): string {
  const hasExplicitPath = /\/[^/]/.test(originalValue.replace(/^[a-z][a-z\d+\-.]*:\/\//i, ''));
  return hasExplicitPath || !normalized.endsWith('/') ? normalized : normalized.slice(0, -1);
}

