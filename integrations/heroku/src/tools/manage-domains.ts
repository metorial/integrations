import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageDomains = SlateTool.create(spec, {
  name: 'Manage Domains',
  key: 'manage_domains',
  description: `List, add, or remove custom domains for a Heroku app. Custom domains allow users to access apps via their own domain names instead of the default \`.herokuapp.com\` domain.`
})
  .input(
    z.object({
      appIdOrName: z.string().describe('App name or unique identifier'),
      action: z.enum(['list', 'add', 'remove']).describe('Operation to perform'),
      hostname: z
        .string()
        .optional()
        .describe('Custom domain hostname (required for "add" and "remove")'),
      sniEndpoint: z
        .string()
        .optional()
        .describe('SNI endpoint ID to associate with the domain (for "add")')
    })
  )
  .output(
    z.object({
      domains: z
        .array(
          z.object({
            domainId: z.string().describe('Unique identifier of the domain'),
            hostname: z.string().describe('Domain hostname'),
            kind: z.string().describe('Domain kind (e.g., "custom", "heroku")'),
            cname: z.string().nullable().describe('CNAME target for DNS configuration'),
            status: z.string().describe('Domain status'),
            createdAt: z.string().describe('When the domain was added')
          })
        )
        .optional(),
      removed: z.boolean().optional().describe('Whether the domain was removed')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    let { appIdOrName, action } = ctx.input;

    let mapDomain = (d: any) => ({
      domainId: d.domainId,
      hostname: d.hostname,
      kind: d.kind,
      cname: d.cname,
      status: d.status,
      createdAt: d.createdAt
    });

    if (action === 'list') {
      let domains = await client.listDomains(appIdOrName);
      return {
        output: { domains: domains.map(mapDomain) },
        message: `Found **${domains.length}** domain(s) for app **${appIdOrName}**.`
      };
    }

    if (action === 'add') {
      if (!ctx.input.hostname) throw new Error('hostname is required for "add" action.');
      let domain = await client.addDomain(appIdOrName, ctx.input.hostname, {
        sniEndpoint: ctx.input.sniEndpoint
      });
      return {
        output: { domains: [mapDomain(domain)] },
        message: `Added domain **${domain.hostname}** to app **${appIdOrName}**.${domain.cname ? ` Set CNAME to \`${domain.cname}\`.` : ''}`
      };
    }

    // remove
    if (!ctx.input.hostname) throw new Error('hostname is required for "remove" action.');
    await client.removeDomain(appIdOrName, ctx.input.hostname);
    return {
      output: { removed: true },
      message: `Removed domain **${ctx.input.hostname}** from app **${appIdOrName}**.`
    };
  })
  .build();
