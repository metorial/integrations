import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';
import { intercomServiceError } from '../lib/errors';

export let manageCompanies = SlateTool.create(spec, {
  name: 'Manage Companies',
  key: 'manage_companies',
  description: `Create, update, or delete companies in Intercom. Also supports attaching or detaching contacts from companies.
The create and update operations use the same endpoint — if a company with the given companyId already exists, it will be updated.`,
  instructions: [
    'For create/update, provide a companyId (your external identifier) or let Intercom auto-generate one.',
    'For attach/detach, provide both contactId and the Intercom company ID.'
  ],
  tags: {
    destructive: true,
    readOnly: false
  }
})
  .input(
    z.object({
      action: z
        .enum(['create_or_update', 'delete', 'attach_contact', 'detach_contact'])
        .describe('The operation to perform'),
      intercomCompanyId: z
        .string()
        .optional()
        .describe('Intercom-assigned company ID (required for delete, attach, detach)'),
      contactId: z
        .string()
        .optional()
        .describe('Contact ID to attach/detach (required for attach_contact/detach_contact)'),
      companyId: z
        .string()
        .optional()
        .describe('Your external company identifier (for create_or_update)'),
      name: z.string().optional().describe('Company name'),
      plan: z.string().optional().describe('Company plan name'),
      size: z.number().optional().describe('Number of employees'),
      website: z.string().optional().describe('Company website URL'),
      industry: z.string().optional().describe('Company industry'),
      monthlySpend: z.number().optional().describe('Monthly spend amount'),
      remoteCreatedAt: z
        .string()
        .optional()
        .describe('ISO 8601 timestamp of company creation in your system'),
      customAttributes: z
        .record(z.string(), z.any())
        .optional()
        .describe('Custom attributes as key-value pairs')
    })
  )
  .output(
    z.object({
      intercomCompanyId: z.string().optional().describe('Intercom company ID'),
      companyId: z.string().optional().describe('External company ID'),
      name: z.string().optional().describe('Company name'),
      plan: z.string().optional().describe('Company plan'),
      size: z.number().optional().describe('Company size'),
      website: z.string().optional().describe('Website URL'),
      industry: z.string().optional().describe('Industry'),
      monthlySpend: z.number().optional().describe('Monthly spend'),
      userCount: z.number().optional().describe('Number of users at the company'),
      createdAt: z.string().optional().describe('Creation timestamp'),
      updatedAt: z.string().optional().describe('Last update timestamp'),
      deleted: z.boolean().optional().describe('Whether the company was deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token, region: ctx.config.region });
    let { action } = ctx.input;

    if (action === 'create_or_update') {
      let result = await client.createOrUpdateCompany({
        companyId: ctx.input.companyId,
        name: ctx.input.name,
        plan: ctx.input.plan,
        size: ctx.input.size,
        website: ctx.input.website,
        industry: ctx.input.industry,
        monthlySpend: ctx.input.monthlySpend,
        remoteCreatedAt: ctx.input.remoteCreatedAt,
        customAttributes: ctx.input.customAttributes
      });
      return {
        output: mapCompany(result),
        message: `Created/updated company **${result.name || result.id}**`
      };
    }

    if (action === 'delete') {
      if (!ctx.input.intercomCompanyId)
        throw intercomServiceError('intercomCompanyId is required for delete');
      await client.deleteCompany(ctx.input.intercomCompanyId);
      return {
        output: { intercomCompanyId: ctx.input.intercomCompanyId, deleted: true },
        message: `Deleted company **${ctx.input.intercomCompanyId}**`
      };
    }

    if (action === 'attach_contact') {
      if (!ctx.input.contactId || !ctx.input.intercomCompanyId) {
        throw intercomServiceError(
          'Both contactId and intercomCompanyId are required for attach_contact'
        );
      }
      let result = await client.attachContactToCompany(
        ctx.input.contactId,
        ctx.input.intercomCompanyId
      );
      return {
        output: mapCompany(result),
        message: `Attached contact **${ctx.input.contactId}** to company **${ctx.input.intercomCompanyId}**`
      };
    }

    if (action === 'detach_contact') {
      if (!ctx.input.contactId || !ctx.input.intercomCompanyId) {
        throw intercomServiceError(
          'Both contactId and intercomCompanyId are required for detach_contact'
        );
      }
      let result = await client.detachContactFromCompany(
        ctx.input.contactId,
        ctx.input.intercomCompanyId
      );
      return {
        output: mapCompany(result),
        message: `Detached contact **${ctx.input.contactId}** from company **${ctx.input.intercomCompanyId}**`
      };
    }

    throw intercomServiceError(`Unknown action: ${action}`);
  })
  .build();

let mapCompany = (data: any) => ({
  intercomCompanyId: data.id,
  companyId: data.company_id,
  name: data.name,
  plan: data.plan?.name,
  size: data.size,
  website: data.website,
  industry: data.industry,
  monthlySpend: data.monthly_spend,
  userCount: data.user_count,
  createdAt: data.created_at ? String(data.created_at) : undefined,
  updatedAt: data.updated_at ? String(data.updated_at) : undefined
});
