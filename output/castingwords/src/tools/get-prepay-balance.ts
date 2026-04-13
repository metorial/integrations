import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getPrepayBalance = SlateTool.create(
  spec,
  {
    name: 'Get Prepay Balance',
    key: 'get_prepay_balance',
    description: `Check the current prepay account balance in USD. Useful for verifying available funds before placing orders.`,
    tags: {
      destructive: false,
      readOnly: true,
    },
  }
)
  .input(z.object({}))
  .output(z.object({
    balance: z.string().describe('Current prepay balance in USD'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client(ctx.auth.token);

    let result = await client.getPrepayBalance();

    return {
      output: {
        balance: result.balance ?? '0.00',
      },
      message: `Prepay balance: **$${result.balance ?? '0.00'}**.`,
    };
  })
  .build();
