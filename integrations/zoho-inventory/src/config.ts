import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    organizationId: z
      .string()
      .describe(
        'Zoho Inventory Organization ID. Retrieve from the Organizations API after authenticating.'
      ),
    dataCenterDomain: z
      .enum(['com', 'eu', 'in', 'com.au', 'ca', 'jp', 'com.cn', 'sa'])
      .default('com')
      .describe(
        'Zoho data center domain. Must match the region where your Zoho account is hosted.'
      )
  })
);
