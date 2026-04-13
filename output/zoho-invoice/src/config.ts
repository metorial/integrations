import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    region: z.enum(['com', 'eu', 'in', 'com.au', 'jp', 'ca']).default('com').describe('Zoho data center region for your organization'),
    organizationId: z.string().describe('Zoho Invoice Organization ID'),
  })
);
