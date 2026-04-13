import { createAxios } from 'slates';

export interface ClientConfig {
  token: string;
  apiVersion: string;
}

export class Client {
  private axios: any;
  private baseURL: string;

  constructor(private config: ClientConfig) {
    this.baseURL = `https://generativelanguage.googleapis.com/${config.apiVersion}`;

    this.axios = createAxios({
      baseURL: this.baseURL,
      headers: {
        'x-goog-api-key': config.token
      }
    });
  }

  // ─── Models ───

  async listModels(params?: { pageSize?: number; pageToken?: string }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.pageSize !== undefined) query.pageSize = params.pageSize;
    if (params?.pageToken) query.pageToken = params.pageToken;

    let response = await this.axios.get('/models', { params: query });
    return response.data;
  }

  async getModel(modelName: string): Promise<any> {
    let response = await this.axios.get(`/models/${modelName}`);
    return response.data;
  }

  // ─── Content Generation ───

  async generateContent(
    modelName: string,
    params: {
      contents: Array<{
        role?: string;
        parts: Array<any>;
      }>;
      systemInstruction?: { parts: Array<any> };
      generationConfig?: Record<string, any>;
      safetySettings?: Array<{ category: string; threshold: string }>;
      tools?: Array<any>;
      toolConfig?: Record<string, any>;
      cachedContent?: string;
    }
  ): Promise<any> {
    let body: Record<string, any> = {
      contents: params.contents
    };

    if (params.systemInstruction) body.systemInstruction = params.systemInstruction;
    if (params.generationConfig) body.generationConfig = params.generationConfig;
    if (params.safetySettings) body.safetySettings = params.safetySettings;
    if (params.tools) body.tools = params.tools;
    if (params.toolConfig) body.toolConfig = params.toolConfig;
    if (params.cachedContent) body.cachedContent = params.cachedContent;

    let response = await this.axios.post(`/models/${modelName}:generateContent`, body);
    return response.data;
  }

  // ─── Embeddings ───

  async embedContent(
    modelName: string,
    params: {
      content: { parts: Array<any> };
      taskType?: string;
      title?: string;
      outputDimensionality?: number;
    }
  ): Promise<any> {
    let body: Record<string, any> = {
      content: params.content
    };

    if (params.taskType) body.taskType = params.taskType;
    if (params.title) body.title = params.title;
    if (params.outputDimensionality !== undefined)
      body.outputDimensionality = params.outputDimensionality;

    let response = await this.axios.post(`/models/${modelName}:embedContent`, body);
    return response.data;
  }

  async batchEmbedContents(
    modelName: string,
    params: {
      requests: Array<{
        content: { parts: Array<any> };
        taskType?: string;
        title?: string;
        outputDimensionality?: number;
      }>;
    }
  ): Promise<any> {
    let body = {
      requests: params.requests.map(req => ({
        model: `models/${modelName}`,
        content: req.content,
        taskType: req.taskType,
        title: req.title,
        outputDimensionality: req.outputDimensionality
      }))
    };

    let response = await this.axios.post(`/models/${modelName}:batchEmbedContents`, body);
    return response.data;
  }

  // ─── Token Counting ───

  async countTokens(
    modelName: string,
    params: {
      contents?: Array<{ role?: string; parts: Array<any> }>;
      generateContentRequest?: Record<string, any>;
    }
  ): Promise<any> {
    let body: Record<string, any> = {};

    if (params.contents) body.contents = params.contents;
    if (params.generateContentRequest)
      body.generateContentRequest = params.generateContentRequest;

    let response = await this.axios.post(`/models/${modelName}:countTokens`, body);
    return response.data;
  }

  // ─── File Management ───

  async uploadFile(params: {
    displayName?: string;
    mimeType: string;
    fileData: string; // base64 encoded
  }): Promise<any> {
    let body: Record<string, any> = {
      file: {
        displayName: params.displayName
      }
    };

    let response = await this.axios.post(
      `https://generativelanguage.googleapis.com/upload/${this.config.apiVersion}/files`,
      {
        file: { displayName: params.displayName },
        inline_data: {
          mime_type: params.mimeType,
          data: params.fileData
        }
      },
      {
        headers: {
          'x-goog-api-key': this.config.token
        }
      }
    );
    return response.data;
  }

  async listFiles(params?: { pageSize?: number; pageToken?: string }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.pageSize !== undefined) query.pageSize = params.pageSize;
    if (params?.pageToken) query.pageToken = params.pageToken;

    let response = await this.axios.get('/files', { params: query });
    return response.data;
  }

  async getFile(fileName: string): Promise<any> {
    let name = fileName.startsWith('files/') ? fileName : `files/${fileName}`;
    let response = await this.axios.get(`/${name}`);
    return response.data;
  }

  async deleteFile(fileName: string): Promise<any> {
    let name = fileName.startsWith('files/') ? fileName : `files/${fileName}`;
    let response = await this.axios.delete(`/${name}`);
    return response.data;
  }

  // ─── Cached Content ───

  async createCachedContent(params: {
    model: string;
    contents: Array<{ role?: string; parts: Array<any> }>;
    systemInstruction?: { parts: Array<any> };
    tools?: Array<any>;
    ttl?: string;
    expireTime?: string;
    displayName?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      model: params.model.startsWith('models/') ? params.model : `models/${params.model}`,
      contents: params.contents
    };

    if (params.systemInstruction) body.systemInstruction = params.systemInstruction;
    if (params.tools) body.tools = params.tools;
    if (params.ttl) body.ttl = params.ttl;
    if (params.expireTime) body.expireTime = params.expireTime;
    if (params.displayName) body.displayName = params.displayName;

    let response = await this.axios.post('/cachedContents', body);
    return response.data;
  }

  async listCachedContents(params?: { pageSize?: number; pageToken?: string }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.pageSize !== undefined) query.pageSize = params.pageSize;
    if (params?.pageToken) query.pageToken = params.pageToken;

    let response = await this.axios.get('/cachedContents', { params: query });
    return response.data;
  }

  async getCachedContent(name: string): Promise<any> {
    let fullName = name.startsWith('cachedContents/') ? name : `cachedContents/${name}`;
    let response = await this.axios.get(`/${fullName}`);
    return response.data;
  }

  async updateCachedContent(
    name: string,
    params: {
      ttl?: string;
      expireTime?: string;
    }
  ): Promise<any> {
    let fullName = name.startsWith('cachedContents/') ? name : `cachedContents/${name}`;
    let body: Record<string, any> = {};
    let updateMask: string[] = [];

    if (params.ttl) {
      body.ttl = params.ttl;
      updateMask.push('ttl');
    }
    if (params.expireTime) {
      body.expireTime = params.expireTime;
      updateMask.push('expireTime');
    }

    let response = await this.axios.patch(`/${fullName}`, body, {
      params: { updateMask: updateMask.join(',') }
    });
    return response.data;
  }

  async deleteCachedContent(name: string): Promise<any> {
    let fullName = name.startsWith('cachedContents/') ? name : `cachedContents/${name}`;
    let response = await this.axios.delete(`/${fullName}`);
    return response.data;
  }

  // ─── Tuned Models ───

  async listTunedModels(params?: { pageSize?: number; pageToken?: string }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.pageSize !== undefined) query.pageSize = params.pageSize;
    if (params?.pageToken) query.pageToken = params.pageToken;

    let response = await this.axios.get('/tunedModels', { params: query });
    return response.data;
  }

  async getTunedModel(name: string): Promise<any> {
    let fullName = name.startsWith('tunedModels/') ? name : `tunedModels/${name}`;
    let response = await this.axios.get(`/${fullName}`);
    return response.data;
  }
}
