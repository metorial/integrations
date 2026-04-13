import { SlateTool } from 'slates';
import { PayPalClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let captureOrder = SlateTool.create(
  spec,
  {
    name: 'Capture Order',
    key: 'capture_order',
    description: `Capture payment for an approved PayPal order. The order must have been approved by the buyer first. For orders with intent "AUTHORIZE", use this to finalize the payment after authorization.`,
    instructions: [
      'The order must be in **APPROVED** status before capturing.',
      'For AUTHORIZE intent orders, use **authorizeOrder** first, then capture the authorization separately.',
    ],
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    orderId: z.string().describe('PayPal order ID to capture'),
  }))
  .output(z.object({
    orderId: z.string().describe('PayPal order ID'),
    status: z.string().describe('Order status after capture'),
    captureId: z.string().optional().describe('Capture ID from the payment'),
    captureStatus: z.string().optional().describe('Status of the capture'),
    currencyCode: z.string().optional().describe('Currency of the captured amount'),
    capturedAmount: z.string().optional().describe('Captured amount'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new PayPalClient({
      token: ctx.auth.token,
      clientId: ctx.auth.clientId,
      clientSecret: ctx.auth.clientSecret,
      environment: ctx.auth.environment,
    });

    let result = await client.captureOrder(ctx.input.orderId);
    let captures = (result.purchase_units as any[])?.[0]?.payments?.captures;
    let capture = captures?.[0];

    return {
      output: {
        orderId: result.id,
        status: result.status,
        captureId: capture?.id,
        captureStatus: capture?.status,
        currencyCode: capture?.amount?.currency_code,
        capturedAmount: capture?.amount?.value,
      },
      message: `Order \`${result.id}\` captured with status **${result.status}**.${capture ? ` Capture: ${capture.amount?.currency_code} ${capture.amount?.value}` : ''}`,
    };
  })
  .build();
