import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    tenantId: z
      .string()
      .optional()
      .describe('Optional Microsoft Entra tenant ID to include in Business Central API URLs.'),
    environmentName: z
      .string()
      .optional()
      .describe('Default Business Central environment name. Defaults to "production".'),
    companyId: z
      .string()
      .optional()
      .describe('Default Business Central company GUID for company-scoped tools.'),
    defaultLimit: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Default list page size for tools when limit is omitted. Defaults to 50.')
  })
);
