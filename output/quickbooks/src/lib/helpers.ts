import { QuickBooksClient } from './client';

export interface ContextLike {
  config: { environment: 'sandbox' | 'production'; companyId: string };
  auth: { token: string };
}

export let createClientFromContext = (ctx: ContextLike): QuickBooksClient => {
  return new QuickBooksClient({
    token: ctx.auth.token,
    companyId: ctx.config.companyId,
    environment: ctx.config.environment,
  });
};
