import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getConversation = SlateTool.create(
  spec,
  {
    name: 'Get Conversation',
    key: 'get_conversation',
    description: `Retrieve a single conversation with full details including the source message and all conversation parts (replies, notes, assignments, etc.). Limited to 500 parts.`,
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({
    conversationId: z.string().describe('Intercom conversation ID')
  }))
  .output(z.object({
    conversationId: z.string().describe('Conversation ID'),
    state: z.string().optional().describe('Conversation state (open, closed, snoozed)'),
    title: z.string().optional().describe('Conversation title'),
    open: z.boolean().optional().describe('Whether conversation is open'),
    read: z.boolean().optional().describe('Whether conversation has been read'),
    priority: z.string().optional().describe('Conversation priority'),
    waitingSince: z.string().optional().describe('Timestamp of when customer started waiting'),
    snoozedUntil: z.string().optional().describe('Snoozed until timestamp'),
    createdAt: z.string().optional().describe('Creation timestamp'),
    updatedAt: z.string().optional().describe('Last update timestamp'),
    sourceType: z.string().optional().describe('Source message type'),
    sourceAuthorType: z.string().optional().describe('Source author type'),
    sourceAuthorId: z.string().optional().describe('Source author ID'),
    sourceAuthorName: z.string().optional().describe('Source author name'),
    sourceAuthorEmail: z.string().optional().describe('Source author email'),
    sourceBody: z.string().optional().describe('Source message body'),
    sourceSubject: z.string().optional().describe('Source message subject'),
    sourceUrl: z.string().optional().describe('Source URL'),
    assigneeId: z.string().optional().describe('Current assignee ID'),
    assigneeType: z.string().optional().describe('Current assignee type'),
    contacts: z.array(z.object({
      contactId: z.string().describe('Contact ID'),
      type: z.string().optional().describe('Contact type')
    })).optional().describe('Contacts involved in the conversation'),
    teammates: z.array(z.object({
      adminId: z.string().describe('Admin ID'),
      type: z.string().optional().describe('Admin type')
    })).optional().describe('Teammates involved'),
    tags: z.array(z.object({
      tagId: z.string().describe('Tag ID'),
      name: z.string().optional().describe('Tag name')
    })).optional().describe('Applied tags'),
    conversationParts: z.array(z.object({
      partId: z.string().describe('Part ID'),
      partType: z.string().optional().describe('Part type'),
      body: z.string().optional().describe('Part body'),
      authorType: z.string().optional().describe('Author type'),
      authorId: z.string().optional().describe('Author ID'),
      authorName: z.string().optional().describe('Author name'),
      createdAt: z.string().optional().describe('Creation timestamp')
    })).optional().describe('Conversation parts (replies, notes, etc.)'),
    aiAgentParticipated: z.boolean().optional().describe('Whether AI agent participated')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token, region: ctx.config.region });
    let result = await client.getConversation(ctx.input.conversationId);

    let parts = (result.conversation_parts?.conversation_parts || []).map((p: any) => ({
      partId: String(p.id),
      partType: p.part_type,
      body: p.body,
      authorType: p.author?.type,
      authorId: p.author?.id ? String(p.author.id) : undefined,
      authorName: p.author?.name,
      createdAt: p.created_at ? String(p.created_at) : undefined
    }));

    return {
      output: {
        conversationId: result.id,
        state: result.state,
        title: result.title,
        open: result.open,
        read: result.read,
        priority: result.priority,
        waitingSince: result.waiting_since ? String(result.waiting_since) : undefined,
        snoozedUntil: result.snoozed_until ? String(result.snoozed_until) : undefined,
        createdAt: result.created_at ? String(result.created_at) : undefined,
        updatedAt: result.updated_at ? String(result.updated_at) : undefined,
        sourceType: result.source?.type,
        sourceAuthorType: result.source?.author?.type,
        sourceAuthorId: result.source?.author?.id ? String(result.source.author.id) : undefined,
        sourceAuthorName: result.source?.author?.name,
        sourceAuthorEmail: result.source?.author?.email,
        sourceBody: result.source?.body,
        sourceSubject: result.source?.subject,
        sourceUrl: result.source?.url,
        assigneeId: result.assignee?.id ? String(result.assignee.id) : undefined,
        assigneeType: result.assignee?.type,
        contacts: (result.contacts?.contacts || []).map((c: any) => ({
          contactId: c.id,
          type: c.type
        })),
        teammates: (result.teammates?.admins || []).map((a: any) => ({
          adminId: String(a.id),
          type: a.type
        })),
        tags: (result.tags?.tags || []).map((t: any) => ({
          tagId: t.id,
          name: t.name
        })),
        conversationParts: parts,
        aiAgentParticipated: result.ai_agent_participated
      },
      message: `Retrieved conversation **${result.id}** (${result.state}, ${parts.length} parts)`
    };
  }).build();
