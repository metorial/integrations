import { createAxios } from 'slates';

export interface ClientConfig {
  token: string;
  organizationId?: string;
  projectId?: string;
}

export class Client {
  private axios: any;

  constructor(private config: ClientConfig) {
    let headers: Record<string, string> = {
      Authorization: `Bearer ${config.token}`,
    };

    if (config.organizationId) {
      headers['OpenAI-Organization'] = config.organizationId;
    }

    if (config.projectId) {
      headers['OpenAI-Project'] = config.projectId;
    }

    this.axios = createAxios({
      baseURL: 'https://api.openai.com/v1',
      headers,
    });
  }

  // ─── Chat Completions ───

  async createChatCompletion(params: {
    model: string;
    messages: Array<{
      role: string;
      content: string | Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }>;
      name?: string;
    }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string | string[];
    responseFormat?: { type: string; json_schema?: any };
    tools?: Array<{
      type: string;
      function: { name: string; description?: string; parameters?: any };
    }>;
    toolChoice?: string | { type: string; function: { name: string } };
    seed?: number;
    user?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      model: params.model,
      messages: params.messages,
    };

    if (params.temperature !== undefined) body.temperature = params.temperature;
    if (params.maxTokens !== undefined) body.max_tokens = params.maxTokens;
    if (params.topP !== undefined) body.top_p = params.topP;
    if (params.frequencyPenalty !== undefined) body.frequency_penalty = params.frequencyPenalty;
    if (params.presencePenalty !== undefined) body.presence_penalty = params.presencePenalty;
    if (params.stop !== undefined) body.stop = params.stop;
    if (params.responseFormat !== undefined) body.response_format = params.responseFormat;
    if (params.tools !== undefined) body.tools = params.tools;
    if (params.toolChoice !== undefined) body.tool_choice = params.toolChoice;
    if (params.seed !== undefined) body.seed = params.seed;
    if (params.user !== undefined) body.user = params.user;

