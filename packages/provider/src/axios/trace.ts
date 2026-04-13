import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { SlateContext } from '../context';

export interface SlateHttpTraceTextBody {
  contentType?: string;
  text: string;
  truncated?: boolean;
}

export interface SlateHttpTrace {
  startedAt: string;
  durationMs: number;
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: SlateHttpTraceTextBody;
  };
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: SlateHttpTraceTextBody;
  };
  error?: {
    code?: string;
    message: string;
  };
}

interface SlateHttpTraceDraft {
  context: SlateContext<any, any, any>;
  startedAt: string;
  startedAtMs: number;
  request: SlateHttpTrace['request'];
}

type TraceAwareAxiosRequestConfig = InternalAxiosRequestConfig & {
  __slatesHttpTraceDraft?: SlateHttpTraceDraft;
};

let traceDraftsByConfig = new WeakMap<object, SlateHttpTraceDraft>();
let traceDraftsByHeaders = new WeakMap<object, SlateHttpTraceDraft>();

let TRACE_TEXT_LIMIT = 10 * 1024;
let REDACTED_VALUE = '[redacted]';
let STRUCTURED_DEPTH_LIMIT = 6;
let STRUCTURED_ENTRY_LIMIT = 50;

let SECRET_KEY_PATTERN =
  /(authorization|proxy[-_]?authorization|token|secret|password|passwd|api[-_]?key|access[-_]?token|refresh[-_]?token|client[-_]?secret|session|cookie|set-cookie|private[-_]?key|signature|sig|credential)/i;

let SAFE_HEADER_NAMES = new Set([
  'accept',
  'accept-encoding',
  'cache-control',
  'content-encoding',
  'content-language',
  'content-length',
  'content-type',
  'etag',
  'if-modified-since',
  'if-none-match',
  'last-modified',
  'location',
  'request-id',
  'retry-after',
  'user-agent',
  'x-correlation-id',
  'x-request-id',
  'x-slates-provider'
]);

let SAFE_HEADER_PREFIXES = ['ratelimit-', 'x-ratelimit-'];

let isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

let isObjectLike = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

let normalizeContentType = (value: string | undefined) =>
  value?.split(';')[0]?.trim().toLowerCase() || undefined;

let isTextContentType = (contentType?: string) =>
  !contentType ||
  /(^text\/)|json|xml|html|javascript|graphql|x-www-form-urlencoded|svg/.test(contentType);

let isSafeHeaderName = (name: string) => {
  let normalized = name.toLowerCase();
  if (SECRET_KEY_PATTERN.test(normalized)) return false;
  if (SAFE_HEADER_NAMES.has(normalized)) return true;
  return SAFE_HEADER_PREFIXES.some(prefix => normalized.startsWith(prefix));
};

let truncateText = (text: string) => {
  if (text.length <= TRACE_TEXT_LIMIT) {
    return { text, truncated: false };
  }

  return {
    text: `${text.slice(0, TRACE_TEXT_LIMIT)}...[truncated]`,
    truncated: true
  };
};

let sanitizeFreeText = (text: string) =>
  text
    .replace(
      /\b(Bearer|Basic)\s+[A-Za-z0-9\-._~+/]+=*/gi,
      (_match, prefix: string) => `${prefix} ${REDACTED_VALUE}`
    )
    .replace(
      /((?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password|passwd|token|secret|signature|sig)=)([^&\s]+)/gi,
      `$1${REDACTED_VALUE}`
    )
    .replace(
      /("(?:(?:api[_-]?key)|(?:access[_-]?token)|(?:refresh[_-]?token)|(?:client[_-]?secret)|password|passwd|token|secret|signature|sig)"\s*:\s*")([^"]+)(")/gi,
      `$1${REDACTED_VALUE}$3`
    );

let sanitizeScalar = (value: string) => truncateText(sanitizeFreeText(value));

let redactStructuredValue = (value: unknown, depth = 0): unknown => {
  if (value == null) return value;
  if (depth >= STRUCTURED_DEPTH_LIMIT) return '[truncated]';

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return typeof value === 'string' ? sanitizeFreeText(value) : value;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, STRUCTURED_ENTRY_LIMIT)
      .map(entry => redactStructuredValue(entry, depth + 1));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, STRUCTURED_ENTRY_LIMIT)
        .map(([key, entry]) => [
          key,
          SECRET_KEY_PATTERN.test(key)
            ? REDACTED_VALUE
            : redactStructuredValue(entry, depth + 1)
        ])
    );
  }

  return String(value);
};

