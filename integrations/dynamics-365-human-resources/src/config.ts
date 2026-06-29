import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    baseUrl: z
      .string()
      .optional()
      .describe(
        'Dynamics 365 Finance and Operations environment URL, for example https://contoso.operations.dynamics.com.'
      ),
    environmentUrl: z
      .string()
      .optional()
      .describe('Alias for baseUrl when matching Microsoft product terminology.'),
    defaultLegalEntity: z
      .string()
      .optional()
      .describe('Default legal entity / dataAreaId for company-scoped Human Resources tools.'),
    defaultPageSize: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .optional()
      .describe('Default page size for list tools.'),
    defaultMaxPages: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Default maximum number of OData pages fetched by list tools.')
  })
);
