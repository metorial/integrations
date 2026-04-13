import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    pageId: z.string().describe('The Facebook Page ID to use for Messenger API calls'),
    apiVersion: z.string().default('v21.0').describe('Graph API version to use (e.g. v21.0)')
  })
);
