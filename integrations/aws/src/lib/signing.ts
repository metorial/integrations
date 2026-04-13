export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface SignRequestParams {
  method: string;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
  credentials: AwsCredentials;
  region: string;
  service: string;
}

export interface SignedRequest {
  headers: Record<string, string>;
  params?: Record<string, string>;
}

let toHex = (buffer: ArrayBuffer): string => {
  let bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0');
  }
  return hex;
};

let hmacSha256 = async (key: ArrayBuffer | string, message: string): Promise<ArrayBuffer> => {
  let keyData: ArrayBuffer;
  if (typeof key === 'string') {
    let encoder = new TextEncoder();
    keyData = encoder.encode(key).buffer as ArrayBuffer;
  } else {
    keyData = key;
  }

  let cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  let encoder = new TextEncoder();
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
};

let sha256 = async (message: string): Promise<string> => {
  let encoder = new TextEncoder();
  let hash = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  return toHex(hash);
};

let getSigningKey = async (
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> => {
  let kDate = await hmacSha256('AWS4' + secretKey, dateStamp);
  let kRegion = await hmacSha256(kDate, region);
  let kService = await hmacSha256(kRegion, service);
  let kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
};

let uriEncode = (str: string): string => {
  return encodeURIComponent(str).replace(/%2F/g, '/');
};

let uriEncodeComponent = (str: string): string => {
  return encodeURIComponent(str);
};

export let signRequest = async (params: SignRequestParams): Promise<SignedRequest> => {
  let {
    method,
    url,
    headers = {},
    params: queryParams = {},
    body = '',
    credentials,
    region,
    service
  } = params;

  let parsedUrl = new URL(url);
  let host = parsedUrl.host;
  let path = parsedUrl.pathname || '/';

  let now = new Date();
  let amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  let dateStamp = amzDate.substring(0, 8);

  let allHeaders: Record<string, string> = {
    ...headers,
    host: host,
    'x-amz-date': amzDate
  };

  if (credentials.sessionToken) {
    allHeaders['x-amz-security-token'] = credentials.sessionToken;
  }

  let signedHeaderKeys = Object.keys(allHeaders)
    .map(k => k.toLowerCase())
    .sort();
  let signedHeaders = signedHeaderKeys.join(';');

  let canonicalHeaders = signedHeaderKeys
    .map(key => {
      let val =
        allHeaders[key] ?? allHeaders[key.charAt(0).toUpperCase() + key.slice(1)] ?? '';
      for (let [k, v] of Object.entries(allHeaders)) {
        if (k.toLowerCase() === key) {
          val = v;
          break;
        }
      }
      return `${key}:${val.trim()}\n`;
    })
    .join('');

  let sortedParams = Object.keys(queryParams).sort();
  let canonicalQueryString = sortedParams
    .map(key => `${uriEncodeComponent(key)}=${uriEncodeComponent(queryParams[key]!)}`)
    .join('&');

  let payloadHash = await sha256(body);

  let canonicalRequest = [
    method.toUpperCase(),
    uriEncode(path),
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  let credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  let canonicalRequestHash = await sha256(canonicalRequest);

  let stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, canonicalRequestHash].join(
    '\n'
  );

  let signingKey = await getSigningKey(
    credentials.secretAccessKey,
    dateStamp,
    region,
    service
  );
  let signatureBuffer = await hmacSha256(signingKey, stringToSign);
  let signature = toHex(signatureBuffer);

  let authorization = `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  let resultHeaders: Record<string, string> = { ...allHeaders, Authorization: authorization };
  delete resultHeaders['host'];

  return {
    headers: resultHeaders,
    params: queryParams
  };
};
