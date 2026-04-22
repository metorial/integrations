import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    apiVersion: z
      .string()
      .default('v62.0')
      .describe('Salesforce REST API version to use (e.g., v62.0)')
  })
);
