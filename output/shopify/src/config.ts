import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    shopDomain: z.string().describe('The shop subdomain (e.g., "my-store" from "my-store.myshopify.com")'),
    apiVersion: z.string().default('2024-10').describe('Shopify API version (e.g., "2024-10")')
  })
);
