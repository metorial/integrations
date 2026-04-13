import { createAxios } from 'slates';
import { signRequest, createPresignedUrl } from './signing';
import { parseXml, getChildText, getChildren, getChild, buildXml, type XmlNode } from './xml';

export interface S3ClientConfig {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
}

export interface S3Bucket {
  bucketName: string;
  creationDate: string;
}

export interface S3Object {
  objectKey: string;
  lastModified: string;
  eTag: string;
  sizeBytes: number;
  storageClass: string;
}

export interface S3ObjectMetadata {
  objectKey: string;
  contentType?: string;
  contentLength?: number;
  eTag?: string;
  lastModified?: string;
  storageClass?: string;
  versionId?: string;
  serverSideEncryption?: string;
  metadata: Record<string, string>;
}

export interface ListObjectsResult {
  objects: S3Object[];
  commonPrefixes: string[];
  isTruncated: boolean;
  nextContinuationToken?: string;
  keyCount: number;
}

export interface S3ObjectVersion {
  objectKey: string;
  versionId: string;
  isLatest: boolean;
  lastModified: string;
  eTag: string;
  sizeBytes: number;
  storageClass: string;
  isDeleteMarker: boolean;
}

export interface ListVersionsResult {
  versions: S3ObjectVersion[];
  isTruncated: boolean;
  nextKeyMarker?: string;
  nextVersionIdMarker?: string;
}

export interface S3Tag {
  key: string;
  value: string;
}

export class S3Client {
  private config: S3ClientConfig;

  constructor(config: S3ClientConfig) {
    this.config = config;
  }

  private getBucketEndpoint(bucket: string): string {
    return `https://${bucket}.s3.${this.config.region}.amazonaws.com`;
  }

  private getServiceEndpoint(): string {
    return `https://s3.${this.config.region}.amazonaws.com`;
  }

