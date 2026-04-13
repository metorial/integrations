import { SlateTool } from 'slates';
import { MailchimpClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageAutomationTool = SlateTool.create(spec, {
  name: 'Manage Automation',
  key: 'manage_automation',
  description: `Control a classic automation workflow: start, pause, or archive it. Can also add or remove subscribers from the automation queue.`,
  instructions: [
    'Use "start" to activate all emails in the workflow.',
    'Use "pause" to pause all emails in the workflow.',
    'Use "archive" to permanently end the workflow.',
    'Use "add_subscriber" to add a subscriber to a specific email queue (requires emailId).',
    'Use "remove_subscriber" to remove a subscriber from the entire workflow.'
  ],
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      workflowId: z.string().describe('Automation workflow ID'),
      action: z
        .enum(['start', 'pause', 'archive', 'add_subscriber', 'remove_subscriber'])
        .describe('Action to perform'),
      emailAddress: z
        .string()
        .optional()
        .describe('Subscriber email (required for add/remove subscriber)'),
      emailId: z
        .string()
        .optional()
        .describe('Automation email ID (required for add_subscriber)')
    })
  )
  .output(
    z.object({
      workflowId: z.string(),
      action: z.string(),
      success: z.boolean()
    })
  )
  .handleInvocation(async ctx => {
    let client = new MailchimpClient({
      token: ctx.auth.token,
      serverPrefix: ctx.auth.serverPrefix
    });

    let { workflowId, action } = ctx.input;

    switch (action) {
      case 'start':
        await client.startAutomation(workflowId);
        return {
          output: { workflowId, action, success: true },
          message: `Automation **${workflowId}** has been started.`
        };
      case 'pause':
        await client.pauseAutomation(workflowId);
        return {
          output: { workflowId, action, success: true },
          message: `Automation **${workflowId}** has been paused.`
        };
      case 'archive':
        await client.archiveAutomation(workflowId);
        return {
          output: { workflowId, action, success: true },
          message: `Automation **${workflowId}** has been archived.`
        };
      case 'add_subscriber':
        await client.addSubscriberToAutomationQueue(
          workflowId,
          ctx.input.emailId!,
          ctx.input.emailAddress!
        );
        return {
          output: { workflowId, action, success: true },
          message: `Subscriber **${ctx.input.emailAddress}** added to automation email queue.`
        };
      case 'remove_subscriber':
        await client.removeSubscriberFromAutomation(workflowId, ctx.input.emailAddress!);
        return {
          output: { workflowId, action, success: true },
          message: `Subscriber **${ctx.input.emailAddress}** removed from automation **${workflowId}**.`
        };
    }
  })
  .build();
