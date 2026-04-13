import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    environment: z.enum(['sandbox', 'production']).default('production').describe('QuickBooks API environment to use'),
    companyId: z.string().describe('QuickBooks Company ID (Realm ID) for the target company'),
  })
);