  private async makeRequest(params: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<{ status: number; data: string; headers: Record<string, string> }> {
    let { method, url, headers = {}, body } = params;

    let signedHeaders = await signRequest({
      method,
      url,
      headers: { ...headers },
      body: body || '',
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      sessionToken: this.config.sessionToken,
      region: this.config.region
    });

    let ax = createAxios();

    let response = await ax.request({
      method,
      url,
      headers: signedHeaders,
      data: body || undefined,
      validateStatus: () => true,
      transformResponse: [(data: any) => data]
    });

    if (response.status >= 400) {
      let errorMessage = typeof response.data === 'string' ? response.data : 'Request failed';
      try {
        let errorXml = parseXml(errorMessage);
        let code = getChildText(errorXml, 'Code') || '';
        let message = getChildText(errorXml, 'Message') || errorMessage;
        throw new Error(`S3 Error (${response.status}): ${code} - ${message}`);
      } catch (e) {
        if (e instanceof Error && e.message.startsWith('S3 Error')) throw e;
        throw new Error(`S3 Error (${response.status}): ${errorMessage}`);
      }
    }

    let responseHeaders: Record<string, string> = {};
    if (response.headers) {
      for (let [key, val] of Object.entries(response.headers)) {
        if (typeof val === 'string') {
          responseHeaders[key] = val;
        }
      }
    }

    return {
      status: response.status,
      data: response.data as string,
      headers: responseHeaders
    };
  }

  // === Bucket Operations ===

  async listBuckets(): Promise<S3Bucket[]> {
    let response = await this.makeRequest({
      method: 'GET',
      url: this.getServiceEndpoint() + '/'
    });

    let xml = parseXml(response.data);
    let bucketsNode = getChild(xml, 'Buckets');
    if (!bucketsNode) return [];

    return getChildren(bucketsNode, 'Bucket').map(b => ({
      bucketName: getChildText(b, 'Name') || '',
      creationDate: getChildText(b, 'CreationDate') || ''
    }));
  }

  async createBucket(bucket: string, locationConstraint?: string): Promise<void> {
    let body = '';
    let region = locationConstraint || this.config.region;
    if (region !== 'us-east-1') {
      body = buildXml({
        name: 'CreateBucketConfiguration',
        attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
        children: [{ name: 'LocationConstraint', text: region }]
      });
    }

    await this.makeRequest({
      method: 'PUT',
      url: this.getBucketEndpoint(bucket) + '/',
      headers: body ? { 'Content-Type': 'application/xml' } : {},
      body
    });
  }

  async deleteBucket(bucket: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: this.getBucketEndpoint(bucket) + '/'
    });
  }

  async getBucketLocation(bucket: string): Promise<string> {
    let response = await this.makeRequest({
      method: 'GET',
      url: this.getBucketEndpoint(bucket) + '/?location'
    });

    let xml = parseXml(response.data);
    return xml.text || 'us-east-1';
  }

  // === Object Operations ===

  async listObjects(
    bucket: string,
    options?: {
      prefix?: string;
      delimiter?: string;
      maxKeys?: number;
      continuationToken?: string;
      startAfter?: string;
    }
  ): Promise<ListObjectsResult> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/');
    url.searchParams.set('list-type', '2');
    if (options?.prefix) url.searchParams.set('prefix', options.prefix);
    if (options?.delimiter) url.searchParams.set('delimiter', options.delimiter);
    if (options?.maxKeys) url.searchParams.set('max-keys', String(options.maxKeys));
    if (options?.continuationToken)
      url.searchParams.set('continuation-token', options.continuationToken);
    if (options?.startAfter) url.searchParams.set('start-after', options.startAfter);

    let response = await this.makeRequest({
      method: 'GET',
      url: url.toString()
    });

    let xml = parseXml(response.data);

    let objects = getChildren(xml, 'Contents').map(c => ({
      objectKey: getChildText(c, 'Key') || '',
      lastModified: getChildText(c, 'LastModified') || '',
      eTag: getChildText(c, 'ETag')?.replace(/"/g, '') || '',
      sizeBytes: parseInt(getChildText(c, 'Size') || '0', 10),
      storageClass: getChildText(c, 'StorageClass') || 'STANDARD'
    }));

    let commonPrefixes = getChildren(xml, 'CommonPrefixes').map(
      cp => getChildText(cp, 'Prefix') || ''
    );

    return {
      objects,
      commonPrefixes,
      isTruncated: getChildText(xml, 'IsTruncated') === 'true',
      nextContinuationToken: getChildText(xml, 'NextContinuationToken'),
      keyCount: parseInt(getChildText(xml, 'KeyCount') || '0', 10)
    };
  }

  async getObject(
    bucket: string,
    key: string,
    options?: {
      versionId?: string;
      range?: string;
    }
  ): Promise<{ content: string; metadata: S3ObjectMetadata }> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key));
    if (options?.versionId) url.searchParams.set('versionId', options.versionId);

    let headers: Record<string, string> = {};
    if (options?.range) headers['Range'] = options.range;

    let response = await this.makeRequest({
      method: 'GET',
      url: url.toString(),
      headers
    });

    let metadata = extractMetadataFromHeaders(key, response.headers);

    return { content: response.data, metadata };
  }

  async headObject(
    bucket: string,
    key: string,
    versionId?: string
  ): Promise<S3ObjectMetadata> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key));
    if (versionId) url.searchParams.set('versionId', versionId);

    let response = await this.makeRequest({
      method: 'HEAD',
      url: url.toString()
    });

    return extractMetadataFromHeaders(key, response.headers);
  }

  async putObject(
    bucket: string,
    key: string,
    body: string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
      storageClass?: string;
      serverSideEncryption?: string;
      tagging?: string;
      acl?: string;
    }
  ): Promise<{ eTag: string; versionId?: string }> {
    let headers: Record<string, string> = {};
    if (options?.contentType) headers['Content-Type'] = options.contentType;
    if (options?.storageClass) headers['x-amz-storage-class'] = options.storageClass;
    if (options?.serverSideEncryption)
      headers['x-amz-server-side-encryption'] = options.serverSideEncryption;
    if (options?.tagging) headers['x-amz-tagging'] = options.tagging;
    if (options?.acl) headers['x-amz-acl'] = options.acl;
    if (options?.metadata) {
      for (let [k, v] of Object.entries(options.metadata)) {
        headers[`x-amz-meta-${k}`] = v;
      }
    }

    let url = this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key);
    let response = await this.makeRequest({
      method: 'PUT',
      url,
      headers,
      body
    });

    return {
      eTag: response.headers['etag']?.replace(/"/g, '') || '',
      versionId: response.headers['x-amz-version-id']
    };
  }

  async deleteObject(
    bucket: string,
    key: string,
    versionId?: string
  ): Promise<{ deleteMarker?: boolean; versionId?: string }> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key));
    if (versionId) url.searchParams.set('versionId', versionId);

    let response = await this.makeRequest({
      method: 'DELETE',
      url: url.toString()
    });

    return {
      deleteMarker: response.headers['x-amz-delete-marker'] === 'true',
      versionId: response.headers['x-amz-version-id']
    };
  }

  async deleteObjects(
    bucket: string,
    keys: Array<{ objectKey: string; versionId?: string }>
  ): Promise<{
    deleted: Array<{ objectKey: string; versionId?: string }>;
    errors: Array<{ objectKey: string; code: string; message: string }>;
  }> {
    let objectNodes: XmlNode[] = keys.map(k => {
      let children: XmlNode[] = [{ name: 'Key', text: k.objectKey }];
      if (k.versionId) children.push({ name: 'VersionId', text: k.versionId });
      return { name: 'Object', children };
    });

    let body = buildXml({
      name: 'Delete',
      attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
      children: [{ name: 'Quiet', text: 'false' }, ...objectNodes]
    });

    let url = this.getBucketEndpoint(bucket) + '/?delete';
    let contentMd5 = computeMd5Base64(body);

    let response = await this.makeRequest({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/xml',
        'Content-MD5': contentMd5
      },
      body
    });

    let xml = parseXml(response.data);

    let deleted = getChildren(xml, 'Deleted').map(d => ({
      objectKey: getChildText(d, 'Key') || '',
      versionId: getChildText(d, 'VersionId')
    }));

    let errors = getChildren(xml, 'Error').map(e => ({
      objectKey: getChildText(e, 'Key') || '',
      code: getChildText(e, 'Code') || '',
      message: getChildText(e, 'Message') || ''
    }));

    return { deleted, errors };
  }

  async copyObject(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
    options?: {
      metadataDirective?: 'COPY' | 'REPLACE';
      metadata?: Record<string, string>;
      contentType?: string;
      storageClass?: string;
      serverSideEncryption?: string;
      sourceVersionId?: string;
    }
  ): Promise<{ eTag: string; lastModified: string; versionId?: string }> {
    let headers: Record<string, string> = {};
    let copySource = `/${sourceBucket}/${encodeObjectKey(sourceKey)}`;
    if (options?.sourceVersionId) copySource += `?versionId=${options.sourceVersionId}`;
    headers['x-amz-copy-source'] = copySource;

    if (options?.metadataDirective)
      headers['x-amz-metadata-directive'] = options.metadataDirective;
    if (options?.contentType) headers['Content-Type'] = options.contentType;
    if (options?.storageClass) headers['x-amz-storage-class'] = options.storageClass;
    if (options?.serverSideEncryption)
      headers['x-amz-server-side-encryption'] = options.serverSideEncryption;
    if (options?.metadata) {
      for (let [k, v] of Object.entries(options.metadata)) {
        headers[`x-amz-meta-${k}`] = v;
      }
    }

    let url = this.getBucketEndpoint(destBucket) + '/' + encodeObjectKey(destKey);
    let response = await this.makeRequest({
      method: 'PUT',
      url,
      headers
    });

    let xml = parseXml(response.data);
    return {
      eTag: getChildText(xml, 'ETag')?.replace(/"/g, '') || '',
      lastModified: getChildText(xml, 'LastModified') || '',
      versionId: response.headers['x-amz-version-id']
    };
  }

  // === Presigned URLs ===

  async generatePresignedUrl(
    bucket: string,
    key: string,
    options?: {
      method?: string;
      expiresInSeconds?: number;
      versionId?: string;
      contentType?: string;
    }
  ): Promise<string> {
    let method = options?.method || 'GET';
    let url = new URL(this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key));
    if (options?.versionId) url.searchParams.set('versionId', options.versionId);
    if (options?.contentType && method === 'PUT') {
      url.searchParams.set('Content-Type', options.contentType);
    }

    return createPresignedUrl({
      method,
      url: url.toString(),
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      sessionToken: this.config.sessionToken,
      region: this.config.region,
      expiresInSeconds: options?.expiresInSeconds || 3600
    });
  }

  // === Versioning ===

  async getBucketVersioning(bucket: string): Promise<{ status: string; mfaDelete?: string }> {
    let response = await this.makeRequest({
      method: 'GET',
      url: this.getBucketEndpoint(bucket) + '/?versioning'
    });

    let xml = parseXml(response.data);
    return {
      status: getChildText(xml, 'Status') || 'Disabled',
      mfaDelete: getChildText(xml, 'MfaDelete')
    };
  }

  async putBucketVersioning(bucket: string, status: 'Enabled' | 'Suspended'): Promise<void> {
    let body = buildXml({
      name: 'VersioningConfiguration',
      attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
      children: [{ name: 'Status', text: status }]
    });

    await this.makeRequest({
      method: 'PUT',
      url: this.getBucketEndpoint(bucket) + '/?versioning',
      headers: { 'Content-Type': 'application/xml' },
      body
    });
  }

  async listObjectVersions(
    bucket: string,
    options?: {
      prefix?: string;
      maxKeys?: number;
      keyMarker?: string;
      versionIdMarker?: string;
    }
  ): Promise<ListVersionsResult> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/');
    url.searchParams.set('versions', '');
    if (options?.prefix) url.searchParams.set('prefix', options.prefix);
    if (options?.maxKeys) url.searchParams.set('max-keys', String(options.maxKeys));
    if (options?.keyMarker) url.searchParams.set('key-marker', options.keyMarker);
    if (options?.versionIdMarker)
      url.searchParams.set('version-id-marker', options.versionIdMarker);

    let response = await this.makeRequest({
      method: 'GET',
      url: url.toString()
    });

    let xml = parseXml(response.data);

    let versions: S3ObjectVersion[] = getChildren(xml, 'Version').map(v => ({
      objectKey: getChildText(v, 'Key') || '',
      versionId: getChildText(v, 'VersionId') || '',
      isLatest: getChildText(v, 'IsLatest') === 'true',
      lastModified: getChildText(v, 'LastModified') || '',
      eTag: getChildText(v, 'ETag')?.replace(/"/g, '') || '',
      sizeBytes: parseInt(getChildText(v, 'Size') || '0', 10),
      storageClass: getChildText(v, 'StorageClass') || 'STANDARD',
      isDeleteMarker: false
    }));

    let deleteMarkers: S3ObjectVersion[] = getChildren(xml, 'DeleteMarker').map(d => ({
      objectKey: getChildText(d, 'Key') || '',
      versionId: getChildText(d, 'VersionId') || '',
      isLatest: getChildText(d, 'IsLatest') === 'true',
      lastModified: getChildText(d, 'LastModified') || '',
      eTag: '',
      sizeBytes: 0,
      storageClass: '',
      isDeleteMarker: true
    }));

    let allVersions = [...versions, ...deleteMarkers].sort((a, b) =>
      b.lastModified.localeCompare(a.lastModified)
    );

    return {
      versions: allVersions,
      isTruncated: getChildText(xml, 'IsTruncated') === 'true',
      nextKeyMarker: getChildText(xml, 'NextKeyMarker'),
      nextVersionIdMarker: getChildText(xml, 'NextVersionIdMarker')
    };
  }

  // === Tags ===

  async getObjectTagging(bucket: string, key: string, versionId?: string): Promise<S3Tag[]> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key));
    url.searchParams.set('tagging', '');
    if (versionId) url.searchParams.set('versionId', versionId);

    let response = await this.makeRequest({
      method: 'GET',
      url: url.toString()
    });

    let xml = parseXml(response.data);
    let tagSet = getChild(xml, 'TagSet');
    if (!tagSet) return [];

    return getChildren(tagSet, 'Tag').map(t => ({
      key: getChildText(t, 'Key') || '',
      value: getChildText(t, 'Value') || ''
    }));
  }

  async putObjectTagging(
    bucket: string,
    key: string,
    tags: S3Tag[],
    versionId?: string
  ): Promise<void> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key));
    url.searchParams.set('tagging', '');
    if (versionId) url.searchParams.set('versionId', versionId);

    let body = buildXml({
      name: 'Tagging',
      attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
      children: [
        {
          name: 'TagSet',
          children: tags.map(t => ({
            name: 'Tag',
            children: [
              { name: 'Key', text: t.key },
              { name: 'Value', text: t.value }
            ]
          }))
        }
      ]
    });

    await this.makeRequest({
      method: 'PUT',
      url: url.toString(),
      headers: { 'Content-Type': 'application/xml' },
      body
    });
  }

  async deleteObjectTagging(bucket: string, key: string, versionId?: string): Promise<void> {
    let url = new URL(this.getBucketEndpoint(bucket) + '/' + encodeObjectKey(key));
    url.searchParams.set('tagging', '');
    if (versionId) url.searchParams.set('versionId', versionId);

    await this.makeRequest({
      method: 'DELETE',
      url: url.toString()
    });
  }

  async getBucketTagging(bucket: string): Promise<S3Tag[]> {
    let response = await this.makeRequest({
      method: 'GET',
      url: this.getBucketEndpoint(bucket) + '/?tagging'
    });

    let xml = parseXml(response.data);
    let tagSet = getChild(xml, 'TagSet');
    if (!tagSet) return [];

    return getChildren(tagSet, 'Tag').map(t => ({
      key: getChildText(t, 'Key') || '',
      value: getChildText(t, 'Value') || ''
    }));
  }

  async putBucketTagging(bucket: string, tags: S3Tag[]): Promise<void> {
    let body = buildXml({
      name: 'Tagging',
      attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
      children: [
        {
          name: 'TagSet',
          children: tags.map(t => ({
            name: 'Tag',
            children: [
              { name: 'Key', text: t.key },
              { name: 'Value', text: t.value }
            ]
          }))
        }
      ]
    });

    await this.makeRequest({
      method: 'PUT',
      url: this.getBucketEndpoint(bucket) + '/?tagging',
      headers: { 'Content-Type': 'application/xml' },
      body
    });
  }

  // === Bucket Policy ===

  async getBucketPolicy(bucket: string): Promise<string> {
    let response = await this.makeRequest({
      method: 'GET',
      url: this.getBucketEndpoint(bucket) + '/?policy'
    });
    return response.data;
  }

  async putBucketPolicy(bucket: string, policy: string): Promise<void> {
    await this.makeRequest({
      method: 'PUT',
      url: this.getBucketEndpoint(bucket) + '/?policy',
      headers: { 'Content-Type': 'application/json' },
      body: policy
    });
  }

  async deleteBucketPolicy(bucket: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: this.getBucketEndpoint(bucket) + '/?policy'
    });
  }
}

