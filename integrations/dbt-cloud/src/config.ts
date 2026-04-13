import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    accountId: z
      .string()
      .describe('Your dbt Cloud account ID. Found in your dbt Cloud URL or account settings.'),
    baseUrl: z
      .string()
      .default('https://cloud.getdbt.com')
      .describe(
        'Base URL for your dbt Cloud instance. Defaults to US multi-tenant (https://cloud.getdbt.com). Use https://emea.dbt.com for EMEA, https://au.dbt.com for APAC, or your custom URL for single-tenant deployments.'
      )
  })
);
