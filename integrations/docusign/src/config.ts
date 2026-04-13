import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    environment: z
      .enum(['demo', 'production'])
      .default('demo')
      .describe(
        'DocuSign environment to use. Use "demo" for development/testing and "production" for live accounts.'
      )
  })
);
