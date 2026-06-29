import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    instanceUrl: z
      .string()
      .optional()
      .describe(
        'Your Dynamics 365 Dataverse environment URL (for example, https://yourorg.crm.dynamics.com)'
      )
  })
);
