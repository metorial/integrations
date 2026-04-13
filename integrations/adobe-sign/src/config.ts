import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    shard: z.string().default('na1').describe('Adobe Sign data center shard (e.g., na1, na2, na4, eu1, eu2, au1, jp1). Determines the API base URL.')
  })
);
