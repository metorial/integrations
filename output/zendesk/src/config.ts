import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    subdomain: z.string().describe('The Zendesk account subdomain (e.g., "mycompany" from mycompany.zendesk.com)'),
  })
);
