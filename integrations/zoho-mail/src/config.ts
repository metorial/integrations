import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    dataCenterDomain: z
      .enum(['zoho.com', 'zoho.eu', 'zoho.in', 'zoho.com.au', 'zoho.jp', 'zoho.com.cn'])
      .default('zoho.com')
      .describe('Zoho data center domain based on your account region')
  })
);
