import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    region: z.enum(['eu', 'us', 'ca', 'ap', 'cn']).default('eu').describe('Server region for the Storyblok space'),
    spaceId: z.string().describe('The numeric ID of your Storyblok space'),
  })
);
