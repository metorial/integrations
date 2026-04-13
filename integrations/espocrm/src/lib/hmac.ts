import crypto from 'crypto';

export let createHmacSignature = (method: string, uri: string, apiKey: string, secretKey: string): string => {
  let stringToSign = `${method} /${uri}`;
  let hmac = crypto.createHmac('sha256', secretKey).update(stringToSign).digest('base64');
  let combined = `${apiKey}:${hmac}`;
  // @ts-ignore Buffer is available in the Node.js runtime used at deploy time.
  return Buffer.from(combined).toString('base64');
};
