import { createAxios } from 'slates';

let storageAxios = createAxios({
  baseURL: 'https://storage.googleapis.com'
});

export interface StorageObject {
  objectName: string;
  bucket: string;
  contentType?: string;
  size?: string;
  timeCreated?: string;
  updated?: string;
  md5Hash?: string;
  mediaLink?: string;
  selfLink?: string;
  generation?: string;
}

let mapStorageObject = (obj: any): StorageObject => ({
  objectName: obj.name,
  bucket: obj.bucket,
  contentType: obj.contentType,
  size: obj.size,
  timeCreated: obj.timeCreated,
  updated: obj.updated,
  md5Hash: obj.md5Hash,
  mediaLink: obj.mediaLink,
  selfLink: obj.selfLink,
  generation: obj.generation
});

export class StorageClient {
  private token: string;
  private bucket: string;

  constructor(params: { token: string; bucket: string }) {
    this.token = params.token;
    this.bucket = params.bucket;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`
    };
  }

  async listObjects(params?: {
    prefix?: string;
    delimiter?: string;
    maxResults?: number;
    pageToken?: string;
  }): Promise<{
    objects: StorageObject[];
    prefixes?: string[];
    nextPageToken?: string;
  }> {
    let response = await storageAxios.get(`/storage/v1/b/${this.bucket}/o`, {
      headers: this.headers,
      params: {
        prefix: params?.prefix,
        delimiter: params?.delimiter,
        maxResults: params?.maxResults || 100,
        pageToken: params?.pageToken
      }
    });

    return {
      objects: (response.data.items || []).map(mapStorageObject),
      prefixes: response.data.prefixes,
      nextPageToken: response.data.nextPageToken
    };
  }

  async getObjectMetadata(objectPath: string): Promise<StorageObject> {
    let encodedPath = encodeURIComponent(objectPath);
    let response = await storageAxios.get(`/storage/v1/b/${this.bucket}/o/${encodedPath}`, {
      headers: this.headers
    });

    return mapStorageObject(response.data);
  }

  async deleteObject(objectPath: string): Promise<void> {
    let encodedPath = encodeURIComponent(objectPath);
    await storageAxios.delete(`/storage/v1/b/${this.bucket}/o/${encodedPath}`, {
      headers: this.headers
    });
  }

  async getDownloadUrl(objectPath: string): Promise<string> {
    let encodedPath = encodeURIComponent(objectPath);
    let response = await storageAxios.get(`/storage/v1/b/${this.bucket}/o/${encodedPath}`, {
      headers: this.headers,
      params: { alt: 'json' }
    });

    return response.data.mediaLink || '';
  }

  async copyObject(
    sourceObjectPath: string,
    destinationBucket: string,
    destinationObjectPath: string
  ): Promise<StorageObject> {
    let encodedSource = encodeURIComponent(sourceObjectPath);
    let encodedDest = encodeURIComponent(destinationObjectPath);

    let response = await storageAxios.post(
      `/storage/v1/b/${this.bucket}/o/${encodedSource}/copyTo/b/${destinationBucket}/o/${encodedDest}`,
      {},
      {
        headers: this.headers
      }
    );

    return mapStorageObject(response.data);
  }

  async updateObjectMetadata(
    objectPath: string,
    metadata: Record<string, string>
  ): Promise<StorageObject> {
    let encodedPath = encodeURIComponent(objectPath);
    let response = await storageAxios.patch(
      `/storage/v1/b/${this.bucket}/o/${encodedPath}`,
      {
        metadata
      },
      {
        headers: this.headers
      }
    );

    return mapStorageObject(response.data);
  }
}
