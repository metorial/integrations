import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { AnalyticsAdminClient } from './lib/client';
import { provider } from './index';

type GoogleAnalyticsConfig = {
  propertyId?: string;
};

type GoogleAnalyticsHelpers = {
  adminClient: AnalyticsAdminClient;
};

type GoogleAnalyticsContext = ToolE2EContext<Record<string, never>, GoogleAnalyticsHelpers>;
type GoogleAnalyticsProfileContext = {
  profile: GoogleAnalyticsContext['profile'];
};

let e2ePrefix = 'slates-e2e:google-analytics:';

let lastPathSegment = (value?: string | null) =>
  typeof value === 'string' && value.length > 0
    ? value.split('/').filter(Boolean).at(-1)
    : undefined;

let requireDefined = <T>(value: T | null | undefined, message: string): T => {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
  return value;
};

let requireResourceId = (resourceName: string | undefined, label: string) => {
  let id = lastPathSegment(resourceName);
  if (!id) {
    throw new Error(`${label} did not return a resource name.`);
  }
  return id;
};

let compactRunId = (runId: string) =>
  runId.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(-12) || 'e2e';

let createAnalyticsIdentifier = (runId: string, label: string, maxLength = 40) => {
  let value = `${label}_${compactRunId(runId)}`
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!/^[a-z]/.test(value)) {
    value = `ga_${value}`;
  }

  return value.slice(0, maxLength).replace(/_+$/g, '');
};

let createMeasurementClientId = (runId: string) => {
  let digits = runId.replace(/\D+/g, '').slice(-20).padStart(20, '0');
  return `${digits.slice(0, 10)}.${digits.slice(10)}`;
};

let createWebStreamUri = (runId: string, label: string) =>
  `https://${createAnalyticsIdentifier(runId, label, 24)}.example.com`;

let formatDate = (value: Date) => value.toISOString().slice(0, 10);

let createRecentDateRange = (daysBack: number) => {
  let end = new Date();
  let start = new Date(end);
  start.setUTCDate(start.getUTCDate() - daysBack);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
};

let getConfiguredPropertyId = (ctx: GoogleAnalyticsProfileContext) => {
  let config = ctx.profile.config as GoogleAnalyticsConfig | null;
  let propertyId = config?.propertyId;

  if (typeof propertyId !== 'string' || propertyId.length === 0) {
    throw new Error('The selected profile must include a Google Analytics propertyId.');
  }

  return propertyId;
};

let getConfiguredPropertyName = (ctx: GoogleAnalyticsProfileContext) =>
  `properties/${lastPathSegment(getConfiguredPropertyId(ctx)) ?? getConfiguredPropertyId(ctx)}`;

let isOwnedDisplayName = (value?: string | null) =>
  typeof value === 'string' && value.startsWith(e2ePrefix);

let assertNamedItem = (
  items: Array<{ name?: string }> | undefined,
  expectedName: string,
  label: string
) => {
  if (!items?.some(item => item.name === expectedName)) {
    throw new Error(`${label} did not include ${expectedName}.`);
  }
};

let keyEventEventName = (runId: string) => createAnalyticsIdentifier(runId, 'slates_key_event');

let createAudienceFilterClauses = (eventName: string) => [
  {
    clauseType: 'INCLUDE',
    simpleFilter: {
      scope: 'AUDIENCE_FILTER_SCOPE_ACROSS_ALL_SESSIONS',
      filterExpression: {
        dimensionOrMetricFilter: {
          fieldName: 'eventName',
          stringFilter: {
            matchType: 'EXACT',
            value: eventName
          },
          atAnyPointInTime: true
        }
      }
    }
  }
];

let archiveOwnedItems = async (
  items: Array<{ name?: string; displayName?: string }> | undefined,
  archive: (id: string) => Promise<unknown>
) => {
  for (let item of items ?? []) {
    if (!isOwnedDisplayName(item.displayName)) {
      continue;
    }

    let id = lastPathSegment(item.name);
    if (!id) {
      continue;
    }

    await archive(id);
  }
};

export let googleAnalyticsToolE2E = defineSlateToolE2EIntegration<
  Record<string, never>,
  GoogleAnalyticsHelpers
