import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listDnsZones = SlateTool.create(spec, {
  name: 'List DNS Zones',
  key: 'list_dns_zones',
  description: `List all DNS zones managed by Netlify DNS. Optionally filter by account slug.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      accountSlug: z.string().optional().describe('Filter by account/team slug')
    })
  )
  .output(
    z.object({
      zones: z.array(
        z.object({
          zoneId: z.string().describe('DNS zone identifier'),
          name: z.string().describe('Zone domain name'),
          accountSlug: z.string().optional().describe('Account slug'),
          recordCount: z.number().optional().describe('Number of DNS records'),
          createdAt: z.string().optional().describe('Zone creation timestamp')
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    let zones = await client.listDnsZones({
      accountSlug: ctx.input.accountSlug
    });

    let mapped = zones.map((zone: any) => ({
      zoneId: zone.id,
      name: zone.name || '',
      accountSlug: zone.account_slug,
      recordCount: zone.records_count,
      createdAt: zone.created_at
    }));

    return {
      output: { zones: mapped },
      message: `Found **${mapped.length}** DNS zone(s).`
    };
  })
  .build();

export let manageDnsRecords = SlateTool.create(spec, {
  name: 'Manage DNS Records',
  key: 'manage_dns_records',
  description: `List, create, or delete DNS records within a Netlify DNS zone. Supports A, AAAA, CNAME, MX, TXT, NS, and other record types.`,
  instructions: [
    'Use action "list" to view all records in a zone.',
    'Use action "create" to add a new DNS record.',
    'Use action "delete" to remove a DNS record by its ID.'
  ]
})
  .input(
    z.object({
      action: z.enum(['list', 'create', 'delete']).describe('Action to perform'),
      zoneId: z.string().describe('DNS zone ID'),
      recordId: z.string().optional().describe('DNS record ID (required for delete)'),
      recordType: z
        .string()
        .optional()
        .describe('DNS record type, e.g., A, AAAA, CNAME, MX, TXT (required for create)'),
      hostname: z.string().optional().describe('Record hostname (required for create)'),
      value: z.string().optional().describe('Record value (required for create)'),
      ttl: z.number().optional().describe('Time to live in seconds'),
      priority: z.number().optional().describe('Priority for MX records')
    })
  )
  .output(
    z.object({
      records: z
        .array(
          z.object({
            recordId: z.string().describe('DNS record identifier'),
            hostname: z.string().describe('Record hostname'),
            recordType: z.string().describe('Record type (A, CNAME, etc.)'),
            value: z.string().describe('Record value'),
            ttl: z.number().optional().describe('TTL in seconds'),
            priority: z.number().optional().describe('MX priority')
          })
        )
        .optional()
        .describe('DNS records (returned for list action)'),
      createdRecord: z
        .object({
          recordId: z.string().describe('Created record ID'),
          hostname: z.string().describe('Record hostname'),
          recordType: z.string().describe('Record type'),
          value: z.string().describe('Record value')
        })
        .optional()
        .describe('Created DNS record (returned for create action)'),
      deleted: z
        .boolean()
        .optional()
        .describe('Whether the record was deleted (returned for delete action)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    switch (ctx.input.action) {
      case 'list': {
        let records = await client.listDnsRecords(ctx.input.zoneId);
        let mapped = records.map((r: any) => ({
          recordId: r.id,
          hostname: r.hostname || '',
          recordType: r.type || '',
          value: r.value || '',
          ttl: r.ttl,
          priority: r.priority
        }));
        return {
          output: { records: mapped },
          message: `Found **${mapped.length}** DNS record(s) in zone **${ctx.input.zoneId}**.`
        };
      }
      case 'create': {
        if (!ctx.input.recordType || !ctx.input.hostname || !ctx.input.value) {
          throw new Error(
            'recordType, hostname, and value are required for creating a DNS record'
          );
        }
        let record = await client.createDnsRecord(ctx.input.zoneId, {
          type: ctx.input.recordType,
          hostname: ctx.input.hostname,
          value: ctx.input.value,
          ttl: ctx.input.ttl,
          priority: ctx.input.priority
        });
        return {
          output: {
            createdRecord: {
              recordId: record.id,
              hostname: record.hostname || '',
              recordType: record.type || '',
              value: record.value || ''
            }
          },
          message: `Created **${ctx.input.recordType}** record for **${ctx.input.hostname}**.`
        };
      }
      case 'delete': {
        if (!ctx.input.recordId) {
          throw new Error('recordId is required for deleting a DNS record');
        }
        await client.deleteDnsRecord(ctx.input.zoneId, ctx.input.recordId);
        return {
          output: { deleted: true },
          message: `Deleted DNS record **${ctx.input.recordId}**.`
        };
      }
    }
  })
  .build();

export let manageDnsZone = SlateTool.create(spec, {
  name: 'Manage DNS Zone',
  key: 'manage_dns_zone',
  description: `Create or delete a Netlify DNS zone. Use this to set up DNS management for a domain.`
})
  .input(
    z.object({
      action: z.enum(['create', 'delete']).describe('Action to perform'),
      zoneId: z.string().optional().describe('DNS zone ID (required for delete)'),
      name: z.string().optional().describe('Domain name for the zone (required for create)'),
      accountSlug: z.string().optional().describe('Account/team slug (required for create)')
    })
  )
  .output(
    z.object({
      zone: z
        .object({
          zoneId: z.string().describe('DNS zone identifier'),
          name: z.string().describe('Zone domain name')
        })
        .optional()
        .describe('Created zone (returned for create action)'),
      deleted: z.boolean().optional().describe('Whether the zone was deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    switch (ctx.input.action) {
      case 'create': {
        if (!ctx.input.name || !ctx.input.accountSlug) {
          throw new Error('name and accountSlug are required for creating a DNS zone');
        }
        let zone = await client.createDnsZone({
          name: ctx.input.name,
          account_slug: ctx.input.accountSlug
        });
        return {
          output: {
            zone: {
              zoneId: zone.id,
              name: zone.name || ''
            }
          },
          message: `Created DNS zone for **${ctx.input.name}**.`
        };
      }
      case 'delete': {
        if (!ctx.input.zoneId) {
          throw new Error('zoneId is required for deleting a DNS zone');
        }
        await client.deleteDnsZone(ctx.input.zoneId);
        return {
          output: { deleted: true },
          message: `Deleted DNS zone **${ctx.input.zoneId}**.`
        };
      }
    }
  })
  .build();
