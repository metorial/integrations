import { createAxios } from 'slates';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  FimCompletionRequest,
  FimCompletionResponse,
  GetBalanceResponse,
  ListModelsResponse
} from './types';
import { deepSeekApiError } from './errors';

export class DeepSeekClient {
  private axios;

  constructor(private params: { token: string; baseUrl: string }) {
    this.axios = createAxios({
      baseURL: params.baseUrl,
      headers: {
        Authorization: `Bearer ${params.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private createBetaAxios() {
    return createAxios({
      baseURL: 'https://api.deepseek.com/beta',
      headers: {
        Authorization: `Bearer ${this.params.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    options?: { beta?: boolean }
  ): Promise<ChatCompletionResponse> {
    let body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      stream: false
    };

    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.top_p !== undefined) body.top_p = request.top_p;
    if (request.max_tokens !== undefined) body.max_tokens = request.max_tokens;
    if (request.stop !== undefined) body.stop = request.stop;
    if (request.response_format !== undefined) body.response_format = request.response_format;
    if (request.tools !== undefined) body.tools = request.tools;
    if (request.tool_choice !== undefined) body.tool_choice = request.tool_choice;
    if (request.thinking !== undefined) body.thinking = request.thinking;
    if (request.reasoning_effort !== undefined)
      body.reasoning_effort = request.reasoning_effort;
    if (request.logprobs !== undefined) body.logprobs = request.logprobs;
    if (request.top_logprobs !== undefined) body.top_logprobs = request.top_logprobs;
    if (request.user_id !== undefined) body.user_id = request.user_id;

    try {
      let axios = options?.beta ? this.createBetaAxios() : this.axios;
      let response = await axios.post('/chat/completions', body);
      return response.data as ChatCompletionResponse;
    } catch (error) {
      throw deepSeekApiError(error, 'create chat completion');
    }
  }

  async createFimCompletion(request: FimCompletionRequest): Promise<FimCompletionResponse> {
    let body: Record<string, unknown> = {
      model: request.model,
      prompt: request.prompt,
      stream: false
    };

    if (request.suffix !== undefined) body.suffix = request.suffix;
    if (request.echo !== undefined) body.echo = request.echo;
    if (request.max_tokens !== undefined) body.max_tokens = request.max_tokens;
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.top_p !== undefined) body.top_p = request.top_p;
    if (request.stop !== undefined) body.stop = request.stop;
    if (request.logprobs !== undefined) body.logprobs = request.logprobs;

    try {
      let response = await this.createBetaAxios().post('/completions', body);
      return response.data as FimCompletionResponse;
    } catch (error) {
      throw deepSeekApiError(error, 'create FIM completion');
    }
  }

  async listModels(): Promise<ListModelsResponse> {
    try {
      let response = await this.axios.get('/models');
      return response.data as ListModelsResponse;
    } catch (error) {
      throw deepSeekApiError(error, 'list models');
    }
  }

  async getBalance(): Promise<GetBalanceResponse> {
    try {
      let response = await this.axios.get('/user/balance');
      return response.data as GetBalanceResponse;
    } catch (error) {
      throw deepSeekApiError(error, 'get user balance');
    }
  }
}
