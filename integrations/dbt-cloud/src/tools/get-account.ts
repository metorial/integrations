import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getAccountTool = SlateTool.create(
  spec,
  {
    name: 'Get Account',
    key: 'get_account',
    description: `Retrieve details about the configured dbt Cloud account. Returns account name, plan tier, run slots, developer seat count, and billing information. Useful for verifying the account configuration and available resources.`,
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({}))
  .output(z.object({
    accountId: z.number().describe('Unique account identifier'),
    name: z.string().describe('Account name'),
    plan: z.string().optional().describe('Account plan tier'),
    runSlots: z.number().optional().describe('Number of available run slots'),
    developerSeats: z.number().optional().describe('Number of developer seats'),
    state: z.number().optional().describe('Account state (1 = active)'),
    createdAt: z.string().optional().describe('Account creation timestamp')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      accountId: ctx.config.accountId,
      baseUrl: ctx.config.baseUrl
    });

    let account = await client.getAccount();

    return {
      output: {
        accountId: account.id,
        name: account.name,
        plan: account.plan,
        runSlots: account.run_slots,
        developerSeats: account.developer_seats,
        state: account.state,
        createdAt: account.created_at
      },
      message: `Account: **${account.name}** (ID: ${account.id}), Plan: **${account.plan || 'N/A'}**.`
    };
  }).build();
