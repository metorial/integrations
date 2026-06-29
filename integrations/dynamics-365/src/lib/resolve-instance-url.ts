import { resolveDataverseInstanceUrl } from '@slates/microsoft-dataverse-recipes';

export let resolveDynamicsInstanceUrl = (ctx: {
  auth?: { instanceUrl?: unknown } | null;
  config?: { instanceUrl?: unknown } | null;
}) => {
  let authInstanceUrl = ctx.auth?.instanceUrl;
  let configInstanceUrl = ctx.config?.instanceUrl;

  return resolveDataverseInstanceUrl({
    auth: {
      instanceUrl: typeof authInstanceUrl === 'string' ? authInstanceUrl : undefined
    },
    config: {
      instanceUrl: typeof configInstanceUrl === 'string' ? configInstanceUrl : undefined
    }
  });
};
