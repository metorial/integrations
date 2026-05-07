import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    environment: z
      .enum(['sandbox', 'production'])
      .default('production')
      .describe('QuickBooks API environment to use'),
    companyId: z
      .string()
      .min(1)
      .describe('QuickBooks Company ID (Realm ID) for the target company'),
    webhookVerifierToken: z
      .string()
      .optional()
      .describe('Optional Intuit webhook verifier token for signature validation')
  })
);
