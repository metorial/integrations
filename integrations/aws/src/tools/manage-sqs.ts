import { SlateTool } from 'slates';
import { spec } from '../spec';
import { z } from 'zod';
import { clientFromContext, flattenList } from '../lib/helpers';
import { extractXmlValue, extractXmlValues, extractXmlBlocks } from '../lib/xml';

let SQS_VERSION = '2012-11-05';
let SQS_SERVICE = 'sqs';

let queueSchema = z.object({
  queueUrl: z.string().describe('Full URL of the SQS queue')
});

let messageSchema = z.object({
  messageId: z.string().describe('Unique message identifier'),
  receiptHandle: z
    .string()
    .describe('Handle needed to delete or change visibility of the message'),
  body: z.string().describe('Message body content'),
  md5OfBody: z.string().describe('MD5 digest of the message body for integrity verification'),
  attributes: z
    .record(z.string(), z.string())
    .optional()
    .describe('System attributes such as SenderId, SentTimestamp, ApproximateReceiveCount')
});

let queueAttributeSchema = z
  .record(z.string(), z.string())
  .describe('Queue attributes as key-value pairs');

let outputSchema = z.object({
  operation: z.string().describe('The operation that was performed'),
  queueUrls: z.array(z.string()).optional().describe('List of queue URLs (for list_queues)'),
  queueUrl: z
    .string()
    .optional()
    .describe('Queue URL (for create_queue and other operations)'),
  messages: z
    .array(messageSchema)
    .optional()
    .describe('Received messages (for receive_messages)'),
  messageId: z.string().optional().describe('ID of the sent message (for send_message)'),
  md5OfMessageBody: z
    .string()
    .optional()
    .describe('MD5 digest of the sent message body (for send_message)'),
  attributes: queueAttributeSchema
    .optional()
    .describe('Queue attributes (for get_queue_attributes)'),
  nextToken: z
    .string()
    .optional()
    .describe('Pagination token for the next page of results (for list_queues)'),
  success: z.boolean().optional().describe('Whether the operation completed successfully')
});

