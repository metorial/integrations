import { SlateTool } from 'slates';
import { ClickHouseClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let backupSchema = z.object({
  backupId: z.string().describe('Unique backup identifier'),
  serviceId: z.string().optional(),
  status: z.string().optional().describe('Backup status'),
  startedAt: z.string().optional().describe('When the backup started'),
  completedAt: z.string().optional().describe('When the backup completed'),
  sizeInBytes: z.number().optional().describe('Backup size in bytes')
});

export let listBackups = SlateTool.create(spec, {
  name: 'List Backups',
  key: 'list_backups',
  description: `List all backups for a ClickHouse service, with the most recent backups listed first. Includes backup status, timestamps, and size.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service to list backups for')
    })
  )
  .output(
    z.object({
      backups: z.array(backupSchema)
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let backups = await client.listBackups(ctx.input.serviceId);
    let items = Array.isArray(backups) ? backups : [];

    return {
      output: {
        backups: items.map((b: any) => ({
          backupId: b.id,
          serviceId: b.serviceId,
          status: b.status,
          startedAt: b.startedAt,
          completedAt: b.completedAt,
          sizeInBytes: b.sizeInBytes
        }))
      },
      message: `Found **${items.length}** backups for service ${ctx.input.serviceId}.`
    };
  })
  .build();

export let getBackupConfiguration = SlateTool.create(spec, {
  name: 'Get Backup Configuration',
  key: 'get_backup_configuration',
  description: `Retrieve the current backup configuration for a service, including backup schedule and retention settings.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service')
    })
  )
  .output(
    z.object({
      configuration: z
        .record(z.string(), z.any())
        .describe('Current backup configuration settings')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let config = await client.getBackupConfiguration(ctx.input.serviceId);

    return {
      output: { configuration: config },
      message: `Retrieved backup configuration for service ${ctx.input.serviceId}.`
    };
  })
  .build();

export let updateBackupConfiguration = SlateTool.create(spec, {
  name: 'Update Backup Configuration',
  key: 'update_backup_configuration',
  description: `Update the backup configuration for a service. Modify backup schedules, retention periods, and other backup settings.`
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      settings: z
        .record(z.string(), z.any())
        .describe('Backup configuration settings to update')
    })
  )
  .output(
    z.object({
      configuration: z.record(z.string(), z.any()).describe('Updated backup configuration')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let result = await client.updateBackupConfiguration(
      ctx.input.serviceId,
      ctx.input.settings
    );

    return {
      output: { configuration: result },
      message: `Backup configuration updated for service ${ctx.input.serviceId}.`
    };
  })
  .build();
