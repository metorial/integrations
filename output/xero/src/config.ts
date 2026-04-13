import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    tenantId: z.string().optional().describe('Xero organisation (tenant) ID. Required for multi-tenant apps. If not set, the first connected organisation will be used.'),
  })
);