    let response = await this.axios.post('/chat/completions', body);
    return response.data;
  }

  // ─── Responses API ───

  async createResponse(params: {
    model: string;
    input: string | Array<any>;
    instructions?: string;
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    tools?: Array<any>;
    toolChoice?: string | any;
    responseFormat?: { type: string; json_schema?: any };
    reasoning?: { effort?: string };
    user?: string;
    store?: boolean;
    metadata?: Record<string, string>;
  }): Promise<any> {
    let body: Record<string, any> = {
      model: params.model,
      input: params.input,
    };

    if (params.instructions !== undefined) body.instructions = params.instructions;
    if (params.temperature !== undefined) body.temperature = params.temperature;
    if (params.maxOutputTokens !== undefined) body.max_output_tokens = params.maxOutputTokens;
    if (params.topP !== undefined) body.top_p = params.topP;
    if (params.tools !== undefined) body.tools = params.tools;
    if (params.toolChoice !== undefined) body.tool_choice = params.toolChoice;
    if (params.responseFormat !== undefined) body.response_format = params.responseFormat;
    if (params.reasoning !== undefined) body.reasoning = params.reasoning;
    if (params.user !== undefined) body.user = params.user;
    if (params.store !== undefined) body.store = params.store;
    if (params.metadata !== undefined) body.metadata = params.metadata;

    let response = await this.axios.post('/responses', body);
    return response.data;
  }

  async getResponse(responseId: string): Promise<any> {
    let response = await this.axios.get(`/responses/${responseId}`);
    return response.data;
  }

  async deleteResponse(responseId: string): Promise<any> {
    let response = await this.axios.delete(`/responses/${responseId}`);
    return response.data;
  }

  // ─── Embeddings ───

  async createEmbedding(params: {
    model: string;
    input: string | string[];
    dimensions?: number;
    encodingFormat?: string;
    user?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      model: params.model,
      input: params.input,
    };

    if (params.dimensions !== undefined) body.dimensions = params.dimensions;
    if (params.encodingFormat !== undefined) body.encoding_format = params.encodingFormat;
    if (params.user !== undefined) body.user = params.user;

    let response = await this.axios.post('/embeddings', body);
    return response.data;
  }

  // ─── Image Generation ───

  async createImage(params: {
    prompt: string;
    model?: string;
    n?: number;
    quality?: string;
    responseFormat?: string;
    size?: string;
    style?: string;
    user?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      prompt: params.prompt,
    };

    if (params.model !== undefined) body.model = params.model;
    if (params.n !== undefined) body.n = params.n;
    if (params.quality !== undefined) body.quality = params.quality;
    if (params.responseFormat !== undefined) body.response_format = params.responseFormat;
    if (params.size !== undefined) body.size = params.size;
    if (params.style !== undefined) body.style = params.style;
    if (params.user !== undefined) body.user = params.user;

    let response = await this.axios.post('/images/generations', body);
    return response.data;
  }

  // ─── Audio ───

  async createSpeech(params: {
    model: string;
    input: string;
    voice: string;
    responseFormat?: string;
    speed?: number;
  }): Promise<any> {
    let body: Record<string, any> = {
      model: params.model,
      input: params.input,
      voice: params.voice,
    };

    if (params.responseFormat !== undefined) body.response_format = params.responseFormat;
    if (params.speed !== undefined) body.speed = params.speed;

    let response = await this.axios.post('/audio/speech', body, {
      responseType: 'arraybuffer',
    });
    return response.data;
  }

  async createTranscription(params: {
    file: any;
    model: string;
    language?: string;
    prompt?: string;
    responseFormat?: string;
    temperature?: number;
  }): Promise<any> {
    let response = await this.axios.post('/audio/transcriptions', params.file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // ─── Content Moderation ───

  async createModeration(params: {
    input: string | string[];
    model?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      input: params.input,
    };

    if (params.model !== undefined) body.model = params.model;

    let response = await this.axios.post('/moderations', body);
    return response.data;
  }

  // ─── Models ───

  async listModels(): Promise<any> {
    let response = await this.axios.get('/models');
    return response.data;
  }

  async getModel(modelId: string): Promise<any> {
    let response = await this.axios.get(`/models/${modelId}`);
    return response.data;
  }

  // ─── Files ───

  async listFiles(params?: { purpose?: string }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.purpose) query.purpose = params.purpose;

    let response = await this.axios.get('/files', { params: query });
    return response.data;
  }

  async getFile(fileId: string): Promise<any> {
    let response = await this.axios.get(`/files/${fileId}`);
    return response.data;
  }

  async deleteFile(fileId: string): Promise<any> {
    let response = await this.axios.delete(`/files/${fileId}`);
    return response.data;
  }

  async getFileContent(fileId: string): Promise<any> {
    let response = await this.axios.get(`/files/${fileId}/content`);
    return response.data;
  }

  // ─── Fine-Tuning ───

  async createFineTuningJob(params: {
    model: string;
    trainingFile: string;
    validationFile?: string;
    hyperparameters?: {
      nEpochs?: number | string;
      batchSize?: number | string;
      learningRateMultiplier?: number | string;
    };
    suffix?: string;
    method?: { type: string; supervised?: any; dpo?: any };
  }): Promise<any> {
    let body: Record<string, any> = {
      model: params.model,
      training_file: params.trainingFile,
    };

    if (params.validationFile !== undefined) body.validation_file = params.validationFile;
    if (params.suffix !== undefined) body.suffix = params.suffix;
    if (params.method !== undefined) body.method = params.method;

    if (params.hyperparameters) {
      let hp: Record<string, any> = {};
      if (params.hyperparameters.nEpochs !== undefined) hp.n_epochs = params.hyperparameters.nEpochs;
      if (params.hyperparameters.batchSize !== undefined) hp.batch_size = params.hyperparameters.batchSize;
      if (params.hyperparameters.learningRateMultiplier !== undefined) hp.learning_rate_multiplier = params.hyperparameters.learningRateMultiplier;
      body.hyperparameters = hp;
    }

    let response = await this.axios.post('/fine_tuning/jobs', body);
    return response.data;
  }

  async listFineTuningJobs(params?: { after?: string; limit?: number }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.after) query.after = params.after;
    if (params?.limit) query.limit = params.limit;

    let response = await this.axios.get('/fine_tuning/jobs', { params: query });
    return response.data;
  }

  async getFineTuningJob(jobId: string): Promise<any> {
    let response = await this.axios.get(`/fine_tuning/jobs/${jobId}`);
    return response.data;
  }

  async cancelFineTuningJob(jobId: string): Promise<any> {
    let response = await this.axios.post(`/fine_tuning/jobs/${jobId}/cancel`);
    return response.data;
  }

  async listFineTuningEvents(jobId: string, params?: { after?: string; limit?: number }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.after) query.after = params.after;
    if (params?.limit) query.limit = params.limit;

    let response = await this.axios.get(`/fine_tuning/jobs/${jobId}/events`, { params: query });
    return response.data;
  }

  // ─── Batch Processing ───

  async createBatch(params: {
    inputFileId: string;
    endpoint: string;
    completionWindow: string;
    metadata?: Record<string, string>;
  }): Promise<any> {
    let body: Record<string, any> = {
      input_file_id: params.inputFileId,
      endpoint: params.endpoint,
      completion_window: params.completionWindow,
    };

    if (params.metadata !== undefined) body.metadata = params.metadata;

    let response = await this.axios.post('/batches', body);
    return response.data;
  }

  async getBatch(batchId: string): Promise<any> {
    let response = await this.axios.get(`/batches/${batchId}`);
    return response.data;
  }

  async cancelBatch(batchId: string): Promise<any> {
    let response = await this.axios.post(`/batches/${batchId}/cancel`);
    return response.data;
  }

  async listBatches(params?: { after?: string; limit?: number }): Promise<any> {
    let response = await this.axios.get('/batches', { params });
    return response.data;
  }

  // ─── Vector Stores ───

  async createVectorStore(params: {
    name?: string;
    fileIds?: string[];
    expiresAfter?: { anchor: string; days: number };
    chunkingStrategy?: any;
    metadata?: Record<string, string>;
  }): Promise<any> {
    let body: Record<string, any> = {};

    if (params.name !== undefined) body.name = params.name;
    if (params.fileIds !== undefined) body.file_ids = params.fileIds;
    if (params.expiresAfter !== undefined) body.expires_after = params.expiresAfter;
    if (params.chunkingStrategy !== undefined) body.chunking_strategy = params.chunkingStrategy;
    if (params.metadata !== undefined) body.metadata = params.metadata;

    let response = await this.axios.post('/vector_stores', body);
    return response.data;
  }

  async listVectorStores(params?: { limit?: number; order?: string; after?: string; before?: string }): Promise<any> {
    let response = await this.axios.get('/vector_stores', { params });
    return response.data;
  }

  async getVectorStore(vectorStoreId: string): Promise<any> {
    let response = await this.axios.get(`/vector_stores/${vectorStoreId}`);
    return response.data;
  }

  async updateVectorStore(vectorStoreId: string, params: {
    name?: string;
    expiresAfter?: { anchor: string; days: number } | null;
    metadata?: Record<string, string>;
  }): Promise<any> {
    let response = await this.axios.post(`/vector_stores/${vectorStoreId}`, params);
    return response.data;
  }

  async deleteVectorStore(vectorStoreId: string): Promise<any> {
    let response = await this.axios.delete(`/vector_stores/${vectorStoreId}`);
    return response.data;
  }

  async searchVectorStore(vectorStoreId: string, params: {
    query: string;
    maxResults?: number;
    filters?: any;
    rankingOptions?: { ranker?: string; scoreThreshold?: number };
  }): Promise<any> {
    let body: Record<string, any> = {
      query: params.query,
    };

    if (params.maxResults !== undefined) body.max_num_results = params.maxResults;
    if (params.filters !== undefined) body.filters = params.filters;
    if (params.rankingOptions !== undefined) body.ranking_options = params.rankingOptions;

    let response = await this.axios.post(`/vector_stores/${vectorStoreId}/search`, body);
    return response.data;
  }

  // ─── Vector Store Files ───

  async addFileToVectorStore(vectorStoreId: string, params: {
    fileId: string;
    chunkingStrategy?: any;
  }): Promise<any> {
    let body: Record<string, any> = {
      file_id: params.fileId,
    };

    if (params.chunkingStrategy !== undefined) body.chunking_strategy = params.chunkingStrategy;

    let response = await this.axios.post(`/vector_stores/${vectorStoreId}/files`, body);
    return response.data;
  }

  async listVectorStoreFiles(vectorStoreId: string, params?: {
    limit?: number;
    order?: string;
    after?: string;
    before?: string;
    filter?: string;
  }): Promise<any> {
    let response = await this.axios.get(`/vector_stores/${vectorStoreId}/files`, { params });
    return response.data;
  }

  async removeFileFromVectorStore(vectorStoreId: string, fileId: string): Promise<any> {
    let response = await this.axios.delete(`/vector_stores/${vectorStoreId}/files/${fileId}`);
    return response.data;
  }

  // ─── Webhooks ───

  async createWebhook(params: {
    url: string;
    enabledEvents: string[];
  }): Promise<any> {
    let response = await this.axios.post('/webhooks', {
      url: params.url,
      enabled_events: params.enabledEvents,
    });
    return response.data;
  }

  async getWebhook(webhookId: string): Promise<any> {
    let response = await this.axios.get(`/webhooks/${webhookId}`);
    return response.data;
  }

  async updateWebhook(webhookId: string, params: {
    url?: string;
    enabledEvents?: string[];
    disabled?: boolean;
  }): Promise<any> {
    let body: Record<string, any> = {};
    if (params.url !== undefined) body.url = params.url;
    if (params.enabledEvents !== undefined) body.enabled_events = params.enabledEvents;
    if (params.disabled !== undefined) body.disabled = params.disabled;

    let response = await this.axios.post(`/webhooks/${webhookId}`, body);
    return response.data;
  }

  async deleteWebhook(webhookId: string): Promise<any> {
    let response = await this.axios.delete(`/webhooks/${webhookId}`);
    return response.data;
  }

  async listWebhooks(): Promise<any> {
    let response = await this.axios.get('/webhooks');
    return response.data;
  }
}
