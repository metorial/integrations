import { SlateTool } from 'slates';
import { PayPalClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageSubscription = SlateTool.create(
  spec,
  {
    name: 'Manage Subscription',
    key: 'manage_subscription',
    description: `Manage an existing PayPal subscription. Retrieve details, suspend, cancel, reactivate, or list transactions for a subscription.`,
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    action: z.enum(['get', 'suspend', 'cancel', 'activate', 'listTransactions']).describe('Action to perform'),
    subscriptionId: z.string().describe('PayPal subscription ID'),
    reason: z.string().optional().describe('Reason for suspend/cancel/activate actions'),
    startTime: z.string().optional().describe('Start time for transaction listing (ISO 8601)'),
    endTime: z.string().optional().describe('End time for transaction listing (ISO 8601)'),
  }))
  .output(z.object({
    subscriptionId: z.string().describe('Subscription ID'),
    status: z.string().optional().describe('Subscription status'),
    planId: z.string().optional().describe('Associated plan ID'),
    subscriberEmail: z.string().optional().describe('Subscriber email'),
    startTime: z.string().optional().describe('Subscription start time'),
    nextBillingTime: z.string().optional().describe('Next billing date'),
    transactions: z.array(z.any()).optional().describe('Subscription transactions'),
    subscription: z.any().optional().describe('Full subscription details'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new PayPalClient({
      token: ctx.auth.token,
      clientId: ctx.auth.clientId,
      clientSecret: ctx.auth.clientSecret,
      environment: ctx.auth.environment,
    });

    switch (ctx.input.action) {
      case 'get': {
        let sub = await client.getSubscription(ctx.input.subscriptionId);
        return {
          output: {
            subscriptionId: sub.id,
            status: sub.status,
            planId: sub.plan_id,
            subscriberEmail: sub.subscriber?.email_address,
            startTime: sub.start_time,
            nextBillingTime: sub.billing_info?.next_billing_time,
            subscription: sub,
          },
          message: `Subscription \`${sub.id}\` is **${sub.status}**. Plan: \`${sub.plan_id}\`.`,
        };
      }
      case 'suspend': {
        await client.suspendSubscription(ctx.input.subscriptionId, ctx.input.reason || 'Suspended by integration');
        return {
          output: {
            subscriptionId: ctx.input.subscriptionId,
            status: 'SUSPENDED',
          },
          message: `Subscription \`${ctx.input.subscriptionId}\` suspended.`,
        };
      }
      case 'cancel': {
        await client.cancelSubscription(ctx.input.subscriptionId, ctx.input.reason || 'Cancelled by integration');
        return {
          output: {
            subscriptionId: ctx.input.subscriptionId,
            status: 'CANCELLED',
          },
          message: `Subscription \`${ctx.input.subscriptionId}\` cancelled.`,
        };
      }
      case 'activate': {
        await client.activateSubscription(ctx.input.subscriptionId, ctx.input.reason || 'Reactivated by integration');
        return {
          output: {
            subscriptionId: ctx.input.subscriptionId,
            status: 'ACTIVE',
          },
          message: `Subscription \`${ctx.input.subscriptionId}\` reactivated.`,
        };
      }
      case 'listTransactions': {
        if (!ctx.input.startTime || !ctx.input.endTime) {
          throw new Error('startTime and endTime are required for listTransactions action');
        }
        let result = await client.listSubscriptionTransactions(ctx.input.subscriptionId, {
          startTime: ctx.input.startTime,
          endTime: ctx.input.endTime,
        });
        let transactions = (result.transactions || []) as any[];
        return {
          output: {
            subscriptionId: ctx.input.subscriptionId,
            transactions,
          },
          message: `Found ${transactions.length} transaction(s) for subscription \`${ctx.input.subscriptionId}\`.`,
        };
      }
    }
  })
  .build();
