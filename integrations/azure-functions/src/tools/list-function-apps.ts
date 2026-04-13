import { SlateTool } from 'slates';
import { ArmClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let functionAppSummarySchema = z.object({
  appName: z.string().describe('Name of the function app'),
  resourceId: z.string().describe('Full ARM resource ID'),
  location: z.string().describe('Azure region where the app is hosted'),
  state: z.string().optional().describe('Current state of the app (e.g. Running, Stopped)'),
  defaultHostName: z.string().optional().describe('Default hostname for the function app'),
  kind: z.string().optional().describe('Resource kind (e.g. functionapp, functionapp,linux)'),
  runtimeVersion: z.string().optional().describe('Functions runtime version'),
  tags: z.record(z.string(), z.string()).optional().describe('Resource tags'),
});

export let listFunctionApps = SlateTool.create(
  spec,
  {
    name: 'List Function Apps',
    key: 'list_function_apps',
    description: `List all Azure Function Apps in the configured resource group. Returns a summary of each function app including its name, location, state, and hostname. Useful for discovering available function apps before performing further operations.`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({}))
  .output(z.object({
    functionApps: z.array(functionAppSummarySchema).describe('List of function apps'),
    count: z.number().describe('Total number of function apps found'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new ArmClient({
      token: ctx.auth.token,
      subscriptionId: ctx.config.subscriptionId,
      resourceGroupName: ctx.config.resourceGroupName,
    });

    ctx.info('Listing function apps in resource group: ' + ctx.config.resourceGroupName);

    let apps = await client.listFunctionApps();

    let functionApps = apps.map((app: any) => ({
      appName: app.name,
      resourceId: app.id,
      location: app.location,
      state: app.properties?.state,
      defaultHostName: app.properties?.defaultHostName,
      kind: app.kind,
      runtimeVersion: app.properties?.siteConfig?.functionsRuntimeScaleMonitoringEnabled,
      tags: app.tags,
    }));

    return {
      output: {
        functionApps,
        count: functionApps.length,
      },
      message: `Found **${functionApps.length}** function app(s) in resource group **${ctx.config.resourceGroupName}**.${functionApps.length > 0 ? '\n\nApps: ' + functionApps.map((a: any) => `\`${a.appName}\` (${a.state || 'unknown'})`).join(', ') : ''}`,
    };
  }).build();
