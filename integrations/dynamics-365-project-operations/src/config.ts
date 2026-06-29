import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    dataverseInstanceUrl: z
      .string()
      .optional()
      .describe(
        'Default Dataverse environment URL, such as https://contoso.crm.dynamics.com. Auth output is used when omitted.'
      ),
    dataverseApiVersion: z
      .string()
      .optional()
      .describe('Dataverse Web API version. Defaults to v9.2.'),
    finOpsBaseUrl: z
      .string()
      .optional()
      .describe(
        'Default Dynamics 365 Finance and Operations environment URL for finance handoff tools.'
      ),
    defaultLegalEntity: z
      .string()
      .optional()
      .describe('Default Finance and Operations legal entity / dataAreaId.'),
    defaultPageSize: z
      .number()
      .int()
      .min(1)
      .max(5000)
      .optional()
      .describe(
        'Default Dataverse page size for list actions. Defaults to the service default.'
      )
  })
);
