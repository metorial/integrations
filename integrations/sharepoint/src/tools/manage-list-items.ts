import { SlateTool } from 'slates';
import { SharePointClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let listItemOutputSchema = z.object({
  itemId: z.string().describe('List item ID'),
  webUrl: z.string().optional().describe('URL of the list item'),
  createdDateTime: z.string().optional().describe('When the item was created'),
  lastModifiedDateTime: z.string().optional().describe('When the item was last modified'),
  createdBy: z.string().optional().describe('User who created the item'),
  lastModifiedBy: z.string().optional().describe('User who last modified the item'),
  fields: z
    .record(z.string(), z.any())
    .optional()
    .describe('Custom field values of the list item')
});

export let manageListItems = SlateTool.create(spec, {
  name: 'Manage List Items',
  key: 'manage_list_items',
  description: `Full CRUD operations on SharePoint list items. Create, read, update, delete, or list items in a SharePoint list. Supports OData filtering and ordering when listing items. Field values match the list's column schema.`,
  instructions: [
    'Set **action** to "get", "list", "create", "update", or "delete".',
    'When creating or updating, pass **fields** as a key-value object matching the list column names.',
    'When listing, use **filter** for OData filter expressions (e.g. "fields/Status eq \'Active\'") and **orderBy** for sorting.'
  ],
  constraints: ['Maximum of 5000 items can be returned in a single list request.'],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      action: z
        .enum(['get', 'list', 'create', 'update', 'delete'])
        .describe('Action to perform'),
      siteId: z.string().describe('SharePoint site ID'),
      listId: z.string().describe('SharePoint list ID'),
      itemId: z
        .string()
        .optional()
        .describe('List item ID (required for get, update, delete)'),
      fields: z
        .record(z.string(), z.any())
        .optional()
        .describe('Field values for create or update, keyed by column name'),
      filter: z.string().optional().describe('OData filter expression for list action'),
      orderBy: z.string().optional().describe('OData orderby expression for list action'),
      top: z
        .number()
        .optional()
        .describe('Maximum number of items to return (for list action)'),
      skip: z
        .number()
        .optional()
        .describe('Number of items to skip for pagination (for list action)')
    })
  )
  .output(
    z.object({
      item: listItemOutputSchema
        .optional()
        .describe('Single list item (for get, create, update)'),
      items: z
        .array(listItemOutputSchema)
        .optional()
        .describe('List of items (for list action)'),
      deleted: z
        .boolean()
        .optional()
        .describe('Whether the item was deleted (for delete action)'),
      totalCount: z.number().optional().describe('Number of items returned (for list action)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new SharePointClient(ctx.auth.token);
    let { action, siteId, listId, itemId, fields, filter, orderBy, top, skip } = ctx.input;

    let mapItem = (item: any) => ({
      itemId: item.id,
      webUrl: item.webUrl,
      createdDateTime: item.createdDateTime,
      lastModifiedDateTime: item.lastModifiedDateTime,
      createdBy: item.createdBy?.user?.displayName,
      lastModifiedBy: item.lastModifiedBy?.user?.displayName,
      fields: item.fields
    });

    switch (action) {
      case 'get': {
        if (!itemId) throw new Error('itemId is required for get action.');
        let item = await client.getListItem(siteId, listId, itemId);
        return {
          output: { item: mapItem(item) },
          message: `Retrieved list item \`${itemId}\`.`
        };
      }

      case 'list': {
        let data = await client.listListItems(siteId, listId, {
          expand: 'fields',
          filter,
          orderby: orderBy,
          top,
          skip
        });
        let items = (data.value || []).map(mapItem);
        return {
          output: { items, totalCount: items.length },
          message: `Found **${items.length}** item(s) in the list.`
        };
      }

      case 'create': {
        if (!fields || Object.keys(fields).length === 0) {
          throw new Error('fields are required for create action.');
        }
        let item = await client.createListItem(siteId, listId, fields);
        return {
          output: { item: mapItem(item) },
          message: `Created new list item \`${item.id}\`.`
        };
      }

      case 'update': {
        if (!itemId) throw new Error('itemId is required for update action.');
        if (!fields || Object.keys(fields).length === 0) {
          throw new Error('fields are required for update action.');
        }
        let updatedFields = await client.updateListItem(siteId, listId, itemId, fields);
        return {
          output: {
            item: {
              itemId,
              fields: updatedFields
            }
          },
          message: `Updated list item \`${itemId}\`.`
        };
      }

      case 'delete': {
        if (!itemId) throw new Error('itemId is required for delete action.');
        await client.deleteListItem(siteId, listId, itemId);
        return {
          output: { deleted: true },
          message: `Deleted list item \`${itemId}\`.`
        };
      }
    }
  })
  .build();
