import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    tenantId: z
      .string()
      .describe(
        'Microsoft Entra ID (Azure AD) tenant ID. Required for OAuth authorization and token endpoints.'
      ),
    siteHostname: z
      .string()
      .optional()
      .describe(
        'SharePoint site hostname, e.g. "contoso.sharepoint.com". Used as default when accessing SharePoint resources.'
      )
  })
);
