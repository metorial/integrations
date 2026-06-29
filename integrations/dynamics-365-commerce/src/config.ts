import { SlateConfig } from 'slates';
import { z } from 'zod';

let commerceIdSchema = z.union([z.string(), z.number()]);

export let config = SlateConfig.create(
  z.object({
    retailServerUrl: z
      .string()
      .optional()
      .describe('Optional Commerce Scale Unit Retail Server URL override.'),
    operatingUnitNumber: z
      .string()
      .optional()
      .describe('Optional default Commerce operating unit number sent as the OUN header.'),
    locale: z
      .string()
      .optional()
      .describe('Optional default locale sent as the Retail Server Accept-Language header.'),
    channelId: commerceIdSchema.optional().describe('Optional default Commerce channel id.'),
    catalogId: commerceIdSchema.optional().describe('Optional default Commerce catalog id.'),
    defaultPageSize: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe('Default page size for paginated Commerce tools.'),
    maxPageSize: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe('Maximum page size allowed by this integration. Defaults to the recipe cap.')
  })
);
