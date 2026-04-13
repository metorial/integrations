import { SlateTool } from 'slates';
import { GongClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getCrmData = SlateTool.create(
  spec,
  {
    name: 'Get CRM Data',
    key: 'get_crm_data',
    description: `Retrieve CRM objects uploaded to Gong or list calls manually associated with CRM records. Use **mode "objects"** to fetch specific CRM entities (accounts, contacts, deals, etc.) by their CRM IDs. Use **mode "associations"** to list calls manually linked to CRM accounts/deals.`,
    instructions: [
      'For "objects" mode: provide integrationId, objectType, and objectCrmIds.',
      'For "associations" mode: provide fromDateTime to list associations since that time.',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    mode: z.enum(['objects', 'associations']).describe('Whether to retrieve CRM objects or manual CRM-call associations'),
    integrationId: z.string().optional().describe('CRM integration ID (required for objects mode)'),
    objectType: z.string().optional().describe('CRM object type: Account, Contact, Deal, Lead, User (required for objects mode)'),
    objectCrmIds: z.array(z.string()).optional().describe('CRM IDs of the objects to retrieve (required for objects mode)'),
    fromDateTime: z.string().optional().describe('Start datetime for associations (required for associations mode, ISO 8601)'),
    cursor: z.string().optional().describe('Pagination cursor (for associations mode)'),
  }))
  .output(z.object({
    crmObjects: z.record(z.string(), z.any()).optional().describe('Map of CRM object IDs to their data (objects mode)'),
    associations: z.array(z.any()).optional().describe('Manual CRM-call associations (associations mode)'),
    totalRecords: z.number().optional().describe('Total records (associations mode)'),
    cursor: z.string().optional().describe('Cursor for next page (associations mode)'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new GongClient({
      token: ctx.auth.token,
      baseUrl: ctx.auth.baseUrl,
    });

    if (ctx.input.mode === 'objects') {
      if (!ctx.input.integrationId || !ctx.input.objectType || !ctx.input.objectCrmIds) {
        throw new Error('integrationId, objectType, and objectCrmIds are required for objects mode.');
      }

      let result = await client.getCrmObjects({
        integrationId: ctx.input.integrationId,
        objectType: ctx.input.objectType,
        objectCrmIds: ctx.input.objectCrmIds,
      });

      return {
        output: {
          crmObjects: result.crmObjectsMap || result.objects,
        },
        message: `Retrieved CRM ${ctx.input.objectType} objects.`,
      };
    }

    if (!ctx.input.fromDateTime) {
      throw new Error('fromDateTime is required for associations mode.');
    }

    let result = await client.getManualCrmAssociations({
      fromDateTime: ctx.input.fromDateTime,
      cursor: ctx.input.cursor,
    });

    let associations = result.callAssociations || result.associations || [];

    return {
      output: {
        associations,
        totalRecords: result.records?.totalRecords,
        cursor: result.records?.cursor,
      },
      message: `Retrieved ${associations.length} manual CRM association(s).`,
    };
  })
  .build();
