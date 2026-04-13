import { PipedriveClient } from './client';

export interface SlateContext {
  config: { companyDomain: string };
  auth: { token: string; companyDomain?: string };
}

export let createClient = (ctx: SlateContext): PipedriveClient => {
  let companyDomain = ctx.auth.companyDomain || ctx.config.companyDomain;

  return new PipedriveClient({
    token: ctx.auth.token,
    companyDomain
  });
};
