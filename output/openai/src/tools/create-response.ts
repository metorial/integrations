import { SlateTool } from 'slates';
import { createClient } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let createResponse = SlateTool.create(
  spec,
  {
    name: 'Create Response',
    key: 'create_response',
    description: `Generate a response using the OpenAI Responses API, the primary gateway for all model families. Supports text generation, built-in tools (web search, file search, code interpreter), function calling, structured output, and reasoning models with configurable effort levels.`,
    instructions: [
      'Use "input" as a simple string for single-turn prompts, or provide an array of message objects for multi-turn conversations.',
      'For reasoning models, set reasoning.effort to "low", "medium", or "high".',
      'Built-in tools include: web_search, file_search, code_interpreter.',
    ],
    tags: {
      readOnly: true,
      destructive: false,
    },
  }
)
  .input(z.object({
    model: z.string().describe('Model ID to use (e.g. "gpt-4o", "gpt-5", "gpt-5-mini")'),
    input: z.union([
      z.string(),
      z.array(z.any()),
    ]).describe('Text prompt or array of input messages'),
    instructions: z.string().optional().describe('System-level instructions for the model'),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature between 0 and 2'),
    maxOutputTokens: z.number().optional().describe('Maximum number of tokens to generate'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling parameter'),
    tools: z.array(z.any()).optional().describe('Tools available to the model (e.g. web_search, file_search, code_interpreter, or function definitions)'),
    toolChoice: z.union([z.string(), z.any()]).optional().describe('How the model should choose tools'),
    responseFormatType: z.enum(['text', 'json_object', 'json_schema']).optional().describe('Format of the response'),
    jsonSchema: z.any().optional().describe('JSON Schema when responseFormatType is "json_schema"'),
    reasoningEffort: z.enum(['low', 'medium', 'high']).optional().describe('Reasoning effort level for reasoning models'),
    store: z.boolean().optional().describe('Whether to store the response for later retrieval'),
    metadata: z.record(z.string(), z.string()).optional().describe('Key-value metadata to attach'),
    user: z.string().optional().describe('Unique identifier for the end-user'),
  }))
  .output(z.object({
    responseId: z.string().describe('Response identifier'),
    outputText: z.string().nullable().describe('Generated text output'),
    status: z.string().describe('Response status (e.g. "completed")'),
    model: z.string().describe('Model used'),
    outputItems: z.array(z.any()).describe('Full output items including tool calls, messages, etc.'),
    inputTokens: z.number().describe('Number of input tokens'),
    outputTokens: z.number().describe('Number of output tokens'),
    totalTokens: z.number().describe('Total tokens used'),
  }))
  .handleInvocation(async (ctx) => {
    let client = createClient(ctx);

    let responseFormat: any = undefined;
    if (ctx.input.responseFormatType) {
      responseFormat = { type: ctx.input.responseFormatType };
      if (ctx.input.responseFormatType === 'json_schema' && ctx.input.jsonSchema) {
        responseFormat.json_schema = ctx.input.jsonSchema;
      }
    }

    let reasoning: any = undefined;
    if (ctx.input.reasoningEffort) {
      reasoning = { effort: ctx.input.reasoningEffort };
    }

    let result = await client.createResponse({
      model: ctx.input.model,
      input: ctx.input.input,
      instructions: ctx.input.instructions,
      temperature: ctx.input.temperature,
      maxOutputTokens: ctx.input.maxOutputTokens,
      topP: ctx.input.topP,
      tools: ctx.input.tools,
      toolChoice: ctx.input.toolChoice,
      responseFormat,
      reasoning,
      store: ctx.input.store,
      metadata: ctx.input.metadata,
      user: ctx.input.user,
    });

    let outputText: string | null = null;
    if (result.output) {
      for (let item of result.output) {
        if (item.type === 'message' && item.content) {
          for (let content of item.content) {
            if (content.type === 'output_text') {
              outputText = content.text;
              break;
            }
          }
        }
        if (outputText) break;
      }
    }

    return {
      output: {
        responseId: result.id,
        outputText,
        status: result.status,
        model: result.model,
        outputItems: result.output ?? [],
        inputTokens: result.usage?.input_tokens ?? 0,
        outputTokens: result.usage?.output_tokens ?? 0,
        totalTokens: (result.usage?.input_tokens ?? 0) + (result.usage?.output_tokens ?? 0),
      },
      message: `Response **${result.id}** generated using **${result.model}**. Status: ${result.status}. Tokens: ${(result.usage?.input_tokens ?? 0) + (result.usage?.output_tokens ?? 0)}.`,
    };
  })
  .build();
