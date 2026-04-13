import { SlateTool } from 'slates';
import { AnalyticsAdminClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageDataStreams = SlateTool.create(
  spec,
  {
    name: 'Manage Data Streams',
    key: 'manage_data_streams',
    description: `List, get, create, update, or delete data streams on a GA4 property. Data streams represent sources of data flowing into GA4, such as websites (Web) or mobile apps (iOS/Android).

Also supports listing and creating Measurement Protocol secrets for a specific data stream.`,
    tags: {
      destructive: false,
    },
  }
)
  .input(z.object({
    action: z.enum(['list', 'get', 'create', 'update', 'delete', 'list_secrets', 'create_secret']).describe('Action to perform. "list_secrets" and "create_secret" manage Measurement Protocol secrets for a stream.'),
    dataStreamId: z.string().optional().describe('ID of the data stream (required for get, update, delete, list_secrets, and create_secret).'),
    streamType: z.enum(['WEB_DATA_STREAM', 'ANDROID_APP_DATA_STREAM', 'IOS_APP_DATA_STREAM']).optional().describe('Type of data stream (required for create).'),
    webStreamData: z.object({
      defaultUri: z.string().optional().describe('Default URI for the web stream (e.g., "https://example.com").'),
    }).optional().describe('Web stream configuration (for create/update of web streams).'),
    androidAppStreamData: z.object({
      packageName: z.string().optional().describe('Android app package name.'),
    }).optional().describe('Android app stream configuration.'),
    iosAppStreamData: z.object({
      bundleId: z.string().optional().describe('iOS app bundle ID.'),
    }).optional().describe('iOS app stream configuration.'),
    displayName: z.string().optional().describe('Display name for the data stream (for create/update).'),
    secretDisplayName: z.string().optional().describe('Display name for a Measurement Protocol secret (for create_secret).'),
    pageSize: z.number().optional(),
    pageToken: z.string().optional(),
  }))
  .output(z.object({
    dataStreams: z.array(z.object({
      name: z.string().optional(),
      type: z.string().optional(),
      displayName: z.string().optional(),
      webStreamData: z.any().optional(),
      androidAppStreamData: z.any().optional(),
      iosAppStreamData: z.any().optional(),
      createTime: z.string().optional(),
      updateTime: z.string().optional(),
    })).optional(),
    dataStream: z.object({
      name: z.string().optional(),
      type: z.string().optional(),
      displayName: z.string().optional(),
      webStreamData: z.any().optional(),
      androidAppStreamData: z.any().optional(),
      iosAppStreamData: z.any().optional(),
      createTime: z.string().optional(),
      updateTime: z.string().optional(),
    }).optional(),
    secrets: z.array(z.object({
      name: z.string().optional(),
      displayName: z.string().optional(),
      secretValue: z.string().optional(),
    })).optional(),
    secret: z.object({
      name: z.string().optional(),
      displayName: z.string().optional(),
      secretValue: z.string().optional(),
    }).optional(),
    deleted: z.boolean().optional(),
    nextPageToken: z.string().optional(),
  }))
  .handleInvocation(async (ctx) => {
    let client = new AnalyticsAdminClient({
      token: ctx.auth.token,
      propertyId: ctx.config.propertyId,
    });

    let action = ctx.input.action;

    if (action === 'list') {
      let result = await client.listDataStreams({
        pageSize: ctx.input.pageSize,
        pageToken: ctx.input.pageToken,
      });
      let streams = result.dataStreams || [];
      return {
        output: {
          dataStreams: streams,
          nextPageToken: result.nextPageToken,
        },
        message: `Found **${streams.length}** data stream(s).`,
      };
    }

    if (action === 'get') {
      if (!ctx.input.dataStreamId) throw new Error('dataStreamId is required for get action.');
      let result = await client.getDataStream(ctx.input.dataStreamId);
      return {
        output: { dataStream: result },
        message: `Retrieved data stream **${result.displayName}** (${result.type}).`,
      };
    }

    if (action === 'create') {
      if (!ctx.input.streamType || !ctx.input.displayName) {
        throw new Error('streamType and displayName are required for create action.');
      }
      let body: any = {
        type: ctx.input.streamType,
        displayName: ctx.input.displayName,
      };
      if (ctx.input.webStreamData) body.webStreamData = ctx.input.webStreamData;
      if (ctx.input.androidAppStreamData) body.androidAppStreamData = ctx.input.androidAppStreamData;
      if (ctx.input.iosAppStreamData) body.iosAppStreamData = ctx.input.iosAppStreamData;

      let result = await client.createDataStream(body);
      return {
        output: { dataStream: result },
        message: `Created data stream **${result.displayName}** (${result.type}).`,
      };
    }

    if (action === 'update') {
      if (!ctx.input.dataStreamId) throw new Error('dataStreamId is required for update action.');
      let updateFields: string[] = [];
      let body: any = {};
      if (ctx.input.displayName !== undefined) {
        updateFields.push('displayName');
        body.displayName = ctx.input.displayName;
      }
      if (updateFields.length === 0) {
        throw new Error('At least one field (displayName) must be provided for update.');
      }
      let result = await client.updateDataStream(ctx.input.dataStreamId, updateFields.join(','), body);
      return {
        output: { dataStream: result },
        message: `Updated data stream **${result.displayName}**.`,
      };
    }

    if (action === 'delete') {
      if (!ctx.input.dataStreamId) throw new Error('dataStreamId is required for delete action.');
      await client.deleteDataStream(ctx.input.dataStreamId);
      return {
        output: { deleted: true },
        message: `Deleted data stream **${ctx.input.dataStreamId}**.`,
      };
    }

    if (action === 'list_secrets') {
      if (!ctx.input.dataStreamId) throw new Error('dataStreamId is required for list_secrets action.');
      let result = await client.listMeasurementProtocolSecrets(ctx.input.dataStreamId, {
        pageSize: ctx.input.pageSize,
        pageToken: ctx.input.pageToken,
      });
      let secrets = result.measurementProtocolSecrets || [];
      return {
        output: {
          secrets,
          nextPageToken: result.nextPageToken,
        },
        message: `Found **${secrets.length}** Measurement Protocol secret(s) for data stream ${ctx.input.dataStreamId}.`,
      };
    }

    if (action === 'create_secret') {
      if (!ctx.input.dataStreamId || !ctx.input.secretDisplayName) {
        throw new Error('dataStreamId and secretDisplayName are required for create_secret action.');
      }
      let result = await client.createMeasurementProtocolSecret(ctx.input.dataStreamId, {
        displayName: ctx.input.secretDisplayName,
      });
      return {
        output: { secret: result },
        message: `Created Measurement Protocol secret **${result.displayName}**.`,
      };
    }

    throw new Error(`Unknown action: ${action}`);
  })
  .build();
