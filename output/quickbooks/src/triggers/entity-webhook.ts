import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClientFromContext } from '../lib/helpers';
import { z } from 'zod';

export let entityWebhook = SlateTrigger.create(
  spec,
  {
    name: 'Entity Change Webhook',
    key: 'entity_change_webhook',
    description: 'Receives real-time webhook notifications when QuickBooks entities are created, updated, deleted, merged, or voided. Fetches full entity details from the API after receiving the notification. Configure the webhook endpoint URL and entity subscriptions in the Intuit Developer portal.',
  }
)
  .input(z.object({
    entityId: z.string().describe('ID of the changed entity'),
    entityType: z.string().describe('Type of entity (e.g., Customer, Invoice, Payment)'),
    operation: z.string().describe('Operation performed (Create, Update, Delete, Merge, Void)'),
    lastUpdated: z.string().describe('Timestamp of the change'),
    realmId: z.string().describe('Company ID (Realm ID)'),
  }))
  .output(z.object({
    entityId: z.string().describe('ID of the affected entity'),
    entityType: z.string().describe('Entity type'),
    operation: z.string().describe('Operation performed'),
    lastUpdated: z.string().describe('Timestamp of the change'),
    realmId: z.string().describe('Company ID'),
    entityDetails: z.any().optional().describe('Full entity data fetched from the API (null for deletes)'),
  }))
  .webhook({
    handleRequest: async (ctx) => {
      let body = await ctx.request.json() as any;

      let inputs: any[] = [];

      let notifications = body?.eventNotifications ?? [];
      for (let notification of notifications) {
        let realmId = notification.realmId;
        let entities = notification.dataChangeEvent?.entities ?? [];

        for (let entity of entities) {
          inputs.push({
            entityId: entity.id,
            entityType: entity.name,
            operation: entity.operation,
            lastUpdated: entity.lastUpdated,
            realmId: realmId,
          });
        }
      }

      return { inputs };
    },

    handleEvent: async (ctx) => {
      let { entityId, entityType, operation, lastUpdated, realmId } = ctx.input;
      let entityDetails: any = null;

      if (operation !== 'Delete') {
        try {
          let client = createClientFromContext(ctx);
          let response = await client.getEntity(entityType, entityId);
          entityDetails = response?.[entityType] ?? response;
        } catch (e) {
          ctx.warn(`Could not fetch ${entityType} ${entityId}: ${e}`);
        }
      }

      let operationLower = operation.toLowerCase();
      let typeLower = entityType.toLowerCase();

      return {
        type: `${typeLower}.${operationLower}`,
        id: `${realmId}-${entityType}-${entityId}-${operationLower}-${lastUpdated}`,
        output: {
          entityId,
          entityType,
          operation,
          lastUpdated,
          realmId,
          entityDetails,
        },
      };
    },
  }).build();
