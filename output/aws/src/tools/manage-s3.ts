import { SlateTool } from 'slates';
import { spec } from '../spec';
import { z } from 'zod';
import { clientFromContext } from '../lib/helpers';
import { extractXmlValue, extractXmlValues, extractXmlBlocks } from '../lib/xml';

let bucketSchema = z.object({
  name: z.string().describe('Bucket name'),
  creationDate: z.string().optional().describe('Bucket creation date'),
});

let objectSchema = z.object({
  key: z.string().describe('Object key (path)'),
  size: z.number().optional().describe('Object size in bytes'),
  lastModified: z.string().optional().describe('Last modified timestamp'),
  storageClass: z.string().optional().describe('Storage class (STANDARD, INTELLIGENT_TIERING, etc.)'),
  etag: z.string().optional().describe('Entity tag (hash of the object)'),
});

let objectMetadataSchema = z.object({
  key: z.string().describe('Object key'),
  bucket: z.string().describe('Bucket name'),
  contentType: z.string().optional().describe('MIME content type'),
  contentLength: z.number().optional().describe('Size in bytes'),
  lastModified: z.string().optional().describe('Last modified timestamp'),
  etag: z.string().optional().describe('Entity tag'),
  storageClass: z.string().optional().describe('Storage class'),
  serverSideEncryption: z.string().optional().describe('Server-side encryption algorithm'),
  versionId: z.string().optional().describe('Version ID if versioning is enabled'),
  metadata: z.record(z.string(), z.string()).optional().describe('User-defined metadata'),
});

let outputSchema = z.object({
  operation: z.string().describe('The operation that was performed'),
  buckets: z.array(bucketSchema).optional().describe('List of buckets (for list_buckets)'),
  objects: z.array(objectSchema).optional().describe('List of objects (for list_objects)'),
  objectMetadata: objectMetadataSchema.optional().describe('Object metadata (for get_object_metadata)'),
  bucket: z.string().optional().describe('Bucket name involved in the operation'),
  key: z.string().optional().describe('Object key involved in the operation'),
  isTruncated: z.boolean().optional().describe('Whether the list results are truncated (more results available)'),
  nextContinuationToken: z.string().optional().describe('Token to retrieve the next page of list results'),
  commonPrefixes: z.array(z.string()).optional().describe('Common prefixes when using a delimiter (virtual folders)'),
  copySourceBucket: z.string().optional().describe('Source bucket for copy operations'),
  copySourceKey: z.string().optional().describe('Source key for copy operations'),
});