export let manageSqsTool = SlateTool.create(spec, {
  name: 'Manage SQS',
  key: 'manage_sqs',
  description: `Manage Amazon SQS (Simple Queue Service) queues and messages. Supports listing queues, creating and deleting queues, sending and receiving messages, deleting messages, retrieving queue attributes, and purging all messages from a queue.`,
  instructions: [
    'Use operation "list_queues" to list SQS queues. Optionally filter by "queueNamePrefix" and use "maxResults" for pagination.',
    'Use operation "create_queue" to create a new queue. Provide "queueName" and optionally "attributes" for configuration such as VisibilityTimeout, DelaySeconds, and MaximumMessageSize.',
    'Use operation "delete_queue" to permanently delete a queue and all its messages. Provide "queueUrl".',
    'Use operation "send_message" to send a message to a queue. Provide "queueUrl" and "messageBody". Optionally set "delaySeconds".',
    'Use operation "receive_messages" to receive messages from a queue. Provide "queueUrl" and optionally "maxNumberOfMessages", "waitTimeSeconds", and "visibilityTimeout".',
    'Use operation "delete_message" to delete a processed message. Provide "queueUrl" and "receiptHandle" from the receive response.',
    'Use operation "get_queue_attributes" to retrieve queue configuration and statistics. Provide "queueUrl" and optionally "attributeNames".',
    'Use operation "purge_queue" to delete all messages from a queue. Provide "queueUrl". This cannot be undone.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      operation: z
        .enum([
          'list_queues',
          'create_queue',
          'delete_queue',
          'send_message',
          'receive_messages',
          'delete_message',
          'get_queue_attributes',
          'purge_queue'
        ])
        .describe('The SQS operation to perform'),
      queueUrl: z
        .string()
        .optional()
        .describe(
          'Full URL of the SQS queue (required for all operations except list_queues and create_queue)'
        ),
      queueName: z
        .string()
        .optional()
        .describe(
          'Name of the queue to create (required for create_queue). FIFO queue names must end with ".fifo". Max 80 characters.'
        ),
      queueNamePrefix: z
        .string()
        .optional()
        .describe('Filter queues by name prefix (for list_queues)'),
      maxResults: z
        .number()
        .optional()
        .describe('Maximum number of queue URLs to return, 1-1000 (for list_queues)'),
      nextToken: z
        .string()
        .optional()
        .describe('Pagination token from a previous list_queues response'),
      messageBody: z
        .string()
        .optional()
        .describe('The message content to send, max 256 KB (required for send_message)'),
      delaySeconds: z
        .number()
        .optional()
        .describe(
          'Delay in seconds before the message becomes visible, 0-900 (for send_message and create_queue attributes)'
        ),
      maxNumberOfMessages: z
        .number()
        .optional()
        .describe(
          'Maximum number of messages to receive, 1-10 (for receive_messages). Default: 1'
        ),
      waitTimeSeconds: z
        .number()
        .optional()
        .describe(
          'Long poll wait time in seconds, 0-20 (for receive_messages). 0 = short polling'
        ),
      visibilityTimeout: z
        .number()
        .optional()
        .describe(
          'Duration in seconds that received messages are hidden, 0-43200 (for receive_messages)'
        ),
      receiptHandle: z
        .string()
        .optional()
        .describe('Receipt handle of the message to delete (required for delete_message)'),
      attributeNames: z
        .array(z.string())
        .optional()
        .describe(
          'Attribute names to retrieve, e.g. ["All"], ["ApproximateNumberOfMessages", "QueueArn"] (for get_queue_attributes)'
        ),
      attributes: z
        .record(z.string(), z.string())
        .optional()
        .describe(
          'Queue attributes for create_queue, e.g. { "VisibilityTimeout": "60", "DelaySeconds": "5", "MaximumMessageSize": "131072" }'
        )
    })
  )
  .output(outputSchema)
  .handleInvocation(async ctx => {
    let client = clientFromContext(ctx);
    let { operation } = ctx.input;

    // ── List Queues ──────────────────────────────────────────────────
    if (operation === 'list_queues') {
      let params: Record<string, string> = {};
      if (ctx.input.queueNamePrefix) params['QueueNamePrefix'] = ctx.input.queueNamePrefix;
      if (ctx.input.maxResults !== undefined)
        params['MaxResults'] = String(ctx.input.maxResults);
      if (ctx.input.nextToken) params['NextToken'] = ctx.input.nextToken;

      let response = await client.queryApi({
        service: SQS_SERVICE,
        action: 'ListQueues',
        version: SQS_VERSION,
        params
      });

      let xml = typeof response === 'string' ? response : String(response);
      let queueUrls = extractXmlValues(xml, 'QueueUrl');
      let nextToken = extractXmlValue(xml, 'NextToken');

      let prefixLabel = ctx.input.queueNamePrefix
        ? ` matching prefix "${ctx.input.queueNamePrefix}"`
        : '';
      let paginationLabel = nextToken ? ' (more results available)' : '';

      return {
        output: {
          operation: 'list_queues',
          queueUrls,
          nextToken
        },
        message:
          queueUrls.length === 0
            ? `No queues found${prefixLabel}.`
            : `Found **${queueUrls.length}** queue(s)${prefixLabel}${paginationLabel}.`
      };
    }

    // ── Create Queue ─────────────────────────────────────────────────
    if (operation === 'create_queue') {
      if (!ctx.input.queueName) throw new Error('queueName is required for create_queue');

      let params: Record<string, string> = {
        QueueName: ctx.input.queueName
      };

      // Flatten attributes into Attribute.N.Name / Attribute.N.Value format
      if (ctx.input.attributes) {
        let attrEntries = Object.entries(ctx.input.attributes);
        attrEntries.forEach(([name, value], index) => {
          params[`Attribute.${index + 1}.Name`] = name;
          params[`Attribute.${index + 1}.Value`] = value;
        });
      }

      let response = await client.postQueryApi({
        service: SQS_SERVICE,
        action: 'CreateQueue',
        version: SQS_VERSION,
        params
      });

      let xml = typeof response === 'string' ? response : String(response);
      let queueUrl = extractXmlValue(xml, 'QueueUrl') ?? '';

      return {
        output: {
          operation: 'create_queue',
          queueUrl
        },
        message: `Created queue **${ctx.input.queueName}** at \`${queueUrl}\`.`
      };
    }

    // ── Delete Queue ─────────────────────────────────────────────────
    if (operation === 'delete_queue') {
      if (!ctx.input.queueUrl) throw new Error('queueUrl is required for delete_queue');

      await client.postQueryApi({
        service: SQS_SERVICE,
        action: 'DeleteQueue',
        version: SQS_VERSION,
        params: {
          QueueUrl: ctx.input.queueUrl
        }
      });

      return {
        output: {
          operation: 'delete_queue',
          queueUrl: ctx.input.queueUrl,
          success: true
        },
        message: `Deleted queue \`${ctx.input.queueUrl}\`. The queue will be fully removed within 60 seconds.`
      };
    }

    // ── Send Message ─────────────────────────────────────────────────
    if (operation === 'send_message') {
      if (!ctx.input.queueUrl) throw new Error('queueUrl is required for send_message');
      if (!ctx.input.messageBody) throw new Error('messageBody is required for send_message');

      let params: Record<string, string> = {
        QueueUrl: ctx.input.queueUrl,
        MessageBody: ctx.input.messageBody
      };

      if (ctx.input.delaySeconds !== undefined) {
        params['DelaySeconds'] = String(ctx.input.delaySeconds);
      }

      let response = await client.postQueryApi({
        service: SQS_SERVICE,
        action: 'SendMessage',
        version: SQS_VERSION,
        params
      });

      let xml = typeof response === 'string' ? response : String(response);
      let messageId = extractXmlValue(xml, 'MessageId') ?? '';
      let md5OfMessageBody = extractXmlValue(xml, 'MD5OfMessageBody') ?? '';

      return {
        output: {
          operation: 'send_message',
          queueUrl: ctx.input.queueUrl,
          messageId,
          md5OfMessageBody
        },
        message: `Sent message **${messageId}** to queue.`
      };
    }

    // ── Receive Messages ─────────────────────────────────────────────
    if (operation === 'receive_messages') {
      if (!ctx.input.queueUrl) throw new Error('queueUrl is required for receive_messages');

      let params: Record<string, string> = {
        QueueUrl: ctx.input.queueUrl
      };

      if (ctx.input.maxNumberOfMessages !== undefined) {
        params['MaxNumberOfMessages'] = String(ctx.input.maxNumberOfMessages);
      }
      if (ctx.input.waitTimeSeconds !== undefined) {
        params['WaitTimeSeconds'] = String(ctx.input.waitTimeSeconds);
      }
      if (ctx.input.visibilityTimeout !== undefined) {
        params['VisibilityTimeout'] = String(ctx.input.visibilityTimeout);
      }

      // Request all system attributes by default for richer output
      params['AttributeName.1'] = 'All';

      let response = await client.queryApi({
        service: SQS_SERVICE,
        action: 'ReceiveMessage',
        version: SQS_VERSION,
        params
      });

      let xml = typeof response === 'string' ? response : String(response);
      let messageBlocks = extractXmlBlocks(xml, 'Message');

      let messages = messageBlocks.map(block => {
        let messageId = extractXmlValue(block, 'MessageId') ?? '';
        let receiptHandle = extractXmlValue(block, 'ReceiptHandle') ?? '';
        let body = extractXmlValue(block, 'Body') ?? '';
        let md5OfBody = extractXmlValue(block, 'MD5OfBody') ?? '';

        // Parse system attributes
        let attrBlocks = extractXmlBlocks(block, 'Attribute');
        let attributes: Record<string, string> = {};
        attrBlocks.forEach(attrBlock => {
          let name = extractXmlValue(attrBlock, 'Name');
          let value = extractXmlValue(attrBlock, 'Value');
          if (name && value) {
            attributes[name] = value;
          }
        });

        return {
          messageId,
          receiptHandle,
          body,
          md5OfBody,
          attributes: Object.keys(attributes).length > 0 ? attributes : undefined
        };
      });

      return {
        output: {
          operation: 'receive_messages',
          queueUrl: ctx.input.queueUrl,
          messages
        },
        message:
          messages.length === 0
            ? 'No messages available in the queue.'
            : `Received **${messages.length}** message(s).`
      };
    }

    // ── Delete Message ───────────────────────────────────────────────
    if (operation === 'delete_message') {
      if (!ctx.input.queueUrl) throw new Error('queueUrl is required for delete_message');
      if (!ctx.input.receiptHandle)
        throw new Error('receiptHandle is required for delete_message');

      await client.postQueryApi({
        service: SQS_SERVICE,
        action: 'DeleteMessage',
        version: SQS_VERSION,
        params: {
          QueueUrl: ctx.input.queueUrl,
          ReceiptHandle: ctx.input.receiptHandle
        }
      });

      return {
        output: {
          operation: 'delete_message',
          queueUrl: ctx.input.queueUrl,
          success: true
        },
        message: 'Message deleted successfully.'
      };
    }

    // ── Get Queue Attributes ─────────────────────────────────────────
    if (operation === 'get_queue_attributes') {
      if (!ctx.input.queueUrl)
        throw new Error('queueUrl is required for get_queue_attributes');

      let attrNames = ctx.input.attributeNames ?? ['All'];
      let params: Record<string, string> = {
        QueueUrl: ctx.input.queueUrl,
        ...flattenList('AttributeName', attrNames)
      };

      let response = await client.queryApi({
        service: SQS_SERVICE,
        action: 'GetQueueAttributes',
        version: SQS_VERSION,
        params
      });

      let xml = typeof response === 'string' ? response : String(response);
      let attrBlocks = extractXmlBlocks(xml, 'Attribute');
      let attributes: Record<string, string> = {};

      attrBlocks.forEach(block => {
        let name = extractXmlValue(block, 'Name');
        let value = extractXmlValue(block, 'Value');
        if (name && value !== undefined) {
          attributes[name] = value;
        }
      });

      let attrCount = Object.keys(attributes).length;

      return {
        output: {
          operation: 'get_queue_attributes',
          queueUrl: ctx.input.queueUrl,
          attributes
        },
        message: `Retrieved **${attrCount}** attribute(s) for queue.`
      };
    }

    // ── Purge Queue ──────────────────────────────────────────────────
    if (operation === 'purge_queue') {
      if (!ctx.input.queueUrl) throw new Error('queueUrl is required for purge_queue');

      await client.postQueryApi({
        service: SQS_SERVICE,
        action: 'PurgeQueue',
        version: SQS_VERSION,
        params: {
          QueueUrl: ctx.input.queueUrl
        }
      });

      return {
        output: {
          operation: 'purge_queue',
          queueUrl: ctx.input.queueUrl,
          success: true
        },
        message: 'Purge initiated. All messages will be deleted within 60 seconds.'
      };
    }

    throw new Error(`Unknown operation: ${operation}`);
  })
  .build();
