import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    instanceUrl: z
      .string()
      .optional()
      .describe('Dataverse environment URL, such as https://yourorg.crm.dynamics.com'),
    apiVersion: z.string().optional().describe('Dataverse Web API version. Defaults to v9.2.')
  })
);
