import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    instanceUrl: z
      .string()
      .describe(
        'The Salesforce instance URL (e.g., https://yourorg.my.salesforce.com). Obtained from the OAuth token response.'
      ),
    apiVersion: z
      .string()
      .default('v62.0')
      .describe('Salesforce REST API version to use (e.g., v62.0)')
  })
);
