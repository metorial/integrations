import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let askFred = SlateTool.create(
  spec,
  {
    name: 'Ask Fred',
    key: 'ask_fred',
    description: `Ask AskFred (Fireflies' AI assistant) a question about your meetings. Creates a new conversation thread for a specific transcript or across meetings with optional filters. Returns an AI-generated answer with suggested follow-up questions. Use the thread ID from the response to continue the conversation with **Continue AskFred Thread**.`,
    instructions: [
      'Provide either a transcriptId for a specific meeting OR use filters to query across multiple meetings — not both.',
    ],
    constraints: [
      'Requires active AI credits on the account.',
      'Query limited to 2000 characters.',
    ],
  }
)
  .input(z.object({
    query: z.string().describe('Natural language question about your meetings (max 2000 characters)'),
    transcriptId: z.string().optional().describe('Target a specific transcript. Mutually exclusive with filters.'),
    filters: z.object({
      startTime: z.string().optional().describe('Start of date range (ISO 8601). Defaults to 30 days before endTime.'),
      endTime: z.string().optional().describe('End of date range (ISO 8601). Defaults to today.'),
      channelIds: z.array(z.string()).optional().describe('Filter by channel IDs'),
      organizers: z.array(z.string()).optional().describe('Filter by organizer emails'),
      participants: z.array(z.string()).optional().describe('Filter by participant emails'),
      transcriptIds: z.array(z.string()).optional().describe('Filter by specific transcript IDs'),
    }).optional().describe('Filters for querying across multiple meetings'),
    responseLanguage: z.string().optional().describe('Language code for the response (e.g. "en", "es")'),
    formatMode: z.enum(['markdown', 'plaintext']).optional().describe('Response format mode'),
  }))
  .output(z.object({
    messageId: z.string().nullable().describe('Message identifier'),
    threadId: z.string().nullable().describe('Thread ID for follow-up questions'),
    answer: z.string().nullable().describe('AI-generated answer'),
    suggestedQueries: z.array(z.string()).nullable().describe('Suggested follow-up questions'),
    status: z.string().nullable().describe('Response status'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new FirefliesClient({ token: ctx.auth.token });

    let result = await client.createAskFredThread({
      query: ctx.input.query,
      transcriptId: ctx.input.transcriptId,
      filters: ctx.input.filters,
      responseLanguage: ctx.input.responseLanguage,
      formatMode: ctx.input.formatMode,
    });

    let message = result?.message;

    return {
      output: {
        messageId: message?.id ?? null,
        threadId: message?.thread_id ?? null,
        answer: message?.answer ?? null,
        suggestedQueries: message?.suggested_queries ?? null,
        status: message?.status ?? null,
      },
      message: message?.answer
        ? `**AskFred response** (thread: ${message.thread_id}):\n\n${message.answer}`
        : 'AskFred did not return an answer.',
    };
  })
  .build();
