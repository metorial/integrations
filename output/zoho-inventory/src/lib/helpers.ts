import { ZohoInventoryClient } from './client';

export let createClient = (ctx: { auth: { token: string }; config: { organizationId: string; dataCenterDomain: string } }) => {
  return new ZohoInventoryClient({
    token: ctx.auth.token,
    organizationId: ctx.config.organizationId,
    dataCenterDomain: ctx.config.dataCenterDomain,
  });
};