>({
  createHelpers: ctx => ({
    adminClient: new AnalyticsAdminClient({
      token: String(ctx.auth.token),
      propertyId: getConfiguredPropertyId(ctx)
    })
  }),
  beforeSuite: async ctx => {
    getConfiguredPropertyId(ctx);

    if (typeof ctx.auth.token !== 'string' || ctx.auth.token.length === 0) {
      throw new Error(
        'The selected profile must include an OAuth access token for GA4 Data/Admin tools.'
      );
    }

    if (
      typeof ctx.auth.measurementId !== 'string' ||
      ctx.auth.measurementId.length === 0 ||
      typeof ctx.auth.apiSecret !== 'string' ||
      ctx.auth.apiSecret.length === 0
    ) {
      throw new Error(
        'The selected profile must also include measurementId and apiSecret for Measurement Protocol tools.'
      );
    }
  },
  resources: {
    data_stream: {
      create: async ctx => {
        let input = {
          action: 'create' as const,
          streamType: 'WEB_DATA_STREAM' as const,
          displayName: ctx.namespaced('data stream'),
          webStreamData: {
            defaultUri: createWebStreamUri(ctx.runId, 'stream')
          }
        };
        let result = await ctx.invokeTool('manage_data_streams', input);
        let dataStream = requireDefined(
          result.output.dataStream,
          'manage_data_streams create did not return a data stream.'
        );

        return {
          ...dataStream,
          dataStreamId: requireResourceId(dataStream.name, 'manage_data_streams create')
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.dataStreamId !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_data_streams', {
            action: 'delete',
            dataStreamId: value.dataStreamId
          });
        }
      }
    },
    measurement_protocol_secret: {
      use: ['data_stream'],
      create: async ctx => {
        let dataStream = ctx.resource('data_stream');
        let input = {
          action: 'create_secret' as const,
          dataStreamId: String(dataStream.dataStreamId),
          secretDisplayName: ctx.namespaced('measurement protocol secret')
        };
        let result = await ctx.invokeTool('manage_data_streams', input);
        let secret = requireDefined(
          result.output.secret,
          'manage_data_streams create_secret did not return a secret.'
        );

        return {
          ...secret,
          dataStreamId: String(dataStream.dataStreamId),
          secretId: requireResourceId(secret.name, 'manage_data_streams create_secret')
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.dataStreamId !== 'string' ||
            typeof value.secretId !== 'string'
          ) {
            return;
          }

          await ctx.helpers.adminClient.deleteMeasurementProtocolSecret(
            value.dataStreamId,
            value.secretId
          );
        }
      }
    },
    custom_dimension: {
      create: async ctx => {
        let input = {
          action: 'create' as const,
          parameterName: createAnalyticsIdentifier(ctx.runId, 'slates_dimension'),
          displayName: ctx.namespaced('custom dimension'),
          description: `Created by ${ctx.runId}`,
          scope: 'EVENT' as const
        };
        let result = await ctx.invokeTool('manage_custom_dimensions', input);
        let customDimension = requireDefined(
          result.output.customDimension,
          'manage_custom_dimensions create did not return a custom dimension.'
        );

        return {
          ...customDimension,
          customDimensionId: requireResourceId(
            customDimension.name,
            'manage_custom_dimensions create'
          )
        };
      },
      cleanup: {
        kind: 'soft',
        run: async (ctx, value) => {
          if (typeof value.customDimensionId !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_custom_dimensions', {
            action: 'archive',
            customDimensionId: value.customDimensionId
          });
        }
      },
      janitor: async ctx => {
        let result = await ctx.helpers.adminClient.listCustomDimensions({ pageSize: 200 });
        await archiveOwnedItems(result.customDimensions, id =>
          ctx.helpers.adminClient.archiveCustomDimension(id)
        );
      }
    },
    custom_metric: {
      create: async ctx => {
        let input = {
          action: 'create' as const,
          parameterName: createAnalyticsIdentifier(ctx.runId, 'slates_metric'),
          displayName: ctx.namespaced('custom metric'),
          description: `Created by ${ctx.runId}`,
          scope: 'EVENT' as const,
          measurementUnit: 'STANDARD' as const
        };
        let result = await ctx.invokeTool('manage_custom_metrics', input);
        let customMetric = requireDefined(
          result.output.customMetric,
          'manage_custom_metrics create did not return a custom metric.'
        );

        return {
          ...customMetric,
          customMetricId: requireResourceId(customMetric.name, 'manage_custom_metrics create')
        };
      },
      cleanup: {
        kind: 'soft',
        run: async (ctx, value) => {
          if (typeof value.customMetricId !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_custom_metrics', {
            action: 'archive',
            customMetricId: value.customMetricId
          });
        }
      },
      janitor: async ctx => {
        let result = await ctx.helpers.adminClient.listCustomMetrics({ pageSize: 200 });
        await archiveOwnedItems(result.customMetrics, id =>
          ctx.helpers.adminClient.archiveCustomMetric(id)
        );
      }
    },
    key_event: {
      create: async ctx => {
        let eventName = keyEventEventName(ctx.runId);
        await ctx.invokeTool('send_events', {
          clientId: createMeasurementClientId(ctx.runId),
          events: [
            {
              name: eventName,
              params: {
                engagement_time_msec: 1000,
                source: 'slates_e2e'
              }
            }
          ]
        });

        let result = await ctx.invokeTool('manage_key_events', {
          action: 'create',
          eventName,
          countingMethod: 'ONCE_PER_EVENT'
        });
        let keyEvent = requireDefined(
          result.output.keyEvent,
          'manage_key_events create did not return a key event.'
        );

        return {
          ...keyEvent,
          eventName,
          keyEventId: requireResourceId(keyEvent.name, 'manage_key_events create')
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.keyEventId !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_key_events', {
            action: 'delete',
            keyEventId: value.keyEventId
          });
        }
      }
    },
    audience: {
      use: ['key_event'],
      create: async ctx => {
        let keyEvent = ctx.resource('key_event');
        let input = {
          action: 'create' as const,
          displayName: ctx.namespaced('audience'),
          description: `Created by ${ctx.runId}`,
          membershipDurationDays: 30,
          filterClauses: createAudienceFilterClauses(String(keyEvent.eventName))
        };
        let result = await ctx.invokeTool('manage_audiences', input);
        let audience = requireDefined(
          result.output.audience,
          'manage_audiences create did not return an audience.'
        );

        return {
          ...audience,
          audienceId: requireResourceId(audience.name, 'manage_audiences create')
        };
      },
      cleanup: {
        kind: 'soft',
        run: async (ctx, value) => {
          if (typeof value.audienceId !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_audiences', {
            action: 'archive',
            audienceId: value.audienceId
          });
        }
      },
      janitor: async ctx => {
        let result = await ctx.helpers.adminClient.listAudiences({ pageSize: 200 });
        await archiveOwnedItems(result.audiences, id =>
          ctx.helpers.adminClient.archiveAudience(id)
        );
      }
    }
  },
  scenarioOverrides: {
    run_report: {
      name: 'run_report queries recent active users by day',
      run: async ctx => {
        await ctx.invokeTool('run_report', {
          dateRanges: [createRecentDateRange(14)],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [
            {
              dimension: {
                dimensionName: 'date'
              },
              desc: true
            }
          ],
          limit: 7
        });
      }
    },
    run_realtime_report: {
      name: 'run_realtime_report queries current active users',
      run: async ctx => {
        await ctx.invokeTool('run_realtime_report', {
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }],
          limit: 5
        });
      }
    },
    run_funnel_report: {
      name: 'run_funnel_report queries a simple session funnel',
      run: async ctx => {
        await ctx.invokeTool('run_funnel_report', {
          dateRanges: [createRecentDateRange(30)],
          steps: [
            {
              name: 'Session start',
              filterExpression: {
                funnelEventFilter: {
                  eventName: 'session_start'
                }
              },
              isOpenFunnel: true
            },
            {
              name: 'User engagement',
              filterExpression: {
                funnelEventFilter: {
                  eventName: 'user_engagement'
                }
              },
              withinDurationFromPriorStep: '3600s'
            }
          ]
        });
      }
    },
    send_events: {
      name: 'send_events sends a namespaced measurement protocol event',
      run: async ctx => {
        let result = await ctx.invokeTool('send_events', {
          clientId: createMeasurementClientId(ctx.runId),
          events: [
            {
              name: keyEventEventName(ctx.runId),
              params: {
                engagement_time_msec: 1000,
                source: 'slates_e2e'
              }
            }
          ]
        });

        if (!result.output.success || result.output.eventCount !== 1) {
          throw new Error('send_events did not confirm that exactly one event was sent.');
        }
      }
    },
    validate_events: {
      name: 'validate_events accepts a valid measurement protocol payload',
      run: async ctx => {
        let result = await ctx.invokeTool('validate_events', {
          clientId: createMeasurementClientId(`${ctx.runId}-validate`),
          events: [
            {
              name: createAnalyticsIdentifier(ctx.runId, 'slates_validate_event'),
              params: {
                engagement_time_msec: 1000,
                source: 'slates_e2e'
              }
            }
          ]
        });

        if (!result.output.valid) {
          throw new Error(
            `validate_events reported issues: ${JSON.stringify(
              result.output.validationMessages ?? []
            )}`
          );
        }
      }
    },
    get_metadata: {
      name: 'get_metadata returns the property dimension and metric catalog',
      run: async ctx => {
        await ctx.invokeTool('get_metadata', {});
      }
    },
    list_accounts_and_properties: {
      name: 'list_accounts_and_properties finds the configured property',
      run: async ctx => {
        let accountsResult = await ctx.invokeTool('list_accounts_and_properties', {
          pageSize: 200
        });
        let accounts = accountsResult.output.accounts ?? [];
        if (accounts.length === 0) {
          throw new Error('list_accounts_and_properties did not return any accounts.');
        }

        let configuredPropertyName = getConfiguredPropertyName(ctx);

        for (let account of accounts) {
          let accountId = lastPathSegment(account.name);
          if (!accountId) {
            continue;
          }

          let propertiesResult = await ctx.invokeTool('list_accounts_and_properties', {
            accountId,
            pageSize: 200
          });

          if (
            propertiesResult.output.properties?.some(
              property => property.name === configuredPropertyName
            )
          ) {
            return;
          }
        }

        throw new Error(
          `list_accounts_and_properties did not return the configured property ${configuredPropertyName}.`
        );
      }
    },
    manage_data_streams: {
      name: 'manage_data_streams exercises stream and secret lifecycle actions',
      use: ['data_stream', 'measurement_protocol_secret'],
      run: async ctx => {
        let dataStream = ctx.resource('data_stream');
        let secret = ctx.resource('measurement_protocol_secret');

        let list = await ctx.invokeTool('manage_data_streams', {
          action: 'list',
          pageSize: 200
        });
        assertNamedItem(
          list.output.dataStreams,
          String(dataStream.name),
          'manage_data_streams list'
        );

        let get = await ctx.invokeTool('manage_data_streams', {
          action: 'get',
          dataStreamId: String(dataStream.dataStreamId)
        });
        if (get.output.dataStream?.name !== String(dataStream.name)) {
          throw new Error('manage_data_streams get did not return the tracked data stream.');
        }

        let updatedDisplayName = ctx.namespaced('data stream updated');
        let update = await ctx.invokeTool('manage_data_streams', {
          action: 'update',
          dataStreamId: String(dataStream.dataStreamId),
          displayName: updatedDisplayName
        });
        ctx.updateResource('data_stream', {
          ...update.output.dataStream,
          displayName: update.output.dataStream?.displayName ?? updatedDisplayName
        });

        let listSecrets = await ctx.invokeTool('manage_data_streams', {
          action: 'list_secrets',
          dataStreamId: String(dataStream.dataStreamId),
          pageSize: 50
        });
        assertNamedItem(
          listSecrets.output.secrets,
          String(secret.name),
          'manage_data_streams list_secrets'
        );

        let disposable = await ctx.invokeTool('manage_data_streams', {
          action: 'create',
          streamType: 'WEB_DATA_STREAM',
          displayName: ctx.namespaced('data stream disposable'),
          webStreamData: {
            defaultUri: createWebStreamUri(ctx.runId, 'stream_disposable')
          }
        });
        let disposableName = requireDefined(
          disposable.output.dataStream?.name,
          'manage_data_streams create did not return a disposable data stream.'
        );
        let disposableId = requireResourceId(disposableName, 'manage_data_streams create');

        let deleted = await ctx.invokeTool('manage_data_streams', {
          action: 'delete',
          dataStreamId: disposableId
        });
        if (!deleted.output.deleted) {
          throw new Error('manage_data_streams delete did not confirm deletion.');
        }
      }
    },
    manage_custom_dimensions: {
      name: 'manage_custom_dimensions lists, updates, and archives dimensions',
      use: ['custom_dimension'],
      run: async ctx => {
        let customDimension = ctx.resource('custom_dimension');

        let list = await ctx.invokeTool('manage_custom_dimensions', {
          action: 'list',
          pageSize: 200
        });
        assertNamedItem(
          list.output.customDimensions,
          String(customDimension.name),
          'manage_custom_dimensions list'
        );

        let updatedDisplayName = ctx.namespaced('custom dimension updated');
        let update = await ctx.invokeTool('manage_custom_dimensions', {
          action: 'update',
          customDimensionId: String(customDimension.customDimensionId),
          displayName: updatedDisplayName,
          description: `Updated by ${ctx.runId}`
        });
        ctx.updateResource('custom_dimension', {
          ...update.output.customDimension,
          displayName: update.output.customDimension?.displayName ?? updatedDisplayName,
          description: update.output.customDimension?.description ?? `Updated by ${ctx.runId}`
        });

        let disposable = await ctx.invokeTool('manage_custom_dimensions', {
          action: 'create',
          parameterName: createAnalyticsIdentifier(ctx.runId, 'slates_dimension_disposable'),
          displayName: ctx.namespaced('custom dimension disposable'),
          description: `Created by ${ctx.runId}`,
          scope: 'EVENT'
        });
        let disposableName = requireDefined(
          disposable.output.customDimension?.name,
          'manage_custom_dimensions create did not return a disposable custom dimension.'
        );
        let disposableId = requireResourceId(
          disposableName,
          'manage_custom_dimensions create'
        );

        let archived = await ctx.invokeTool('manage_custom_dimensions', {
          action: 'archive',
          customDimensionId: disposableId
        });
        if (!archived.output.archived) {
          throw new Error('manage_custom_dimensions archive did not confirm archival.');
        }
      }
    },
    manage_custom_metrics: {
      name: 'manage_custom_metrics lists, updates, and archives metrics',
      use: ['custom_metric'],
      run: async ctx => {
        let customMetric = ctx.resource('custom_metric');

        let list = await ctx.invokeTool('manage_custom_metrics', {
          action: 'list',
          pageSize: 200
        });
        assertNamedItem(
          list.output.customMetrics,
          String(customMetric.name),
          'manage_custom_metrics list'
        );

        let updatedDisplayName = ctx.namespaced('custom metric updated');
        let update = await ctx.invokeTool('manage_custom_metrics', {
          action: 'update',
          customMetricId: String(customMetric.customMetricId),
          displayName: updatedDisplayName,
          description: `Updated by ${ctx.runId}`
        });
        ctx.updateResource('custom_metric', {
          ...update.output.customMetric,
          displayName: update.output.customMetric?.displayName ?? updatedDisplayName,
          description: update.output.customMetric?.description ?? `Updated by ${ctx.runId}`
        });

        let disposable = await ctx.invokeTool('manage_custom_metrics', {
          action: 'create',
          parameterName: createAnalyticsIdentifier(ctx.runId, 'slates_metric_disposable'),
          displayName: ctx.namespaced('custom metric disposable'),
          description: `Created by ${ctx.runId}`,
          scope: 'EVENT',
          measurementUnit: 'STANDARD'
        });
        let disposableName = requireDefined(
          disposable.output.customMetric?.name,
          'manage_custom_metrics create did not return a disposable custom metric.'
        );
        let disposableId = requireResourceId(disposableName, 'manage_custom_metrics create');

        let archived = await ctx.invokeTool('manage_custom_metrics', {
          action: 'archive',
          customMetricId: disposableId
        });
        if (!archived.output.archived) {
          throw new Error('manage_custom_metrics archive did not confirm archival.');
        }
      }
    },
    manage_key_events: {
      name: 'manage_key_events lists, gets, updates, and deletes key events',
      use: ['key_event'],
      run: async ctx => {
        let keyEvent = ctx.resource('key_event');

        let list = await ctx.invokeTool('manage_key_events', {
          action: 'list',
          pageSize: 200
        });
        assertNamedItem(list.output.keyEvents, String(keyEvent.name), 'manage_key_events list');

        let get = await ctx.invokeTool('manage_key_events', {
          action: 'get',
          keyEventId: String(keyEvent.keyEventId)
        });
        if (get.output.keyEvent?.name !== String(keyEvent.name)) {
          throw new Error('manage_key_events get did not return the tracked key event.');
        }

        let update = await ctx.invokeTool('manage_key_events', {
          action: 'update',
          keyEventId: String(keyEvent.keyEventId),
          countingMethod: 'ONCE_PER_SESSION'
        });
        ctx.updateResource('key_event', {
          ...update.output.keyEvent,
          countingMethod:
            update.output.keyEvent?.countingMethod ?? 'ONCE_PER_SESSION'
        });

        let disposableEventName = createAnalyticsIdentifier(
          ctx.runId,
          'slates_key_event_disposable'
        );
        await ctx.invokeTool('send_events', {
          clientId: createMeasurementClientId(`${ctx.runId}-disposable`),
          events: [
            {
              name: disposableEventName,
              params: {
                engagement_time_msec: 1000,
                source: 'slates_e2e'
              }
            }
          ]
        });

        let created = await ctx.invokeTool('manage_key_events', {
          action: 'create',
          eventName: disposableEventName
        });
        let disposableName = requireDefined(
          created.output.keyEvent?.name,
          'manage_key_events create did not return a disposable key event.'
        );
        let disposableId = requireResourceId(disposableName, 'manage_key_events create');

        let deleted = await ctx.invokeTool('manage_key_events', {
          action: 'delete',
          keyEventId: disposableId
        });
        if (!deleted.output.deleted) {
          throw new Error('manage_key_events delete did not confirm deletion.');
        }
      }
    },
    manage_audiences: {
      name: 'manage_audiences lists, updates, and archives audiences',
      use: ['audience', 'key_event'],
      run: async ctx => {
        let audience = ctx.resource('audience');
        let keyEvent = ctx.resource('key_event');

        let list = await ctx.invokeTool('manage_audiences', {
          action: 'list',
          pageSize: 200
        });
        assertNamedItem(list.output.audiences, String(audience.name), 'manage_audiences list');

        let updatedDisplayName = ctx.namespaced('audience updated');
        let update = await ctx.invokeTool('manage_audiences', {
          action: 'update',
          audienceId: String(audience.audienceId),
          displayName: updatedDisplayName,
          description: `Updated by ${ctx.runId}`
        });
        ctx.updateResource('audience', {
          ...update.output.audience,
          displayName: update.output.audience?.displayName ?? updatedDisplayName,
          description: update.output.audience?.description ?? `Updated by ${ctx.runId}`
        });

        let disposable = await ctx.invokeTool('manage_audiences', {
          action: 'create',
          displayName: ctx.namespaced('audience disposable'),
          description: `Created by ${ctx.runId}`,
          membershipDurationDays: 30,
          filterClauses: createAudienceFilterClauses(String(keyEvent.eventName))
        });
        let disposableName = requireDefined(
          disposable.output.audience?.name,
          'manage_audiences create did not return a disposable audience.'
        );
        let disposableId = requireResourceId(disposableName, 'manage_audiences create');

        let archived = await ctx.invokeTool('manage_audiences', {
          action: 'archive',
          audienceId: disposableId
        });
        if (!archived.output.archived) {
          throw new Error('manage_audiences archive did not confirm archival.');
        }
      }
    },
    audit_data_access: {
      name: 'audit_data_access runs a recent property access report',
      run: async ctx => {
        let range = createRecentDateRange(30);
        await ctx.invokeTool('audit_data_access', {
          startDate: range.startDate,
          endDate: range.endDate,
          limit: 25
        });
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleAnalyticsToolE2E
});
