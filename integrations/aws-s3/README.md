# <img src="https://provider-logos.metorial-cdn.com/amazon.svg" height="20"> Aws S3

Store, retrieve, and manage objects in Amazon S3 buckets. Upload and download files up to 5 TB, create and configure buckets, generate presigned URLs for temporary access, and manage object versions. Set access controls via bucket policies and ACLs, configure lifecycle rules to transition or expire objects, enable replication across regions, and encrypt objects at rest. Tag objects and buckets with key-value pairs, lock objects with WORM policies, enable server access logging, and host static websites. Receive event notifications when objects are created, deleted, restored, tagged, or transitioned between storage classes.

## Tools

### Copy Object

Copy an object within or between S3 buckets. Can copy to a different key in the same bucket or to a different bucket entirely. Optionally replace metadata during copy by setting **metadataDirective** to \

### Delete Objects

Delete one or more objects from an S3 bucket. Supports deleting specific versions of versioned objects. For a single object, provide one item in the array. For batch deletion, provide up to 1000 objects.

### Generate Presigned URL

Generate a presigned URL for temporary access to an S3 object. The URL includes authentication in the query string so it can be shared without credentials. Use **GET** for downloads and **PUT** for uploads. URLs are valid for a configurable duration (default 1 hour, max 7 days).

### Get Bucket Info

Retrieve configuration details about an S3 bucket including its location, versioning status, tags, and bucket policy. Select which details to include using the **include** parameter.

### Get Object

Download an object from S3 or retrieve its metadata. Set **metadataOnly** to \

### List Buckets

List all S3 buckets in the AWS account. Returns bucket names and creation dates. Use this to discover available buckets before performing operations on specific buckets.

### List Object Versions

List all versions of objects in an S3 bucket, including delete markers. Requires versioning to be enabled on the bucket. Use **prefix** to filter versions for a specific object or folder.

### List Objects

List objects in an S3 bucket with optional filtering by prefix. Supports pagination and delimiter-based grouping to browse folder-like hierarchies. Use the **delimiter** parameter (typically \

### Manage Bucket

Create or delete an S3 bucket. When creating, the bucket is placed in the configured region. When deleting, the bucket must be empty. Also supports enabling/disabling versioning on a bucket.

### Manage Object Tags

Get, set, or remove tags on an S3 object. Tags are key-value pairs useful for cost allocation, access control, and automation. When setting tags, provide the **complete** tag set — existing tags are replaced entirely.

### Put Object

Upload an object to an S3 bucket. Provide the content as text and specify the object key (path). Supports optional settings for content type, storage class, encryption, access control, tags, and custom metadata.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