let encodeObjectKey = (key: string): string => {
  return key
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
};

let extractMetadataFromHeaders = (
  key: string,
  headers: Record<string, string>
): S3ObjectMetadata => {
  let metadata: Record<string, string> = {};
  for (let [k, v] of Object.entries(headers)) {
    if (k.toLowerCase().startsWith('x-amz-meta-')) {
      metadata[k.toLowerCase().replace('x-amz-meta-', '')] = v;
    }
  }

  return {
    objectKey: key,
    contentType: headers['content-type'],
    contentLength: headers['content-length']
      ? parseInt(headers['content-length'], 10)
      : undefined,
    eTag: headers['etag']?.replace(/"/g, ''),
    lastModified: headers['last-modified'],
    storageClass: headers['x-amz-storage-class'],
    versionId: headers['x-amz-version-id'],
    serverSideEncryption: headers['x-amz-server-side-encryption'],
    metadata
  };
};

// MD5 computation for Content-MD5 header (required for delete-objects)
let computeMd5Base64 = (data: string): string => {
  let input = new TextEncoder().encode(data);
  let hash = md5(input);
  let binary = '';
  for (let i = 0; i < hash.length; i++) {
    binary += String.fromCharCode(hash[i]!);
  }
  return btoa(binary);
};

let md5 = (input: Uint8Array): Uint8Array => {
  let S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10,
    15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  let K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613,
    0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193,
    0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d,
    0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
    0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244,
    0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb,
    0xeb86d391
  ];

  let leftRotate = (x: number, c: number): number => ((x << c) | (x >>> (32 - c))) >>> 0;

  let originalLength = input.length;
  let paddingLength = (56 - ((originalLength + 1) % 64) + 64) % 64;
  let padded = new Uint8Array(originalLength + 1 + paddingLength + 8);
  padded.set(input);
  padded[originalLength] = 0x80;

  let bitLength = originalLength * 8;
  for (let i = 0; i < 8; i++) {
    padded[originalLength + 1 + paddingLength + i] = (bitLength >>> (i * 8)) & 0xff;
  }

  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  for (let offset = 0; offset < padded.length; offset += 64) {
    let M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] =
        (padded[offset + j * 4]! |
          (padded[offset + j * 4 + 1]! << 8) |
          (padded[offset + j * 4 + 2]! << 16) |
          (padded[offset + j * 4 + 3]! << 24)) >>>
        0;
    }

    let A = a0,
      B = b0,
      C = c0,
      D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = ((B & C) | (~B & D)) >>> 0;
        g = i;
      } else if (i < 32) {
        F = ((D & B) | (~D & C)) >>> 0;
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = (B ^ C ^ D) >>> 0;
        g = (3 * i + 5) % 16;
      } else {
        F = (C ^ (B | ~D)) >>> 0;
        g = (7 * i) % 16;
      }

      F = (F + A + K[i]! + M[g]!) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + leftRotate(F, S[i]!)) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  let result = new Uint8Array(16);
  for (let i = 0; i < 4; i++) {
    result[i] = (a0 >>> (i * 8)) & 0xff;
    result[i + 4] = (b0 >>> (i * 8)) & 0xff;
    result[i + 8] = (c0 >>> (i * 8)) & 0xff;
    result[i + 12] = (d0 >>> (i * 8)) & 0xff;
  }

  return result;
};