let maybeParseJson = (text: string, contentType?: string) => {
  let trimmed = text.trim();
  if (!trimmed) return null;
  if (!contentType?.includes('json') && !/^[\[{]/.test(trimmed)) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

let sanitizeTextBody = (
  text: string,
  contentType?: string
): SlateHttpTraceTextBody | undefined => {
  if (!text) return undefined;

  let normalizedContentType = normalizeContentType(contentType);
  let parsedJson = maybeParseJson(text, normalizedContentType);
  let normalizedText =
    parsedJson !== null
      ? JSON.stringify(redactStructuredValue(parsedJson))
      : sanitizeFreeText(text);
  let { text: truncatedText, truncated } = truncateText(normalizedText);

  return {
    ...(normalizedContentType ? { contentType: normalizedContentType } : {}),
    text: truncatedText,
    ...(truncated ? { truncated: true } : {})
  };
};

let isBinaryLike = (value: unknown) => {
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return true;
  if (value instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(value)) return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  if (typeof FormData !== 'undefined' && value instanceof FormData) return true;
  return false;
};

let serializeTextBody = (
  value: unknown,
  contentType?: string
): SlateHttpTraceTextBody | undefined => {
  let normalizedContentType = normalizeContentType(contentType);

  if (value == null || isBinaryLike(value) || !isTextContentType(normalizedContentType)) {
    return undefined;
  }

  if (typeof value === 'string') {
    return sanitizeTextBody(value, normalizedContentType);
  }

  if (value instanceof URLSearchParams) {
    return sanitizeTextBody(value.toString(), normalizedContentType);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return sanitizeTextBody(String(value), normalizedContentType);
  }

  if (Array.isArray(value) || isRecord(value)) {
    return sanitizeTextBody(JSON.stringify(redactStructuredValue(value)), 'application/json');
  }

  return undefined;
};

let buildUrl = (baseURL: string | undefined, url: string | undefined) => {
  if (!url) return '';
  if (!baseURL) return url;

  try {
    return new URL(url, baseURL).toString();
  } catch {
    return url;
  }
};

let sanitizeUrl = (value: string) => {
  if (!value) return value;

  try {
    let url = new URL(value);
    for (let key of Array.from(url.searchParams.keys())) {
      if (SECRET_KEY_PATTERN.test(key)) {
        url.searchParams.set(key, REDACTED_VALUE);
      }
    }
    return url.toString();
  } catch {
    return value.replace(
      /([?&]([^=&#]+)=)([^&#]+)/g,
      (_match, prefix: string, key: string, rawValue: string) =>
        SECRET_KEY_PATTERN.test(key) ? `${prefix}${REDACTED_VALUE}` : `${prefix}${rawValue}`
    );
  }
};

let flattenHeaderValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    let normalized = value
      .map(entry => flattenHeaderValue(entry))
      .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
    return normalized.length > 0 ? normalized.join(', ') : undefined;
  }
  return undefined;
};

let headerEntries = (headers: unknown): [string, string][] => {
  if (!headers) return [];

  if (typeof (headers as { toJSON?: unknown }).toJSON === 'function') {
    let json = (headers as { toJSON(): unknown }).toJSON();
    if (isRecord(json)) {
      return Object.entries(json)
        .map(([key, value]) => {
          let flattened = flattenHeaderValue(value);
          return flattened ? ([key, flattened] as [string, string]) : null;
        })
        .filter((entry): entry is [string, string] => entry !== null);
    }
  }

  if (typeof (headers as { entries?: unknown }).entries === 'function') {
    return Array.from(
      (headers as { entries(): IterableIterator<[string, string]> }).entries()
    ).map(([key, value]) => [key, value]);
  }

  if (isRecord(headers)) {
    return Object.entries(headers)
      .map(([key, value]) => {
        let flattened = flattenHeaderValue(value);
        return flattened ? ([key, flattened] as [string, string]) : null;
      })
      .filter((entry): entry is [string, string] => entry !== null);
  }

  return [];
};

let sanitizeHeaders = (headers: unknown) => {
  let entries = headerEntries(headers)
    .map(([key, value]) => [key.toLowerCase(), sanitizeScalar(value).text] as [string, string])
    .filter(([key]) => isSafeHeaderName(key));

  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
};

let getContentType = (headers: unknown) =>
  headerEntries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1];

let takeTraceDraft = (config: TraceAwareAxiosRequestConfig | undefined) => {
  if (!config) return undefined;

  let draft =
    config.__slatesHttpTraceDraft ??
    (isObjectLike(config) ? traceDraftsByConfig.get(config) : undefined) ??
    (isObjectLike(config.headers) ? traceDraftsByHeaders.get(config.headers) : undefined);

  if (!draft) return undefined;

  return draft;
};

let clearTraceDraft = (
  config: TraceAwareAxiosRequestConfig | undefined,
  draft: SlateHttpTraceDraft
) => {
  if (!config) return;

  if (config.__slatesHttpTraceDraft === draft) {
    delete config.__slatesHttpTraceDraft;
  }

  if (isObjectLike(config)) {
    traceDraftsByConfig.delete(config);
  }

  if (isObjectLike(config.headers)) {
    traceDraftsByHeaders.delete(config.headers);
  }
};

export let attachHttpTraceDraft = (
  config: InternalAxiosRequestConfig,
  context: SlateContext<any, any, any>
) => {
  let traceAwareConfig = config as TraceAwareAxiosRequestConfig;
  let contentType = getContentType(config.headers);

  traceAwareConfig.__slatesHttpTraceDraft = {
    context,
    startedAt: new Date().toISOString(),
    startedAtMs: Date.now(),
    request: {
      method: (config.method ?? 'GET').toUpperCase(),
      url: sanitizeUrl(buildUrl(config.baseURL, config.url)),
      ...(sanitizeHeaders(config.headers) ? { headers: sanitizeHeaders(config.headers) } : {}),
      ...(serializeTextBody(config.data, contentType)
        ? { body: serializeTextBody(config.data, contentType) }
        : {})
    }
  };

  if (isObjectLike(traceAwareConfig)) {
    traceDraftsByConfig.set(traceAwareConfig, traceAwareConfig.__slatesHttpTraceDraft);
  }

  if (isObjectLike(traceAwareConfig.headers)) {
    traceDraftsByHeaders.set(
      traceAwareConfig.headers,
      traceAwareConfig.__slatesHttpTraceDraft
    );
  }

  return config;
};

export let recordHttpTraceFromResponse = (response: AxiosResponse) => {
  let config = response.config as TraceAwareAxiosRequestConfig | undefined;
  let draft = takeTraceDraft(config);
  if (!draft) return response;
  clearTraceDraft(config, draft);

  let contentType = getContentType(response.headers);
  draft.context.recordHttpTrace({
    startedAt: draft.startedAt,
    durationMs: Math.max(Date.now() - draft.startedAtMs, 0),
    request: draft.request,
    response: {
      status: response.status,
      ...(response.statusText ? { statusText: response.statusText } : {}),
      ...(sanitizeHeaders(response.headers)
        ? { headers: sanitizeHeaders(response.headers) }
        : {}),
      ...(serializeTextBody(response.data, contentType)
        ? { body: serializeTextBody(response.data, contentType) }
        : {})
    }
  });

  return response;
};

export let recordHttpTraceFromError = (error: AxiosError) => {
  let config = error.config as TraceAwareAxiosRequestConfig | undefined;
  let draft = takeTraceDraft(config);
  if (!draft) return;
  clearTraceDraft(config, draft);

  let responseContentType = getContentType(error.response?.headers);
  draft.context.recordHttpTrace({
    startedAt: draft.startedAt,
    durationMs: Math.max(Date.now() - draft.startedAtMs, 0),
    request: draft.request,
    ...(error.response
      ? {
          response: {
            status: error.response.status,
            ...(error.response.statusText ? { statusText: error.response.statusText } : {}),
            ...(sanitizeHeaders(error.response.headers)
              ? { headers: sanitizeHeaders(error.response.headers) }
              : {}),
            ...(serializeTextBody(error.response.data, responseContentType)
              ? { body: serializeTextBody(error.response.data, responseContentType) }
              : {})
          }
        }
      : {}),
    error: {
      ...(error.code ? { code: error.code } : {}),
      message: error.message
    }
  });
};
