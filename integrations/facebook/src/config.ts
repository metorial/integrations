import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    apiVersion: z.string().default('v25.0').describe('Facebook Graph API version (e.g. v25.0)')
  })
);
