import { SlateTool } from 'slates';
import { AnthropicClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let contentBlockSchema: z.ZodType<Record<string, unknown>> = z
  .record(z.string(), z.unknown())
  .describe('Content block (text, image, tool_use, tool_result, etc.)');

let messageSchema = z.object({
  role: z.enum(['user', 'assistant']).describe('Role of the message sender'),
  content: z
    .union([
      z.string().describe('Simple text content'),
      z.array(contentBlockSchema).describe('Array of content blocks for multi-modal input')
    ])
    .describe('Message content')
});

let toolDefinitionSchema = z
  .object({
    name: z.string().describe('Tool name'),
    description: z.string().optional().describe('Tool description'),
    inputSchema: z.record(z.string(), z.unknown()).describe('JSON Schema for tool input')
  })
  .describe('Tool definition');

let toolChoiceSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .describe(
    'Tool choice configuration: { type: "auto" }, { type: "any" }, { type: "tool", name: "..." }, or { type: "none" }'
  );

let thinkingSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .describe(
    'Extended thinking config: { type: "enabled", budget_tokens: 1024 }, { type: "disabled" }, or { type: "adaptive" }'
  );

export let sendMessage = SlateTool.create(spec, {
  name: 'Send Message',
  key: 'send_message',
  description: `Send a message to Claude and receive a generated response. Supports multi-turn conversations, system prompts, tool use (function calling), extended thinking, and vision (images).
Provide a conversation history as messages and configure model parameters to control the response.`,
  instructions: [
    'The messages array must alternate between user and assistant roles.',
    'Use content blocks (arrays) for multi-modal input like images or tool results.',
    'Set tools and toolChoice to enable function calling.',
    'Enable extended thinking with the thinking parameter for complex reasoning tasks (minimum 1024 budget tokens).'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      model: z
        .string()
        .describe('Claude model ID, e.g. "claude-sonnet-4-5-20250929", "claude-haiku-4-5"'),
      maxTokens: z.number().describe('Maximum number of tokens to generate'),
      messages: z.array(messageSchema).describe('Conversation messages'),
      system: z
        .string()
        .optional()
        .describe('System prompt to set context and instructions for Claude'),
      temperature: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe('Sampling temperature (0-1). Lower values are more deterministic'),
      topK: z.number().optional().describe('Top-K sampling parameter'),
      topP: z.number().optional().describe('Nucleus sampling parameter'),
      stopSequences: z.array(z.string()).optional().describe('Custom stop sequences'),
      tools: z
        .array(toolDefinitionSchema)
        .optional()
        .describe('Tool definitions for function calling'),
      toolChoice: toolChoiceSchema,
      thinking: thinkingSchema
    })
  )
  .output(
    z.object({
      messageId: z.string().describe('Unique message ID'),
      role: z.string().describe('Response role (always "assistant")'),
      content: z
        .array(z.record(z.string(), z.unknown()))
        .describe('Response content blocks (text, tool_use, thinking, etc.)'),
      model: z.string().describe('Model that generated the response'),
      stopReason: z
        .string()
        .describe(
          'Reason the model stopped: "end_turn", "max_tokens", "stop_sequence", or "tool_use"'
        ),
      stopSequence: z
        .string()
        .optional()
        .describe('The stop sequence that caused the model to stop, if applicable'),
      inputTokens: z.number().describe('Number of input tokens consumed'),
      outputTokens: z.number().describe('Number of output tokens generated')
    })
  )
  .handleInvocation(async ctx => {
    let client = new AnthropicClient({
      token: ctx.auth.token,
      apiVersion: ctx.config.apiVersion
    });

    let tools = ctx.input.tools?.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema
    }));

    let messages = ctx.input.messages as Array<{
      role: 'user' | 'assistant';
      content: string | Array<Record<string, unknown>>;
    }>;
    let result = await client.createMessage({
      model: ctx.input.model,
      maxTokens: ctx.input.maxTokens,
      messages,
      system: ctx.input.system,
      temperature: ctx.input.temperature,
      topK: ctx.input.topK,
      topP: ctx.input.topP,
      stopSequences: ctx.input.stopSequences,
      tools,
      toolChoice: ctx.input.toolChoice,
      thinking: ctx.input.thinking
    });

    let usage = result.usage as Record<string, number> | undefined;
    let content = result.content as Array<Record<string, unknown>>;

    let textContent = content
      .filter(b => b.type === 'text')
      .map(b => b.text as string)
      .join('\n');

    let summary =
      textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;

    return {
      output: {
        messageId: result.id as string,
        role: result.role as string,
        content,
        model: result.model as string,
        stopReason: result.stop_reason as string,
        stopSequence: result.stop_sequence as string | undefined,
        inputTokens: usage?.input_tokens ?? 0,
        outputTokens: usage?.output_tokens ?? 0
      },
      message: `Claude responded with **${content.length}** content block(s) using **${result.model}**. Stop reason: **${result.stop_reason}**.\n\n${summary ? `> ${summary}` : ''}`
    };
  })
  .build();
