import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { HubSpotClient } from './lib/client';
import { provider } from './index';

type HubSpotHelpers = {
  client: HubSpotClient;
};

let propertyNameForRun = (runId: string) =>
  `slates_e2e_${runId.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(-24)}_field`;

let buildPipelineStages = (runId: string) => [
  {
    label: `${runId} stage one`,
    displayOrder: 1,
    metadata: {
      probability: '0.2'
    }
  },
  {
    label: `${runId} stage two`,
    displayOrder: 2,
    metadata: {
      probability: '0.8'
    }
  }
];

export let hubSpotToolE2E = defineSlateToolE2EIntegration<
  Record<string, any>,
  HubSpotHelpers
>({
  createHelpers: ctx => ({
    client: new HubSpotClient(ctx.auth.token)
  }),
  resources: {
    contact: {},
    company: {},
    pipeline: {
      create: async ctx => {
        let input = {
          objectType: 'deals',
          label: ctx.namespaced('pipeline'),
          displayOrder: 1,
          stages: buildPipelineStages(ctx.runId)
        };
        let result = await ctx.invokeTool('create_pipeline', input);
        return {
          ...result.output,
          objectType: input.objectType
        };
      }
    },
    deal: {
      use: ['pipeline']
    },
    ticket: {},
    engagement: {},
    association: {
      use: ['contact', 'company'],
      create: async ctx => {
        let contact = ctx.resource('contact');
        let company = ctx.resource('company');
        await ctx.invokeTool('create_association', {
          fromObjectType: 'contacts',
          fromObjectId: String(contact.contactId),
          toObjectType: 'companies',
          toObjectId: String(company.companyId),
          associationTypeId: 279,
          associationCategory: 'HUBSPOT_DEFINED'
        });

        return {
          fromObjectType: 'contacts',
          fromObjectId: String(contact.contactId),
          toObjectType: 'companies',
          toObjectId: String(company.companyId),
          associationTypeId: 279,
          associationCategory: 'HUBSPOT_DEFINED'
        };
      }
    },
    list: {},
    property: {
      create: async ctx => {
        let input = {
          objectType: 'contacts',
          name: propertyNameForRun(ctx.runId),
          label: ctx.namespaced('property'),
          type: 'string' as const,
          fieldType: 'text',
          groupName: 'contactinformation',
          description: `Created by ${ctx.runId}`
        };
        let result = await ctx.invokeTool('create_property', input);
        return {
          ...result.output,
          objectType: input.objectType
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.objectType === 'string' && typeof value.name === 'string') {
            await ctx.helpers.client.deleteProperty(value.objectType, value.name);
          }
        }
      }
    }
  },
  scenarioOverrides: {
    create_pipeline: {
      name: 'create_pipeline creates a namespaced pipeline',
      use: ['pipeline'],
      run: async () => {}
    },
    create_property: {
      name: 'create_property creates a namespaced property',
      use: ['property'],
      run: async () => {}
    },
    list_properties: {
      name: 'list_properties includes the created custom property',
      use: ['property'],
      run: async ctx => {
        let property = ctx.resource('property');
        let result = await ctx.invokeTool('list_properties', {
          objectType: String(property.objectType)
        });

        if (
          !result.output.properties.some(
            (candidate: { name?: string }) => candidate.name === String(property.name)
          )
        ) {
          throw new Error(`list_properties did not return the expected property ${property.name}.`);
        }
      }
    },
    search_crm: {
      name: 'search_crm finds the created contact by email',
      use: ['contact'],
      run: async ctx => {
        let contact = ctx.resource('contact');
        let email = contact.properties?.email;
        let contactId = contact.contactId;

        let result = await ctx.invokeTool('search_crm', {
          objectType: 'contacts',
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: String(email)
                }
              ]
            }
          ],
          properties: ['email', 'firstname', 'lastname'],
          limit: 20
        });

        if (
          typeof contactId === 'string' &&
          !result.output.results.some(
            (candidate: { objectId?: string }) => candidate.objectId === contactId
          )
        ) {
          throw new Error(`search_crm did not return the expected contact ${contactId}.`);
        }
      }
    },
    create_association: {
      name: 'create_association links the created contact and company',
      use: ['association'],
      run: async () => {}
    },
    get_associations: {
      name: 'get_associations returns the created association',
      use: ['association'],
      run: async ctx => {
        let association = ctx.resource('association');
        let result = await ctx.invokeTool('get_associations', {
          fromObjectType: String(association.fromObjectType),
          fromObjectId: String(association.fromObjectId),
          toObjectType: String(association.toObjectType)
        });

        let toObjectId = String(association.toObjectId);
        if (
          !result.output.associations.some(
            (candidate: { toObjectId?: string }) => candidate.toObjectId === toObjectId
          )
        ) {
          throw new Error(
            `get_associations did not return the expected target object ${toObjectId}.`
          );
        }
      }
    },
    update_list_membership: {
      name: 'update_list_membership adds and removes a contact from a static list',
      use: ['list', 'contact'],
      run: async ctx => {
        let list = ctx.resource('list');
        let contact = ctx.resource('contact');

        let listId = String(list.listId);
        let contactId = String(contact.contactId);

        let add = await ctx.invokeTool('update_list_membership', {
          listId,
          addRecordIds: [contactId]
        });
        if ((add.output.recordsAdded ?? 0) < 1) {
          throw new Error(`update_list_membership did not add contact ${contactId} to ${listId}.`);
        }

        let remove = await ctx.invokeTool('update_list_membership', {
          listId,
          removeRecordIds: [contactId]
        });
        if ((remove.output.recordsRemoved ?? 0) < 1) {
          throw new Error(
            `update_list_membership did not remove contact ${contactId} from ${listId}.`
          );
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: hubSpotToolE2E
});
