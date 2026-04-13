import { SlateTool } from 'slates';
import { ClickHouseClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

// ── Dashboards ──────────────────────────────────────────

export let listDashboards = SlateTool.create(spec, {
  name: 'List ClickStack Dashboards',
  key: 'list_clickstack_dashboards',
  description: `List all ClickStack observability dashboards for a service. ClickStack is the built-in observability platform for ClickHouse Cloud.`,
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
      dashboards: z.array(
        z.object({
          dashboardId: z.string(),
          name: z.string().optional(),
          tags: z.array(z.string()).optional()
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let dashboards = await client.listDashboards(ctx.input.serviceId);
    let items = Array.isArray(dashboards) ? dashboards : [];

    return {
      output: {
        dashboards: items.map((d: any) => ({
          dashboardId: d.id,
          name: d.name,
          tags: d.tags
        }))
      },
      message: `Found **${items.length}** ClickStack dashboards.`
    };
  })
  .build();

export let createDashboard = SlateTool.create(spec, {
  name: 'Create ClickStack Dashboard',
  key: 'create_clickstack_dashboard',
  description: `Create a new ClickStack observability dashboard for a service. Dashboards can contain tiles with charts configured with SQL or Lucene queries and aggregation functions.`
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      name: z.string().describe('Name for the dashboard'),
      tiles: z
        .array(z.record(z.string(), z.any()))
        .optional()
        .describe('Dashboard tiles/chart configurations'),
      tags: z.array(z.string()).optional().describe('Tags to apply to the dashboard')
    })
  )
  .output(
    z.object({
      dashboardId: z.string(),
      name: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let body: Record<string, any> = { name: ctx.input.name };
    if (ctx.input.tiles) body.tiles = ctx.input.tiles;
    if (ctx.input.tags) body.tags = ctx.input.tags;

    let result = await client.createDashboard(ctx.input.serviceId, body);

    return {
      output: {
        dashboardId: result.id,
        name: result.name
      },
      message: `Dashboard **${result.name}** created.`
    };
  })
  .build();

export let deleteDashboard = SlateTool.create(spec, {
  name: 'Delete ClickStack Dashboard',
  key: 'delete_clickstack_dashboard',
  description: `Delete a ClickStack dashboard from a service.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      dashboardId: z.string().describe('ID of the dashboard to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    await client.deleteDashboard(ctx.input.serviceId, ctx.input.dashboardId);

    return {
      output: { deleted: true },
      message: `Dashboard **${ctx.input.dashboardId}** deleted.`
    };
  })
  .build();

// ── Alerts ──────────────────────────────────────────────

export let listAlerts = SlateTool.create(spec, {
  name: 'List ClickStack Alerts',
  key: 'list_clickstack_alerts',
  description: `List all ClickStack alerts configured for a service. Alerts support webhook notifications to services like Slack and PagerDuty.`,
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
      alerts: z.array(
        z.object({
          alertId: z.string(),
          name: z.string().optional(),
          threshold: z.number().optional(),
          thresholdType: z.string().optional(),
          interval: z.string().optional()
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let alerts = await client.listAlerts(ctx.input.serviceId);
    let items = Array.isArray(alerts) ? alerts : [];

    return {
      output: {
        alerts: items.map((a: any) => ({
          alertId: a.id,
          name: a.name,
          threshold: a.threshold,
          thresholdType: a.thresholdType,
          interval: a.interval
        }))
      },
      message: `Found **${items.length}** ClickStack alerts.`
    };
  })
  .build();

export let createAlert = SlateTool.create(spec, {
  name: 'Create ClickStack Alert',
  key: 'create_clickstack_alert',
  description: `Create a new ClickStack alert for a service. Alerts monitor metrics and send notifications via webhooks (Slack, PagerDuty, etc.) when thresholds are breached.`
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      name: z.string().describe('Name for the alert'),
      alertMessage: z.string().optional().describe('Alert notification message'),
      threshold: z.number().describe('Threshold value that triggers the alert'),
      thresholdType: z
        .enum(['above', 'below'])
        .describe('Trigger when metric is above or below threshold'),
      interval: z
        .string()
        .describe('Check interval (e.g., 1m, 5m, 15m, 30m, 1h, 6h, 12h, 1d)'),
      source: z.string().optional().describe('Alert source type (saved_search or tile)'),
      channel: z
        .record(z.string(), z.any())
        .optional()
        .describe('Notification channel configuration (webhook URL and type)'),
      dashboardId: z.string().optional().describe('Dashboard ID the alert is linked to'),
      tileId: z.string().optional().describe('Tile ID the alert monitors')
    })
  )
  .output(
    z.object({
      alertId: z.string(),
      name: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let body: Record<string, any> = {
      name: ctx.input.name,
      threshold: ctx.input.threshold,
      thresholdType: ctx.input.thresholdType,
      interval: ctx.input.interval
    };
    if (ctx.input.alertMessage) body.message = ctx.input.alertMessage;
    if (ctx.input.source) body.source = ctx.input.source;
    if (ctx.input.channel) body.channel = ctx.input.channel;
    if (ctx.input.dashboardId) body.dashboardId = ctx.input.dashboardId;
    if (ctx.input.tileId) body.tileId = ctx.input.tileId;

    let result = await client.createAlert(ctx.input.serviceId, body);

    return {
      output: {
        alertId: result.id,
        name: result.name
      },
      message: `Alert **${result.name}** created.`
    };
  })
  .build();

export let deleteAlert = SlateTool.create(spec, {
  name: 'Delete ClickStack Alert',
  key: 'delete_clickstack_alert',
  description: `Delete a ClickStack alert from a service.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      alertId: z.string().describe('ID of the alert to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    await client.deleteAlert(ctx.input.serviceId, ctx.input.alertId);

    return {
      output: { deleted: true },
      message: `Alert **${ctx.input.alertId}** deleted.`
    };
  })
  .build();
