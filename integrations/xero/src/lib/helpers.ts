import { XeroClient } from './client';

export let createClientFromContext = (ctx: {
  auth: { token: string; tenantId?: string };
  config: { tenantId?: string };
}): XeroClient => {
  let tenantId = ctx.config.tenantId || ctx.auth.tenantId;
  if (!tenantId) {
    throw new Error(
      'Tenant ID is required. Set it in the configuration or ensure it is available from authentication.'
    );
  }

  return new XeroClient({
    token: ctx.auth.token,
    tenantId
  });
};
