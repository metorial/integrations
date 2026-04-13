import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    environment: z
      .enum(['production', 'demo'])
      .default('production')
      .describe(
        'Gusto API environment. Use "demo" for sandbox/testing, "production" for live.'
      )
  })
);
