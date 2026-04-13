import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    cloudId: z
      .string()
      .describe(
        'The Atlassian Cloud ID for your Jira site. Found via the accessible-resources API after OAuth authorization, or in your site administration settings.'
      )
  })
);
