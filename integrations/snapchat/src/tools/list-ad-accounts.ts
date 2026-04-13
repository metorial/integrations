import { SlateTool } from 'slates';
import { SnapchatClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let adAccountSchema = z.object({
  adAccountId: z.string().describe('Unique ID of the ad account'),
  name: z.string().describe('Name of the ad account'),
  organizationId: z.string().optional().describe('Parent organization ID'),
  status: z.string().optional().describe('Ad account status'),
  type: z.string().optional().describe('Ad account type'),
  currency: z.string().optional().describe('Currency code (e.g., USD)'),
  timezone: z.string().optional().describe('Timezone of the ad account'),
  createdAt: z.string().optional().describe('Creation timestamp'),
  updatedAt: z.string().optional().describe('Last update timestamp')
});

export let listAdAccounts = SlateTool.create(spec, {
  name: 'List Ad Accounts',
  key: 'list_ad_accounts',
  description: `List all ad accounts under a Snapchat organization. Returns account IDs, names, currencies, timezones, and statuses. Use organization IDs from the List Organizations tool.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      organizationId: z.string().describe('ID of the organization to list ad accounts for')
    })
  )
  .output(
    z.object({
      adAccounts: z.array(adAccountSchema).describe('List of ad accounts')
    })
  )
  .handleInvocation(async ctx => {
    let client = new SnapchatClient(ctx.auth.token);
    let accounts = await client.listAdAccounts(ctx.input.organizationId);

    let adAccounts = accounts.map((a: any) => ({
      adAccountId: a.id,
      name: a.name,
      organizationId: a.organization_id,
      status: a.status,
      type: a.type,
      currency: a.currency,
      timezone: a.timezone,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }));

    return {
      output: { adAccounts },
      message: `Found **${adAccounts.length}** ad account(s).`
    };
  })
  .build();
