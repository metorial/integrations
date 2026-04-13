import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageSubscriptions = SlateTool.create(
  spec,
  {
    name: 'Manage Subscriptions',
    key: 'manage_subscriptions',
    description: `List, create, or delete YouTube channel subscriptions. List subscriptions for the authenticated user or a specific channel. Subscribe to or unsubscribe from channels.`,
    instructions: [
      'For listing: set action to "list" with optional channelId or mine=true.',
      'For subscribing: set action to "subscribe" with targetChannelId.',
      'For unsubscribing: set action to "unsubscribe" with subscriptionId.'
    ]
  }
)
  .input(z.object({
    action: z.enum(['list', 'subscribe', 'unsubscribe']).describe('Action to perform'),
    channelId: z.string().optional().describe('Channel ID to list subscriptions for'),
    mine: z.boolean().optional().describe('List the authenticated user\'s subscriptions'),
    targetChannelId: z.string().optional().describe('Channel ID to subscribe to'),
    subscriptionId: z.string().optional().describe('Subscription ID to delete'),
    forChannelId: z.string().optional().describe('Check if subscribed to specific channel(s), comma-separated'),
    maxResults: z.number().min(1).max(50).optional().describe('Maximum number of results'),
    pageToken: z.string().optional().describe('Pagination token'),
    order: z.enum(['alphabetical', 'relevance', 'unread']).optional().describe('Sort order for list')
  }))
  .output(z.object({
    subscriptions: z.array(z.object({
      subscriptionId: z.string(),
      channelId: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      publishedAt: z.string().optional(),
      totalItemCount: z.number().optional(),
      newItemCount: z.number().optional()
    })).optional(),
    nextPageToken: z.string().optional(),
    totalResults: z.number().optional(),
    subscribed: z.boolean().optional(),
    unsubscribed: z.boolean().optional()
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    if (ctx.input.action === 'list') {
      let response = await client.listSubscriptions({
        part: ['snippet', 'contentDetails'],
        mine: ctx.input.mine,
        channelId: ctx.input.channelId,
        forChannelId: ctx.input.forChannelId,
        maxResults: ctx.input.maxResults,
        pageToken: ctx.input.pageToken,
        order: ctx.input.order
      });

      let subscriptions = response.items.map((sub) => ({
        subscriptionId: sub.id,
        channelId: sub.snippet?.resourceId?.channelId,
        title: sub.snippet?.title,
        description: sub.snippet?.description,
        publishedAt: sub.snippet?.publishedAt,
        totalItemCount: sub.contentDetails?.totalItemCount,
        newItemCount: sub.contentDetails?.newItemCount
      }));

      return {
        output: {
          subscriptions,
          nextPageToken: response.nextPageToken,
          totalResults: response.pageInfo?.totalResults
        },
        message: `Retrieved **${subscriptions.length}** subscription(s).${response.nextPageToken ? ' More pages available.' : ''}`
      };
    } else if (ctx.input.action === 'subscribe') {
      if (!ctx.input.targetChannelId) throw new Error('targetChannelId is required for subscribing');

      let sub = await client.createSubscription({
        part: ['snippet'],
        channelId: ctx.input.targetChannelId
      });

      return {
        output: {
          subscribed: true,
          subscriptions: [{
            subscriptionId: sub.id,
            channelId: ctx.input.targetChannelId,
            title: sub.snippet?.title
          }]
        },
        message: `Subscribed to channel "${sub.snippet?.title || ctx.input.targetChannelId}".`
      };
    } else {
      if (!ctx.input.subscriptionId) throw new Error('subscriptionId is required for unsubscribing');

      await client.deleteSubscription(ctx.input.subscriptionId);

      return {
        output: { unsubscribed: true },
        message: `Unsubscribed (subscription \`${ctx.input.subscriptionId}\` removed).`
      };
    }
  }).build();