export let manageS3Tool = SlateTool.create(
  spec,
  {
    name: 'Manage S3',
    key: 'manage_s3',
    description: `Manage Amazon S3 buckets and objects. Supports listing buckets, creating and deleting buckets, listing objects within a bucket, retrieving object metadata, deleting objects, and copying objects between locations. This tool covers S3 management operations — it does not handle binary upload or download.`,
    instructions: [
      'Use operation "list_buckets" to list all S3 buckets in the account.',
      'Use operation "create_bucket" to create a new bucket. Provide "bucket" name. The bucket is created in the configured region.',
      'Use operation "delete_bucket" to delete an empty bucket. The bucket must be empty before deletion.',
      'Use operation "list_objects" to list objects in a bucket. Provide "bucket" and optionally "prefix", "delimiter", "maxKeys", and "continuationToken" for pagination.',
      'Use operation "get_object_metadata" to get metadata for a specific object. Provide "bucket" and "key".',
      'Use operation "delete_object" to delete a specific object. Provide "bucket" and "key".',
      'Use operation "copy_object" to copy an object. Provide "sourceBucket", "sourceKey", "destinationBucket", and "destinationKey".',
    ],
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    operation: z.enum([
      'list_buckets',
      'create_bucket',
      'delete_bucket',
      'list_objects',
      'get_object_metadata',
      'delete_object',
      'copy_object',
    ]).describe('The S3 operation to perform'),
    bucket: z.string().optional().describe('Bucket name (required for most operations except list_buckets and copy_object)'),
    key: z.string().optional().describe('Object key / path (required for get_object_metadata, delete_object)'),
    prefix: z.string().optional().describe('Filter objects by key prefix (for list_objects)'),
    delimiter: z.string().optional().describe('Delimiter for grouping keys into common prefixes, typically "/" (for list_objects)'),
    maxKeys: z.number().optional().describe('Maximum number of objects to return, up to 1000 (for list_objects, default: 1000)'),
    continuationToken: z.string().optional().describe('Continuation token from a previous list_objects response for pagination'),
    sourceBucket: z.string().optional().describe('Source bucket name (required for copy_object)'),
    sourceKey: z.string().optional().describe('Source object key (required for copy_object)'),
    destinationBucket: z.string().optional().describe('Destination bucket name (required for copy_object)'),
    destinationKey: z.string().optional().describe('Destination object key (required for copy_object)'),
  }))
  .output(outputSchema)
  .handleInvocation(async (ctx) => {
    let client = clientFromContext(ctx);
    let { operation } = ctx.input;

    // ── List Buckets ────────────────────────────────────────────────
    if (operation === 'list_buckets') {
      let response = await client.request({
        service: 's3',
        method: 'GET',
        path: '/',
      });

      let xml = typeof response === 'string' ? response : String(response);
      let bucketBlocks = extractXmlBlocks(xml, 'Bucket');
      let buckets = bucketBlocks.map((block) => ({
        name: extractXmlValue(block, 'Name') ?? '',
        creationDate: extractXmlValue(block, 'CreationDate'),
      }));

      return {
        output: {
          operation: 'list_buckets',
          buckets,
        },
        message: `Found **${buckets.length}** S3 bucket(s).`,
      };
    }

    // ── Create Bucket ───────────────────────────────────────────────
    if (operation === 'create_bucket') {
      if (!ctx.input.bucket) throw new Error('bucket is required for create_bucket');

      let bucketName = ctx.input.bucket;
      let region = ctx.config.region;

      // S3 requires a LocationConstraint for any region other than us-east-1
      let body: string | undefined;
      let headers: Record<string, string> = {};

      if (region && region !== 'us-east-1') {
        body = `<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>${region}</LocationConstraint></CreateBucketConfiguration>`;
        headers['Content-Type'] = 'application/xml';
      }

      await client.request({
        service: 's3',
        method: 'PUT',
        path: `/${bucketName}`,
        body,
        headers,
      });

      return {
        output: {
          operation: 'create_bucket',
          bucket: bucketName,
        },
        message: `Created bucket **${bucketName}** in region **${region}**.`,
      };
    }

    // ── Delete Bucket ───────────────────────────────────────────────
    if (operation === 'delete_bucket') {
      if (!ctx.input.bucket) throw new Error('bucket is required for delete_bucket');

      let bucketName = ctx.input.bucket;

      await client.request({
        service: 's3',
        method: 'DELETE',
        path: `/${bucketName}`,
      });

      return {
        output: {
          operation: 'delete_bucket',
          bucket: bucketName,
        },
        message: `Deleted bucket **${bucketName}**.`,
      };
    }

    // ── List Objects ────────────────────────────────────────────────
    if (operation === 'list_objects') {
      if (!ctx.input.bucket) throw new Error('bucket is required for list_objects');

      let bucketName = ctx.input.bucket;
      let params: Record<string, string> = {
        'list-type': '2',
      };

      if (ctx.input.prefix) params['prefix'] = ctx.input.prefix;
      if (ctx.input.delimiter) params['delimiter'] = ctx.input.delimiter;
      if (ctx.input.maxKeys !== undefined) params['max-keys'] = String(ctx.input.maxKeys);
      if (ctx.input.continuationToken) params['continuation-token'] = ctx.input.continuationToken;

      let response = await client.request({
        service: 's3',
        method: 'GET',
        path: `/${bucketName}`,
        params,
      });

      let xml = typeof response === 'string' ? response : String(response);

      let contentBlocks = extractXmlBlocks(xml, 'Contents');
      let objects = contentBlocks.map((block) => {
        let sizeStr = extractXmlValue(block, 'Size');
        return {
          key: extractXmlValue(block, 'Key') ?? '',
          size: sizeStr ? parseInt(sizeStr, 10) : undefined,
          lastModified: extractXmlValue(block, 'LastModified'),
          storageClass: extractXmlValue(block, 'StorageClass'),
          etag: extractXmlValue(block, 'ETag'),
        };
      });

      let isTruncatedStr = extractXmlValue(xml, 'IsTruncated');
      let isTruncated = isTruncatedStr === 'true';
      let nextContinuationToken = extractXmlValue(xml, 'NextContinuationToken');

      let commonPrefixBlocks = extractXmlBlocks(xml, 'CommonPrefixes');
      let commonPrefixes = commonPrefixBlocks
        .map((block) => extractXmlValue(block, 'Prefix'))
        .filter((p): p is string => p !== undefined);

      let prefixLabel = ctx.input.prefix ? ` with prefix "${ctx.input.prefix}"` : '';
      let truncatedLabel = isTruncated ? ' (more results available)' : '';

      return {
        output: {
          operation: 'list_objects',
          bucket: bucketName,
          objects,
          isTruncated,
          nextContinuationToken: isTruncated ? nextContinuationToken : undefined,
          commonPrefixes: commonPrefixes.length > 0 ? commonPrefixes : undefined,
        },
        message: `Found **${objects.length}** object(s) in bucket **${bucketName}**${prefixLabel}${truncatedLabel}.${commonPrefixes.length > 0 ? ` Also found **${commonPrefixes.length}** common prefix(es).` : ''}`,
      };
    }

    // ── Get Object Metadata ─────────────────────────────────────────
    if (operation === 'get_object_metadata') {
      if (!ctx.input.bucket) throw new Error('bucket is required for get_object_metadata');
      if (!ctx.input.key) throw new Error('key is required for get_object_metadata');

      let bucketName = ctx.input.bucket;
      let objectKey = ctx.input.key;
      let encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');

      let response = await client.request({
        service: 's3',
        method: 'HEAD',
        path: `/${bucketName}/${encodedKey}`,
      });

      // HEAD responses return headers as the response data
      // The response may be empty string/object; metadata comes from response headers
      // Since the client returns response.data, for HEAD requests we need to handle
      // the case where axios may return headers differently
      let headers = typeof response === 'object' && response !== null ? response : {};

      // Extract user-defined metadata (x-amz-meta-* headers)
      let userMetadata: Record<string, string> = {};
      if (typeof headers === 'object') {
        for (let [headerKey, headerValue] of Object.entries(headers)) {
          let lowerKey = String(headerKey).toLowerCase();
          if (lowerKey.startsWith('x-amz-meta-')) {
            let metaKey = lowerKey.replace('x-amz-meta-', '');
            userMetadata[metaKey] = String(headerValue);
          }
        }
      }

      let contentLength = headers['content-length'] ?? headers['Content-Length'];
      let contentType = headers['content-type'] ?? headers['Content-Type'];
      let lastModified = headers['last-modified'] ?? headers['Last-Modified'];
      let etag = headers['etag'] ?? headers['ETag'];
      let storageClass = headers['x-amz-storage-class'] ?? headers['X-Amz-Storage-Class'];
      let serverSideEncryption = headers['x-amz-server-side-encryption'] ?? headers['X-Amz-Server-Side-Encryption'];
      let versionId = headers['x-amz-version-id'] ?? headers['X-Amz-Version-Id'];

      let metadata = {
        key: objectKey,
        bucket: bucketName,
        contentType: contentType ? String(contentType) : undefined,
        contentLength: contentLength ? parseInt(String(contentLength), 10) : undefined,
        lastModified: lastModified ? String(lastModified) : undefined,
        etag: etag ? String(etag) : undefined,
        storageClass: storageClass ? String(storageClass) : undefined,
        serverSideEncryption: serverSideEncryption ? String(serverSideEncryption) : undefined,
        versionId: versionId ? String(versionId) : undefined,
        metadata: Object.keys(userMetadata).length > 0 ? userMetadata : undefined,
      };

      let sizeLabel = contentLength ? ` (${formatBytes(parseInt(String(contentLength), 10))})` : '';

      return {
        output: {
          operation: 'get_object_metadata',
          bucket: bucketName,
          key: objectKey,
          objectMetadata: metadata,
        },
        message: `Retrieved metadata for **${objectKey}** in bucket **${bucketName}**${sizeLabel}.`,
      };
    }

    // ── Delete Object ───────────────────────────────────────────────
    if (operation === 'delete_object') {
      if (!ctx.input.bucket) throw new Error('bucket is required for delete_object');
      if (!ctx.input.key) throw new Error('key is required for delete_object');

      let bucketName = ctx.input.bucket;
      let objectKey = ctx.input.key;
      let encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');

      await client.request({
        service: 's3',
        method: 'DELETE',
        path: `/${bucketName}/${encodedKey}`,
      });

      return {
        output: {
          operation: 'delete_object',
          bucket: bucketName,
          key: objectKey,
        },
        message: `Deleted object **${objectKey}** from bucket **${bucketName}**.`,
      };
    }

    // ── Copy Object ─────────────────────────────────────────────────
    if (operation === 'copy_object') {
      if (!ctx.input.sourceBucket) throw new Error('sourceBucket is required for copy_object');
      if (!ctx.input.sourceKey) throw new Error('sourceKey is required for copy_object');
      if (!ctx.input.destinationBucket) throw new Error('destinationBucket is required for copy_object');
      if (!ctx.input.destinationKey) throw new Error('destinationKey is required for copy_object');

      let sourceBucket = ctx.input.sourceBucket;
      let sourceKey = ctx.input.sourceKey;
      let destinationBucket = ctx.input.destinationBucket;
      let destinationKey = ctx.input.destinationKey;

      let encodedSourceKey = sourceKey.split('/').map(encodeURIComponent).join('/');
      let encodedDestKey = destinationKey.split('/').map(encodeURIComponent).join('/');
      let copySource = `/${sourceBucket}/${encodedSourceKey}`;

      await client.request({
        service: 's3',
        method: 'PUT',
        path: `/${destinationBucket}/${encodedDestKey}`,
        headers: {
          'x-amz-copy-source': copySource,
        },
      });

      let sameLocation = sourceBucket === destinationBucket && sourceKey === destinationKey;
      let locationDesc = sourceBucket === destinationBucket
        ? `within bucket **${sourceBucket}**`
        : `from **${sourceBucket}** to **${destinationBucket}**`;

      return {
        output: {
          operation: 'copy_object',
          bucket: destinationBucket,
          key: destinationKey,
          copySourceBucket: sourceBucket,
          copySourceKey: sourceKey,
        },
        message: sameLocation
          ? `Copied object **${sourceKey}** onto itself in bucket **${sourceBucket}** (metadata refresh).`
          : `Copied **${sourceKey}** ${locationDesc} as **${destinationKey}**.`,
      };
    }

    throw new Error(`Unknown operation: ${operation}`);
  }).build();

let formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  let units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = Math.floor(Math.log(bytes) / Math.log(1024));
  let value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};
