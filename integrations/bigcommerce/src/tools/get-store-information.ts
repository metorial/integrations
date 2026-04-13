import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getStoreInformation = SlateTool.create(
  spec,
  {
    name: 'Get Store Information',
    key: 'get_store_information',
    description: `Retrieve the store's profile information including name, domain, address, currency, language, and plan details.`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({}))
  .output(z.object({
    store: z.any().describe('The store information object'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      storeHash: ctx.config.storeHash,
    });

    let store = await client.getStoreInformation();

    return {
      output: { store },
      message: `Store: **${store.name}** (${store.domain}).`,
    };
  })
  .build();
