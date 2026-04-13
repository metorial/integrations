import { SlateTool } from 'slates';
import { PayPalClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let addTracking = SlateTool.create(spec, {
  name: 'Add Tracking',
  key: 'add_tracking',
  description: `Add shipment tracking information to a captured PayPal payment. Associates a carrier and tracking number with a transaction so buyers can track their shipments.`,
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      captureId: z.string().describe('PayPal capture/transaction ID to add tracking to'),
      trackingNumber: z.string().describe('Carrier tracking number'),
      carrier: z.string().describe('Shipping carrier (e.g. FEDEX, UPS, USPS, DHL)'),
      status: z
        .enum(['SHIPPED', 'ON_HOLD', 'DELIVERED', 'CANCELLED'])
        .optional()
        .describe('Shipment status. Defaults to SHIPPED.'),
      notifyPayer: z
        .boolean()
        .optional()
        .describe('Whether to email the tracking info to the buyer. Defaults to true.')
    })
  )
  .output(
    z.object({
      trackerId: z
        .string()
        .optional()
        .describe('Tracker ID in format transactionId-trackingNumber'),
      status: z.string().optional().describe('Tracking status'),
      trackingNumber: z.string().describe('Tracking number'),
      carrier: z.string().describe('Carrier name')
    })
  )
  .handleInvocation(async ctx => {
    let client = new PayPalClient({
      token: ctx.auth.token,
      clientId: ctx.auth.clientId,
      clientSecret: ctx.auth.clientSecret,
      environment: ctx.auth.environment
    });

    let result = await client.addTracking(ctx.input.captureId, {
      trackingNumber: ctx.input.trackingNumber,
      carrier: ctx.input.carrier,
      status: ctx.input.status,
      notifyPayer: ctx.input.notifyPayer
    });

    let tracker = (result.tracker_identifiers || result.trackers)?.[0] || {};

    return {
      output: {
        trackerId:
          tracker.tracking_number_id || `${ctx.input.captureId}-${ctx.input.trackingNumber}`,
        status: ctx.input.status || 'SHIPPED',
        trackingNumber: ctx.input.trackingNumber,
        carrier: ctx.input.carrier
      },
      message: `Tracking added for capture \`${ctx.input.captureId}\`: ${ctx.input.carrier} ${ctx.input.trackingNumber}.`
    };
  })
  .build();
