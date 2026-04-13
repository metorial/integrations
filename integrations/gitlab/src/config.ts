import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    instanceUrl: z
      .string()
      .optional()
      .describe(
        'GitLab instance URL for self-managed instances (e.g. https://gitlab.example.com). Defaults to https://gitlab.com for SaaS.'
      )
  })
);
