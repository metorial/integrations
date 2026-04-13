import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    apiVersion: z.string().default('2025-07-01').describe('Hookdeck API version (date string, e.g. 2025-07-01)'),
  })
);
