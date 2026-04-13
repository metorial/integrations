import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteRecordsTool = SlateTool.create(
  spec,
  {
    name: 'Delete Records',
    key: 'delete_records',
    description: `Delete one or more records from a table in the configured Airtable base. This action is **irreversible** and permanently removes the specified records.`,
    constraints: [
      'Maximum of 10 records per request.',
    ],
    tags: {
      destructive: true,
    },
  }
)
  .input(z.object({
    tableIdOrName: z.string().describe('Table ID (e.g. tblXXXXXX) or table name'),
    recordIds: z.array(z.string()).min(1).max(10).describe('Array of record IDs to delete (max 10)'),
  }))
  .output(z.object({
    deletedRecords: z.array(z.object({
      recordId: z.string().describe('Deleted record ID'),
      deleted: z.boolean().describe('Whether the deletion was successful'),
    })),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      baseId: ctx.config.baseId,
    });

    let result = await client.deleteRecords(ctx.input.tableIdOrName, ctx.input.recordIds);

    return {
      output: {
        deletedRecords: result.records.map(r => ({
          recordId: r.id,
          deleted: r.deleted,
        })),
      },
      message: `Deleted ${result.records.length} record(s) from table **${ctx.input.tableIdOrName}**.`,
    };
  })
  .build();
