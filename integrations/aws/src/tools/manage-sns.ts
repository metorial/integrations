import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { clientFromContext, flattenParams } from '../lib/helpers';
import { extractXmlValue, extractXmlValues, extractXmlBlocks } from '../lib/xml';

let SNS_VERSION = '2010-03-31';
let SNS_SERVICE = 'sns';

let topicSchema = z.object({
  topicArn: z.string().describe('ARN of the SNS topic')
});

let subscriptionSchema = z.object({
  subscriptionArn: z.string().describe('ARN of the subscription'),
  topicArn: z.string().describe('ARN of the topic the subscription belongs to'),
  protocol: z.string().describe('Delivery protocol (email, sqs, lambda, http, https, etc.)'),
  endpoint: z.string().describe('Endpoint receiving notifications'),
  owner: z.string().describe('AWS account ID of the subscription owner')
});

export let manageSnsTool = SlateTool.create(spec, {
  name: 'Manage SNS',
  key: 'manage_sns',
  description: `Manage AWS SNS (Simple Notification Service) topics and subscriptions. Supports listing topics, creating and deleting topics, publishing messages, listing subscriptions for a topic, subscribing endpoints (email, SQS, Lambda, HTTP/HTTPS), and unsubscribing. Set the **operation** field to choose the action.`,
  instructions: [
    'Set "operation" to one of: "list_topics", "create_topic", "delete_topic", "publish", "list_subscriptions", "subscribe", or "unsubscribe".',
    'For "list_topics": optionally provide "nextToken" for pagination.',
    'For "create_topic": provide "name" and optionally "tags".',
    'For "delete_topic": provide "topicArn". This also removes all subscriptions.',
    'For "publish": provide "topicArn" and "message". Optionally provide "subject" for email subscribers.',
    'For "list_subscriptions": provide "topicArn" and optionally "nextToken".',
    'For "subscribe": provide "topicArn", "protocol", and "endpoint". HTTP/S and email subscriptions require confirmation by the endpoint owner.',
    'For "unsubscribe": provide "subscriptionArn".'
  ]
})
  .input(
    z.object({
      operation: z
        .enum([
          'list_topics',
          'create_topic',
          'delete_topic',
          'publish',
          'list_subscriptions',
          'subscribe',
          'unsubscribe'
        ])
        .describe('The SNS operation to perform'),

      // Common
      topicArn: z
        .string()
        .optional()
        .describe(
          'ARN of the SNS topic (required for delete_topic, publish, list_subscriptions, subscribe)'
        ),

      // list_topics
      nextToken: z
        .string()
        .optional()
        .describe(
          'Pagination token from a previous request (for list_topics and list_subscriptions)'
        ),

      // create_topic
      name: z
        .string()
        .optional()
        .describe(
          'Name for the new topic (required for create_topic). FIFO topic names must end with .fifo'
        ),
      tags: z
        .array(
          z.object({
            key: z.string().describe('Tag key'),
            value: z.string().describe('Tag value')
          })
        )
        .optional()
        .describe('Tags to attach to the topic (for create_topic)'),

      // publish
      message: z
        .string()
        .optional()
        .describe('Message body to publish (required for publish). Max 256 KB'),
      subject: z
        .string()
        .optional()
        .describe('Subject line for email subscribers (for publish, max 100 characters)'),

      // subscribe
      protocol: z
        .enum([
          'email',
          'email-json',
          'sqs',
          'lambda',
          'http',
          'https',
          'sms',
          'application',
          'firehose'
        ])
        .optional()
        .describe('Delivery protocol for the subscription (required for subscribe)'),
      endpoint: z
        .string()
        .optional()
        .describe(
          'Endpoint to receive notifications: email address, SQS ARN, Lambda ARN, HTTP/S URL, phone number, etc. (required for subscribe)'
        ),

      // unsubscribe
      subscriptionArn: z
        .string()
        .optional()
        .describe('ARN of the subscription to remove (required for unsubscribe)')
    })
  )
  .output(
    z.object({
      operation: z.string().describe('The operation that was performed'),

      // list_topics
      topics: z.array(topicSchema).optional().describe('List of SNS topics (for list_topics)'),
      nextToken: z
        .string()
        .optional()
        .describe('Pagination token for the next page of results'),

      // create_topic
      topicArn: z.string().optional().describe('ARN of the created or affected topic'),

      // delete_topic
      deleted: z
        .boolean()
        .optional()
        .describe('Whether the topic was successfully deleted (for delete_topic)'),

      // publish
      messageId: z
        .string()
        .optional()
        .describe('Unique identifier of the published message (for publish)'),

      // list_subscriptions
      subscriptions: z
        .array(subscriptionSchema)
        .optional()
        .describe('List of subscriptions (for list_subscriptions)'),

      // subscribe
      subscriptionArn: z
        .string()
        .optional()
        .describe(
          'ARN of the subscription, or "pending confirmation" if confirmation is required (for subscribe)'
        ),

      // unsubscribe
      unsubscribed: z
        .boolean()
        .optional()
        .describe('Whether the unsubscription was successful (for unsubscribe)')
    })
  )
  .handleInvocation(async ctx => {
    let client = clientFromContext(ctx);
    let { operation } = ctx.input;

    // ── List Topics ──────────────────────────────────────────────────
    if (operation === 'list_topics') {
      let params: Record<string, string> = {};
      if (ctx.input.nextToken) params['NextToken'] = ctx.input.nextToken;

      let response = await client.queryApi({
        service: SNS_SERVICE,
        action: 'ListTopics',
        params,
        version: SNS_VERSION
      });

      let xml = typeof response === 'string' ? response : String(response);
      let memberBlocks = extractXmlBlocks(xml, 'member');
      let topics = memberBlocks
        .map(block => {
          let arn = extractXmlValue(block, 'TopicArn');
          return arn ? { topicArn: arn } : null;
        })
        .filter((t): t is { topicArn: string } => t !== null);

      let nextToken = extractXmlValue(xml, 'NextToken');

      return {
        output: {
          operation: 'list_topics',
          topics,
          nextToken
        },
        message: `Found **${topics.length}** SNS topic(s)${nextToken ? ' (more available)' : ''}.`
      };
    }

    // ── Create Topic ─────────────────────────────────────────────────
    if (operation === 'create_topic') {
      if (!ctx.input.name) throw new Error('"name" is required for create_topic.');

      let params: Record<string, string> = {
        Name: ctx.input.name
      };

      if (ctx.input.tags && ctx.input.tags.length > 0) {
        let tagParams = flattenParams(
          'Tags.member',
          ctx.input.tags.map(t => ({
            Key: t.key,
            Value: t.value
          }))
        );
        Object.assign(params, tagParams);
      }

      let response = await client.postQueryApi({
        service: SNS_SERVICE,
        action: 'CreateTopic',
        params,
        version: SNS_VERSION
      });

      let xml = typeof response === 'string' ? response : String(response);
      let topicArn = extractXmlValue(xml, 'TopicArn') ?? '';

      return {
        output: {
          operation: 'create_topic',
          topicArn
        },
        message: `Created topic **${ctx.input.name}** with ARN \`${topicArn}\`.`
      };
    }

    // ── Delete Topic ─────────────────────────────────────────────────
    if (operation === 'delete_topic') {
      if (!ctx.input.topicArn) throw new Error('"topicArn" is required for delete_topic.');

      await client.postQueryApi({
        service: SNS_SERVICE,
        action: 'DeleteTopic',
        params: { TopicArn: ctx.input.topicArn },
        version: SNS_VERSION
      });

      return {
        output: {
          operation: 'delete_topic',
          topicArn: ctx.input.topicArn,
          deleted: true
        },
        message: `Deleted topic \`${ctx.input.topicArn}\` and all its subscriptions.`
      };
    }

    // ── Publish Message ──────────────────────────────────────────────
    if (operation === 'publish') {
      if (!ctx.input.topicArn) throw new Error('"topicArn" is required for publish.');
      if (!ctx.input.message) throw new Error('"message" is required for publish.');

      let params: Record<string, string> = {
        TopicArn: ctx.input.topicArn,
        Message: ctx.input.message
      };

      if (ctx.input.subject) params['Subject'] = ctx.input.subject;

      let response = await client.postQueryApi({
        service: SNS_SERVICE,
        action: 'Publish',
        params,
        version: SNS_VERSION
      });

      let xml = typeof response === 'string' ? response : String(response);
      let messageId = extractXmlValue(xml, 'MessageId') ?? '';

      return {
        output: {
          operation: 'publish',
          messageId,
          topicArn: ctx.input.topicArn
        },
        message: `Published message \`${messageId}\` to topic \`${ctx.input.topicArn}\`.`
      };
    }

    // ── List Subscriptions ───────────────────────────────────────────
    if (operation === 'list_subscriptions') {
      if (!ctx.input.topicArn)
        throw new Error('"topicArn" is required for list_subscriptions.');

      let params: Record<string, string> = {
        TopicArn: ctx.input.topicArn
      };
      if (ctx.input.nextToken) params['NextToken'] = ctx.input.nextToken;

      let response = await client.queryApi({
        service: SNS_SERVICE,
        action: 'ListSubscriptionsByTopic',
        params,
        version: SNS_VERSION
      });

      let xml = typeof response === 'string' ? response : String(response);
      let memberBlocks = extractXmlBlocks(xml, 'member');
      let subscriptions = memberBlocks
        .map(block => {
          let subArn = extractXmlValue(block, 'SubscriptionArn');
          let topicArn = extractXmlValue(block, 'TopicArn');
          let protocol = extractXmlValue(block, 'Protocol');
          let endpoint = extractXmlValue(block, 'Endpoint');
          let owner = extractXmlValue(block, 'Owner');
          return subArn && topicArn && protocol && endpoint && owner
            ? { subscriptionArn: subArn, topicArn, protocol, endpoint, owner }
            : null;
        })
        .filter(
          (
            s
          ): s is {
            subscriptionArn: string;
            topicArn: string;
            protocol: string;
            endpoint: string;
            owner: string;
          } => s !== null
        );

      let nextToken = extractXmlValue(xml, 'NextToken');

      return {
        output: {
          operation: 'list_subscriptions',
          subscriptions,
          nextToken
        },
        message: `Found **${subscriptions.length}** subscription(s) for topic \`${ctx.input.topicArn}\`${nextToken ? ' (more available)' : ''}.`
      };
    }

    // ── Subscribe ────────────────────────────────────────────────────
    if (operation === 'subscribe') {
      if (!ctx.input.topicArn) throw new Error('"topicArn" is required for subscribe.');
      if (!ctx.input.protocol) throw new Error('"protocol" is required for subscribe.');
      if (!ctx.input.endpoint) throw new Error('"endpoint" is required for subscribe.');

      let params: Record<string, string> = {
        TopicArn: ctx.input.topicArn,
        Protocol: ctx.input.protocol,
        Endpoint: ctx.input.endpoint
      };

      let response = await client.postQueryApi({
        service: SNS_SERVICE,
        action: 'Subscribe',
        params,
        version: SNS_VERSION
      });

      let xml = typeof response === 'string' ? response : String(response);
      let subscriptionArn = extractXmlValue(xml, 'SubscriptionArn') ?? 'pending confirmation';

      let isPending =
        subscriptionArn === 'pending confirmation' ||
        subscriptionArn === 'PendingConfirmation';

      return {
        output: {
          operation: 'subscribe',
          subscriptionArn,
          topicArn: ctx.input.topicArn
        },
        message: isPending
          ? `Subscription to \`${ctx.input.topicArn}\` via **${ctx.input.protocol}** is pending confirmation at \`${ctx.input.endpoint}\`.`
          : `Subscribed \`${ctx.input.endpoint}\` to \`${ctx.input.topicArn}\` via **${ctx.input.protocol}** -- ARN: \`${subscriptionArn}\`.`
      };
    }

    // ── Unsubscribe ──────────────────────────────────────────────────
    if (operation === 'unsubscribe') {
      if (!ctx.input.subscriptionArn)
        throw new Error('"subscriptionArn" is required for unsubscribe.');

      await client.postQueryApi({
        service: SNS_SERVICE,
        action: 'Unsubscribe',
        params: { SubscriptionArn: ctx.input.subscriptionArn },
        version: SNS_VERSION
      });

      return {
        output: {
          operation: 'unsubscribe',
          unsubscribed: true
        },
        message: `Unsubscribed \`${ctx.input.subscriptionArn}\`.`
      };
    }

    throw new Error(
      `Unknown operation: "${operation}". Expected one of: list_topics, create_topic, delete_topic, publish, list_subscriptions, subscribe, unsubscribe.`
    );
  })
  .build();
