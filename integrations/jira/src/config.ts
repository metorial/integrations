import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    cloudId: z.string().describe('The Jira Cloud ID for your Atlassian site. Found via the accessible-resources API after OAuth authorization.'),
    siteDomain: z.string().optional().describe('Your Atlassian site domain (e.g., "mycompany" for mycompany.atlassian.net). Used for API token authentication.'),
  })
);
