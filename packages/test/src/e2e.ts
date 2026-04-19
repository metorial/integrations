import type { SlatesProfileRecord } from '@slates/profiles';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createLocalSlateTestClient,
  createSlatesTestClient,
  getVitestExpect,
  loadSlatesProfile,
  type SlatesTestClient
} from './runtime';

type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = {
  success: false;
  error: { issues?: Array<{ path?: Array<PropertyKey>; message?: string }> };
};

export type SlateValidationSchema<T = unknown> = {
  safeParse(input: unknown): ValidationSuccess<T> | ValidationFailure;
  toJSONSchema?(options?: Record<string, any>): Record<string, any>;
};

type JsonSchema = {
  type?: string;
  enum?: any[];
  default?: any;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  additionalProperties?: JsonSchema | boolean;
  format?: string;
};

type LocalSlate = Parameters<typeof createLocalSlateTestClient>[0]['slate'];
type LocalTool = Extract<LocalSlate['actions'][number], { type: 'tool' }>;

export interface CleanupTask {
  label?: string;
  run(): Promise<void>;
}

export interface TrackedSlateToolResource {
  name: string;
  value: Record<string, any>;
  deleted: boolean;
  managed: boolean;
  source: 'fixture' | 'tool' | 'list' | 'custom';
  toolId?: string;
  input?: Record<string, any>;
}

export interface ToolResourceCleanup<Fixtures = Record<string, any>, Helpers = unknown> {
  kind: 'delete' | 'soft';
  run(
    ctx: ToolE2EContext<Fixtures, Helpers>,
    value: Record<string, any>,
    resource: TrackedSlateToolResource
  ): Promise<void>;
}

export interface ToolResourceDefinition<Fixtures = Record<string, any>, Helpers = unknown> {
  use?: string[];
  fromFixture?(
    ctx: ToolE2EContext<Fixtures, Helpers>
  ): Promise<Record<string, any>> | Record<string, any>;
  create?(
    ctx: ToolE2EContext<Fixtures, Helpers>
  ): Promise<Record<string, any>> | Record<string, any>;
  cleanup?: ToolResourceCleanup<Fixtures, Helpers>;
  janitor?: (ctx: ToolE2EContext<Fixtures, Helpers>) => Promise<void>;
}

export interface ToolScenarioResult {
  provide?: Record<string, Record<string, any>>;
}

export interface ToolE2EContext<Fixtures = Record<string, any>, Helpers = unknown> {
  integrationKey: string;
  client: SlatesTestClient;
  profile: Awaited<ReturnType<typeof loadSlatesProfile>>;
  auth: Record<string, any>;
  runId: string;
  fixtures: Fixtures;
  helpers: Helpers;
  invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
  getTool(toolId: string): LocalTool;
  resource(name: string): Record<string, any>;
  listResources(name?: string): TrackedSlateToolResource[];
  updateResource(name: string, value: Record<string, any>): TrackedSlateToolResource;
  deleteResource(name: string): void;
  registerCleanup(task: CleanupTask | (() => Promise<void>), label?: string): void;
  namespaced(label: string): string;
}

export interface ToolScenario<Fixtures = Record<string, any>, Helpers = unknown> {
  name?: string;
  use?: string[];
  run(ctx: ToolE2EContext<Fixtures, Helpers>): Promise<void | ToolScenarioResult>;
}

export type ToolScenarioOverride<Fixtures = Record<string, any>, Helpers = unknown> =
  | ToolScenario<Fixtures, Helpers>
  | ToolScenario<Fixtures, Helpers>[];

export interface SlateToolE2EIntegration<
  Fixtures = Record<string, any>,
  Helpers = unknown
> {
  fixturesSchema?: SlateValidationSchema<Fixtures>;
  createHelpers?: (
    ctx: Omit<ToolE2EContext<Fixtures, Helpers>, 'helpers'>
  ) => Promise<Helpers> | Helpers;
  resources?: Record<string, ToolResourceDefinition<Fixtures, Helpers>>;
  scenarioOverrides?: Record<string, ToolScenarioOverride<Fixtures, Helpers>>;
  beforeSuite?: (ctx: ToolE2EContext<Fixtures, Helpers>) => Promise<void>;
  afterSuite?: (ctx: ToolE2EContext<Fixtures, Helpers>) => Promise<void>;
}

export let defineSlateToolE2EIntegration = <
  Fixtures = Record<string, any>,
  Helpers = unknown
>(
  integration: SlateToolE2EIntegration<Fixtures, Helpers>
) => integration;

type ScopeCoverageFailure = {
  toolId: string;
  missingClauses: string[][];
};

type BuildInputResult = {
  input: Record<string, any>;
  verification?: {
    field: string;
    value: any;
  };
};

type ResourceEnsureMeta = {
  resourceDef?: ToolResourceDefinition<any, any>;
  source: TrackedSlateToolResource['source'];
  toolId?: string;
  input?: Record<string, any>;
  created: boolean;
};

let formatValidationIssues = (error: ValidationFailure['error'] | undefined) =>
  (error?.issues ?? [])
    .map(issue => {
      let path = issue.path?.length ? issue.path.join('.') : '<root>';
      return `${path}: ${issue.message ?? 'Invalid value'}`;
    })
    .join('; ');

export let validateWithSchema = <T>(
  schema: SlateValidationSchema<T>,
  value: unknown,
  label: string
): T => {
  let result = schema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  let details = formatValidationIssues(result.error);
  throw new Error(`${label} validation failed${details ? `: ${details}` : '.'}`);
};

let validateProfileConfig = (
  provider: LocalSlate,
  profile: SlatesProfileRecord
) => {
  let rawConfig =
    profile.config ??
    provider.spec.config.handlers.getDefaultConfig?.() ??
    {};
  let result = provider.spec.configSchema.safeParse(rawConfig);
  if (result.success) {
    return result.data as Record<string, any>;
  }

  let details = formatValidationIssues(result.error as ValidationFailure['error']);
  throw new Error(
    `Missing or invalid provider config for live E2E tools (${provider.spec.key}). ` +
      `Run \`bun run integrations:cli -- ${provider.spec.key} config set\`.` +
      (details ? ` Details: ${details}` : '')
  );
};

export let parseE2EFixtures = <T>(
  schema: SlateValidationSchema<T> | undefined,
  rawFixtures: unknown
) => {
  if (!schema) {
    return (rawFixtures ?? {}) as T;
  }
  return validateWithSchema(schema, rawFixtures ?? {}, 'fixtures');
};

let schemaToJson = (schema: SlateValidationSchema<any>): JsonSchema => {
  if (!schema.toJSONSchema) {
    return {};
  }

  try {
    return schema.toJSONSchema({
      unrepresentable: 'any',
      override: (ctx: {
        zodSchema?: { _zod?: { def?: { type?: string } } };
        jsonSchema: Record<string, any>;
      }) => {
        let def = ctx.zodSchema?._zod?.def;
        if (def?.type === 'date') {
          ctx.jsonSchema.type = 'string';
          ctx.jsonSchema.format = 'date-time';
        }
        if (def?.type === 'bigint') {
          ctx.jsonSchema.type = 'number';
        }
      }
    }) as JsonSchema;
  } catch {
    return {};
  }
};

let singularize = (value: string) => {
  if (value.endsWith('ies')) return `${value.slice(0, -3)}y`;
  if (value.endsWith('ses')) return value.slice(0, -2);
  if (value.endsWith('s')) return value.slice(0, -1);
  return value;
};

let camelize = (value: string) =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

let normalizeResourceName = (value: string) => singularize(value.replace(/-/g, '_'));

let parseToolKey = (toolId: string) => {
  let match = /^(create|get|update|delete|list|search)_(.+)$/.exec(toolId);
  if (!match) {
    return null;
  }

  return {
    operation: match[1] as 'create' | 'get' | 'update' | 'delete' | 'list' | 'search',
    family: singularize(match[2]!)
  };
};

let getDefaultScenarioKind = (tool: LocalTool) => {
  if (parseToolKey(tool.key)) {
    return 'crud' as const;
  }

  let schema = schemaToJson(tool.inputSchema);
  if ((schema.required ?? []).length === 0) {
    return 'empty-input' as const;
  }

  return null;
};

let listToolScenarioDefinitions = <
  Fixtures = Record<string, any>,
  Helpers = unknown
>(
  tool: LocalTool,
  integration: SlateToolE2EIntegration<Fixtures, Helpers> | undefined
) => {
  let override = integration?.scenarioOverrides?.[tool.key];
  if (override) {
    return Array.isArray(override) ? override : [override];
  }

  return getDefaultScenarioKind(tool) ? [{ run: async () => {} } as ToolScenario<Fixtures, Helpers>] : [];
};

let createRunId = (integrationKey: string) =>
  `slates-e2e:${integrationKey}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

let preferredIdFieldForName = (name: string) => `${camelize(name)}Id`;

let namespacedEmail = (runId: string) =>
  `${runId.replace(/[^a-z0-9]+/gi, '.').toLowerCase()}@example.com`;

let findTool = (tools: LocalTool[], toolId: string) => {
  let tool = tools.find(candidate => candidate.key === toolId);
  if (!tool) {
    throw new Error(`Unknown tool: ${toolId}`);
  }
  return tool;
};

let getFirstArrayEntry = (output: Record<string, any>) => {
  for (let value of Object.values(output)) {
    if (Array.isArray(value)) {
      return value[0] as Record<string, any> | undefined;
    }
  }
  return undefined;
};

let findArrayField = (output: Record<string, any>) =>
  Object.entries(output).find(([, value]) => Array.isArray(value));

let getIdValue = (name: string, value: Record<string, any>) => {
  let preferredIdField = preferredIdFieldForName(name);
  if (typeof value[preferredIdField] === 'string') {
    return value[preferredIdField] as string;
  }

  if (typeof value.id === 'string') {
    return value.id as string;
  }

  let firstIdField = Object.entries(value).find(
    ([key, item]) => key.endsWith('Id') && typeof item === 'string'
  );
  if (firstIdField) {
    return firstIdField[1] as string;
  }

  if (typeof value.messageTs === 'string') {
    return value.messageTs as string;
  }

  if (typeof value.name === 'string') {
    return value.name as string;
  }

  if (typeof value.title === 'string') {
    return value.title as string;
  }

  return undefined;
};

let getFieldValue = (resourceName: string, value: Record<string, any>, fieldName: string) => {
  if (value[fieldName] !== undefined) {
    return value[fieldName];
  }

  if (fieldName === 'query' || fieldName === 'q') {
    return undefined;
  }

  let preferredIdField = preferredIdFieldForName(resourceName);
  if (fieldName === preferredIdField && value[preferredIdField] !== undefined) {
    return value[preferredIdField];
  }

  if (fieldName === 'id' && value.id !== undefined) {
    return value.id;
  }

  return undefined;
};

let createCalendarTimedRange = (daysFromNow = 3, durationMinutes = 45) => {
  let start = new Date();
  start.setUTCDate(start.getUTCDate() + daysFromNow);
  start.setUTCHours(15, 0, 0, 0);

  let end = new Date(start);
  end.setUTCMinutes(end.getUTCMinutes() + durationMinutes);

  return {
    start: { dateTime: start.toISOString(), timeZone: 'UTC' },
    end: { dateTime: end.toISOString(), timeZone: 'UTC' }
  };
};

let buildScalarFallback = (
  fieldName: string,
  schema: JsonSchema,
  runId: string
): string | number | boolean | undefined => {
  if (schema.default !== undefined) {
    return schema.default;
  }

  if (schema.enum?.length) {
    if (fieldName === 'objectType' && schema.enum.includes('contacts')) return 'contacts';
    if (fieldName === 'engagementType' && schema.enum.includes('notes')) return 'notes';
    if (fieldName === 'processingType' && schema.enum.includes('STATIC')) return 'STATIC';
    return schema.enum[0];
  }

  if (schema.type === 'boolean') {
    return false;
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    if (fieldName === 'postAt') {
      return Math.floor(Date.now() / 1000) + 3600;
    }
    if (fieldName === 'displayOrder') {
      return 1;
    }
    if (fieldName === 'limit' || fieldName === 'first') {
      return 100;
    }
    if (fieldName === 'after') {
      return 0;
    }
    if (fieldName === 'associationTypeId') {
      return 279;
    }
    return 1;
  }

  if (schema.type === 'string') {
    if (fieldName === 'state') return 'planned';
    if (fieldName === 'groupName') return 'contactinformation';
    if (fieldName === 'fieldType') return 'text';
    if (fieldName === 'type') return 'string';
    if (fieldName === 'color') return '#00875A';
    if (fieldName === 'associationCategory') return 'HUBSPOT_DEFINED';
    if (fieldName === 'time') return 'in 30 minutes';
    if (fieldName === 'objectTypeId') return '0-1';
    if (fieldName === 'icon') return ':memo:';
    if (fieldName === 'text') return `${runId} text`;
    if (fieldName === 'title') return `${runId} title`;
    if (fieldName === 'name') return `${runId} name`;
    if (fieldName === 'summary') return `${runId} summary`;
    if (fieldName === 'label') return `${runId} label`;
    if (fieldName === 'description') return `${runId} description`;
    if (fieldName === 'body') return `${runId} body`;
    if (fieldName === 'query' || fieldName === 'q') return runId;
    if (fieldName === 'startsAt') {
      let start = new Date();
      start.setUTCDate(start.getUTCDate() - 21);
      return start.toISOString().slice(0, 10);
    }
    if (fieldName === 'endsAt') {
      let end = new Date();
      end.setUTCDate(end.getUTCDate() - 14);
      return end.toISOString().slice(0, 10);
    }
    if (fieldName.toLowerCase().includes('date')) {
      return new Date().toISOString().slice(0, 10);
    }
    return `${runId} ${fieldName}`;
  }

  return undefined;
};

let fieldResourceMap: Record<string, string> = {
  teamId: 'team',
  ownerId: 'owner',
  userId: 'user',
  assigneeId: 'user',
  channelId: 'channel',
  calendarId: 'calendar',
  projectId: 'project',
  issueId: 'issue',
  commentId: 'comment',
  cycleId: 'cycle',
  labelId: 'label',
  documentId: 'document',
  contactId: 'contact',
  companyId: 'company',
  dealId: 'deal',
  ticketId: 'ticket',
  listId: 'list',
  pipelineId: 'pipeline',
  engagementId: 'engagement',
  eventId: 'event',
  bookmarkId: 'bookmark',
  userGroupId: 'user_group'
};

let buildHubSpotProperties = async (d: {
  tool: LocalTool;
  family: string;
  operation: string;
  runId: string;
  resource: (name: string) => Promise<TrackedSlateToolResource>;
}) => {
  if (d.family === 'contact') {
    if (d.operation === 'update') {
      return {
        firstname: `${d.runId} updated`
      };
    }

    return {
      email: namespacedEmail(d.runId),
      firstname: `${d.runId} contact`,
      lastname: 'E2E'
    };
  }

  if (d.family === 'company') {
    if (d.operation === 'update') {
      return {
        description: `${d.runId} updated company`
      };
    }

    return {
      name: `${d.runId} company`
    };
  }

  if (d.family === 'deal') {
    let pipeline = await d.resource('pipeline');
    let stageId =
      pipeline.value.stages?.[0]?.stageId ??
      pipeline.value.stages?.[0]?.id ??
      pipeline.value.stages?.[0]?.value;

    let base = {
      dealname: `${d.runId} deal`,
      amount: '1000'
    } as Record<string, any>;

    if (pipeline.value.pipelineId) {
      base.pipeline = pipeline.value.pipelineId;
    }
    if (stageId) {
      base.dealstage = stageId;
    }

    if (d.operation === 'update') {
      return {
        amount: '2000'
      };
    }

    return base;
  }

  if (d.family === 'ticket') {
    if (d.operation === 'update') {
      return {
        content: `${d.runId} updated ticket`
      };
    }

    return {
      subject: `${d.runId} ticket`,
      content: 'Created by the automated E2E suite'
    };
  }

  if (d.family === 'engagement' || d.tool.key === 'create_engagement') {
    if (d.operation === 'update') {
      return {
        hs_note_body: `${d.runId} updated note`
      };
    }

    return {
      hs_note_body: `${d.runId} note`,
      hs_timestamp: new Date().toISOString()
    };
  }

  return {
    value: `${d.runId} value`
  };
};

let compareValues = (actual: any, expected: any) => {
  let expect = getVitestExpect();

  if (
    expected &&
    typeof expected === 'object' &&
    !Array.isArray(expected) &&
    actual &&
    typeof actual === 'object' &&
    !Array.isArray(actual)
  ) {
    expect(actual).toMatchObject(expected);
    return;
  }

  expect(actual).toEqual(expected);
};

let assertResourcePresence = (
  toolId: string,
  resourceName: string,
  resource: TrackedSlateToolResource,
  output: Record<string, any>
) => {
  let [, listValue] = findArrayField(output) ?? [];
  let expectedId = getIdValue(resourceName, resource.value);
  if (!Array.isArray(listValue)) {
    throw new Error(`Expected ${toolId} to return an array result.`);
  }
  if (!expectedId) {
    throw new Error(`No comparable ID found for resource "${resourceName}".`);
  }

  let found = listValue.some(item => getIdValue(resourceName, item) === expectedId);
  if (!found) {
    throw new Error(`Expected ${toolId} to include resource ${expectedId}.`);
  }
};

let getGrantedScopes = (profile: SlatesProfileRecord) => {
  let grantedScopes = new Set<string>();
  for (let auth of Object.values(profile.auth)) {
    for (let scope of auth?.scopes ?? []) {
      grantedScopes.add(scope);
    }
  }
  return grantedScopes;
};

export let checkScopeCoverage = (
  tools: LocalTool[],
  profile: SlatesProfileRecord
): ScopeCoverageFailure[] => {
  let grantedScopes = getGrantedScopes(profile);
  if (grantedScopes.size === 0) {
    return [];
  }

  let failures: ScopeCoverageFailure[] = [];

  for (let tool of tools) {
    let clauses = tool.scopes?.AND ?? [];
    if (clauses.length === 0) {
      continue;
    }

    let missingClauses = clauses
      .map(clause => clause.OR.filter(scope => !grantedScopes.has(scope)))
      .filter((missing, index) => missing.length === clauses[index]!.OR.length);

    if (missingClauses.length > 0) {
      failures.push({
        toolId: tool.key,
        missingClauses
      });
    }
  }

  return failures;
};

export let validateResourceDefinitions = <Fixtures, Helpers>(d: {
  tools: LocalTool[];
  resources?: Record<string, ToolResourceDefinition<Fixtures, Helpers>>;
}) => {
  let errors: string[] = [];
  let resources = d.resources ?? {};

  for (let [name, resource] of Object.entries(resources)) {
    let normalizedName = normalizeResourceName(name);
    if (resource.cleanup?.kind === 'soft' && !resource.janitor) {
      errors.push(`Resource "${normalizedName}" uses soft cleanup but does not define a janitor.`);
    }
  }

  return errors;
};

export let createSlateToolE2EEngine = async <
  Fixtures = Record<string, any>,
  Helpers = unknown
>(d: {
  provider: LocalSlate;
  integration?: SlateToolE2EIntegration<Fixtures, Helpers>;
  client: SlatesTestClient;
  profile: Awaited<ReturnType<typeof loadSlatesProfile>>;
  fixturesRaw?: unknown;
}) => {
  let integration = d.integration ?? {};
  let tools = d.provider.actions.filter(action => action.type === 'tool') as LocalTool[];
  let resources: TrackedSlateToolResource[] = [];
  let cleanupTasks: CleanupTask[] = [];
  let resourceStack = new Set<string>();
  let accessStack: Set<string>[] = [];

  let fixtures = parseE2EFixtures(integration.fixturesSchema, d.fixturesRaw ?? {});
  let normalizedProfileConfig = validateProfileConfig(d.provider, d.profile);
  d.client.setConfig(normalizedProfileConfig);
  d.profile.config = normalizedProfileConfig;
  let runId = createRunId(d.provider.spec.key);
  let auth = (Object.values(d.profile.auth)[0]?.output ?? {}) as Record<string, any>;
  let resourceDefs = Object.fromEntries(
    Object.entries(integration.resources ?? {}).map(([name, value]) => [
      normalizeResourceName(name),
      value
    ])
  ) as Record<string, ToolResourceDefinition<Fixtures, Helpers>>;

  let getLatestResource = (name: string) =>
    resources
      .filter(resource => !resource.deleted && resource.name === normalizeResourceName(name))
      .at(-1);

  let withAllowedResources = async <T>(names: string[], run: () => Promise<T>) => {
    accessStack.push(new Set(names.map(normalizeResourceName)));
    try {
      return await run();
    } finally {
      accessStack.pop();
    }
  };

  let assertResourceAccess = (name: string) => {
    let current = accessStack.at(-1);
    if (!current) {
      return;
    }

    let normalizedName = normalizeResourceName(name);
    if (!current.has(normalizedName)) {
      throw new Error(`Resource "${normalizedName}" was not declared in use.`);
    }
  };

  let registerCleanup = (task: CleanupTask | (() => Promise<void>), label?: string) => {
    cleanupTasks.unshift(
      typeof task === 'function'
        ? {
            label,
            run: task
          }
        : task
    );
  };

  let context = {
    integrationKey: d.provider.spec.key,
    client: d.client,
    profile: d.profile,
    auth,
    runId,
    fixtures,
    invokeTool: async (toolId: string, input: Record<string, any>) => {
      let tool = findTool(tools, toolId);
      let parsedInput = validateWithSchema(tool.inputSchema, input, `${toolId} input`);
      let result = await d.client.invokeTool(toolId, parsedInput as Record<string, any>);
      validateWithSchema(tool.outputSchema, result.output, `${toolId} output`);
      return result as { output: Record<string, any> };
    },
    getTool: (toolId: string) => findTool(tools, toolId),
    resource: (name: string) => {
      assertResourceAccess(name);
      let resource = getLatestResource(name);
      if (!resource) {
        throw new Error(`Resource "${normalizeResourceName(name)}" has not been prepared.`);
      }
      return resource.value;
    },
    listResources: (name?: string) =>
      resources.filter(
        resource => !name || resource.name === normalizeResourceName(name)
      ),
    updateResource: (name: string, value: Record<string, any>) => {
      assertResourceAccess(name);
      let resource = getLatestResource(name);
      if (!resource) {
        throw new Error(`Cannot update missing resource "${normalizeResourceName(name)}".`);
      }
      resource.value = {
        ...resource.value,
        ...value
      };
      return resource;
    },
    deleteResource: (name: string) => {
      assertResourceAccess(name);
      let resource = getLatestResource(name);
      if (!resource) {
        throw new Error(`Cannot delete missing resource "${normalizeResourceName(name)}".`);
      }
      resource.deleted = true;
    },
    registerCleanup,
    namespaced: (label: string) => `${runId} ${label}`,
    helpers: undefined as Helpers
  } satisfies Omit<ToolE2EContext<Fixtures, Helpers>, 'helpers'> & { helpers: Helpers };

  let helpers = integration.createHelpers
    ? await integration.createHelpers(context)
    : ({} as Helpers);
  context = {
    ...context,
    helpers
  };

  let findToolByOperation = (
    operation: 'create' | 'get' | 'update' | 'delete' | 'list' | 'search',
    family: string
  ) =>
    tools.find(candidate => {
      let parsed = parseToolKey(candidate.key);
      return parsed?.operation === operation && parsed.family === family;
    });

  let resolveCleanup = (name: string, toolId?: string): ToolResourceCleanup<Fixtures, Helpers> | null => {
    let resourceDef = resourceDefs[normalizeResourceName(name)];
    if (resourceDef?.cleanup) {
      return resourceDef.cleanup;
    }

    let family = normalizeResourceName(name);
    let deleteTool =
      findToolByOperation('delete', family) ??
      (toolId ? findToolByOperation('delete', parseToolKey(toolId)?.family ?? family) : undefined);

    if (!deleteTool) {
      return null;
    }

    return {
      kind: 'delete',
      run: async (ctx, value) => {
        let input = (await buildHeuristicInput({
          ctx,
          tool: deleteTool,
          operation: 'delete',
          family,
          primaryResourceName: family,
          primaryResource: {
            name: family,
            value,
            deleted: false,
            managed: true,
            source: 'custom'
          }
        })).input;
        await ctx.invokeTool(deleteTool.key, input);
      }
    };
  };

  let registerResource = (
    name: string,
    value: Record<string, any>,
    meta: ResourceEnsureMeta
  ) => {
    let normalizedName = normalizeResourceName(name);
    let resource: TrackedSlateToolResource = {
      name: normalizedName,
      value,
      deleted: false,
      managed: meta.created,
      source: meta.source,
      toolId: meta.toolId,
      input: meta.input
    };
    resources.push(resource);

    if (meta.created) {
      let cleanup = resolveCleanup(normalizedName, meta.toolId);
      if (!cleanup) {
        throw new Error(
          `Created resource "${normalizedName}" has no cleanup. Add a resource cleanup or a paired delete tool.`
        );
      }

      registerCleanup(
        async () => {
          if (resource.deleted) {
            return;
          }
          await cleanup.run(context, resource.value, resource);
          resource.deleted = true;
        },
        `cleanup:${normalizedName}`
      );
    }

    return resource;
  };

  let canEnsureResource = (name: string) => {
    let normalizedName = normalizeResourceName(name);
    return (
      Boolean(resourceDefs[normalizedName]) ||
      Boolean(findToolByOperation('create', normalizedName)) ||
      Boolean(findToolByOperation('list', normalizedName))
    );
  };

  let assertManagedResourceForMutation = (
    toolId: string,
    resource: TrackedSlateToolResource
  ) => {
    if (resource.managed) {
      return;
    }

    throw new Error(
      `Default ${toolId} scenario requires a resource created by the suite. ` +
        `Resource "${resource.name}" came from ${resource.source}; add a custom resource ` +
        `creator or a scenario override.`
    );
  };

  let ensureResource = async (name: string): Promise<TrackedSlateToolResource> => {
    let normalizedName = normalizeResourceName(name);
    let existing = getLatestResource(normalizedName);
    if (existing) {
      return existing;
    }

    if (resourceStack.has(normalizedName)) {
      throw new Error(`Resource "${normalizedName}" is recursively creating itself.`);
    }

    resourceStack.add(normalizedName);
    try {
      let resourceDef = resourceDefs[normalizedName];
      if (resourceDef) {
        for (let dependency of resourceDef.use ?? []) {
          await ensureResource(dependency);
        }

        if (resourceDef.fromFixture) {
          let value = await withAllowedResources(
            [normalizedName, ...(resourceDef.use ?? [])],
            async () => await resourceDef.fromFixture!(context)
          );
          if (!value || typeof value !== 'object') {
            throw new Error(`Fixture resource "${normalizedName}" did not return an object.`);
          }
          return registerResource(normalizedName, value, {
            resourceDef,
            source: 'fixture',
            created: false
          });
        }

        if (resourceDef.create) {
          let value = await withAllowedResources(
            [normalizedName, ...(resourceDef.use ?? [])],
            async () => await resourceDef.create!(context)
          );
          if (!value || typeof value !== 'object') {
            throw new Error(`Created resource "${normalizedName}" did not return an object.`);
          }
          return registerResource(normalizedName, value, {
            resourceDef,
            source: 'custom',
            created: true
          });
        }
      }

      let createTool = findToolByOperation('create', normalizedName);
      if (createTool) {
        await runScenario(createTool.key, 0);
        let created = getLatestResource(normalizedName);
        if (created) {
          return created;
        }
      }

      let listTool = findToolByOperation('list', normalizedName);
      if (listTool) {
        let built = await buildHeuristicInput({
          ctx: context,
          tool: listTool,
          operation: 'list',
          family: normalizedName,
          primaryResourceName: normalizedName
        });
        let result = await context.invokeTool(listTool.key, built.input);
        let item = getFirstArrayEntry(result.output);
        if (!item) {
          throw new Error(`Could not discover a ${normalizedName} resource via ${listTool.key}.`);
        }

        return registerResource(normalizedName, item, {
          source: 'list',
          toolId: listTool.key,
          input: built.input,
          created: false
        });
      }

      throw new Error(`Unable to prepare resource "${normalizedName}".`);
    } finally {
      resourceStack.delete(normalizedName);
    }
  };

  let resolveFieldValue = async (d: {
    ctx: ToolE2EContext<Fixtures, Helpers>;
    tool: LocalTool;
    family: string;
    operation: string;
    fieldName: string;
    fieldSchema: JsonSchema;
    primaryResourceName?: string;
    primaryResource?: TrackedSlateToolResource;
  }): Promise<any> => {
    let fixturesRecord = (d.ctx.fixtures ?? {}) as Record<string, any>;
    if (fixturesRecord[d.fieldName] !== undefined) {
      return fixturesRecord[d.fieldName];
    }

    if (d.fieldName === 'teamIds') {
      let team = canEnsureResource('team') ? await ensureResource('team') : undefined;
      let teamId =
        fixturesRecord.teamId ??
        d.primaryResource?.value.teamId ??
        team?.value.teamId ??
        team?.value.id;
      return teamId ? [teamId] : undefined;
    }

    if (d.primaryResource) {
      let directValue = getFieldValue(
        d.primaryResourceName ?? d.family,
        d.primaryResource.value,
        d.fieldName
      );
      if (directValue !== undefined) {
        return directValue;
      }
    }

    let relatedName = fieldResourceMap[d.fieldName];
    if (relatedName) {
      let relatedResource = await ensureResource(relatedName);
      let relatedValue =
        getFieldValue(relatedName, relatedResource.value, d.fieldName) ??
        getIdValue(relatedName, relatedResource.value);
      if (relatedValue !== undefined) {
        return relatedValue;
      }
    }

    if (d.fieldName === 'calendarId') {
      return d.primaryResource?.value.calendarId ?? d.fieldSchema.default ?? 'primary';
    }

    if (d.fieldName === 'query' || d.fieldName === 'q') {
      let primaryValue = d.primaryResource?.value;
      if (primaryValue) {
        for (let key of ['title', 'name', 'summary', 'text']) {
          if (typeof primaryValue[key] === 'string') {
            return primaryValue[key];
          }
        }
      }
      return d.ctx.runId;
    }

    if (d.fieldName === 'objectType') {
      if (d.primaryResource?.value.objectType) {
        return d.primaryResource.value.objectType;
      }
      if (d.tool.key === 'search_crm' || d.tool.key === 'list_properties') {
        return 'contacts';
      }
      if (d.tool.key === 'create_property') {
        return 'contacts';
      }
    }

    if (d.fieldName === 'start' || d.fieldName === 'end') {
      return createCalendarTimedRange()[d.fieldName];
    }

    if (d.fieldName === 'properties' && d.tool.key === 'search_crm') {
      return ['email', 'firstname', 'lastname'];
    }

    if (d.fieldName === 'properties') {
      return buildHubSpotProperties({
        tool: d.tool,
        family: d.family,
        operation: d.operation,
        runId: d.ctx.runId,
        resource: ensureResource
      });
    }

    if (d.fieldName === 'stages') {
      return [
        {
          label: d.ctx.namespaced('stage'),
          displayOrder: 1,
          metadata: {}
        }
      ];
    }

    if (d.fieldName === 'filterGroups') {
      let contact = canEnsureResource('contact') ? await ensureResource('contact') : undefined;
      let email =
        contact?.value.properties?.email ?? namespacedEmail(d.ctx.runId);

      return [
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'EQ',
              value: email
            }
          ]
        }
      ];
    }

    if (d.fieldName === 'sorts') {
      return [
        {
          propertyName: 'createdate',
          direction: 'DESCENDING'
        }
      ];
    }

    if (d.fieldSchema.type === 'array') {
      if (d.fieldName === 'properties' && d.tool.key !== 'search_crm') {
        return undefined;
      }
      let itemSchema = d.fieldSchema.items ?? {};
      let itemValue = buildScalarFallback(d.fieldName, itemSchema, d.ctx.runId);
      if (itemValue !== undefined) {
        return [itemValue];
      }
      return [];
    }

    if (d.fieldSchema.type === 'object') {
      if (d.fieldName === 'properties') {
        return {};
      }
      if (
        d.fieldSchema.additionalProperties &&
        typeof d.fieldSchema.additionalProperties === 'object'
      ) {
        return {
          value: buildScalarFallback('value', d.fieldSchema.additionalProperties, d.ctx.runId)
        };
      }
      return {};
    }

    return buildScalarFallback(d.fieldName, d.fieldSchema, d.ctx.runId);
  };

  let buildHeuristicInput = async (d: {
    ctx: ToolE2EContext<Fixtures, Helpers>;
    tool: LocalTool;
    operation: string;
    family: string;
    primaryResourceName?: string;
    primaryResource?: TrackedSlateToolResource;
  }): Promise<BuildInputResult> => {
    let schema = schemaToJson(d.tool.inputSchema);
    let properties = schema.properties ?? {};
    let required = new Set(schema.required ?? []);
    let input: Record<string, any> = {};
    let verification: BuildInputResult['verification'];

    let selectedOptionalFields = new Set<string>();

    if (d.operation === 'list' || d.operation === 'search') {
      if (properties.limit) selectedOptionalFields.add('limit');
      if (properties.first) selectedOptionalFields.add('first');
    }

    if (d.operation === 'update') {
      for (let key of [
        'title',
        'name',
        'summary',
        'description',
        'body',
        'content',
        'text',
        'properties'
      ]) {
        if (properties[key] && !required.has(key)) {
          selectedOptionalFields.add(key);
          break;
        }
      }
    }

    if (d.tool.key === 'get_user_info' && properties.listAll) {
      selectedOptionalFields.add('listAll');
    }

    if (d.tool.key === 'search_crm' && properties.limit) {
      selectedOptionalFields.add('limit');
    }

    for (let [fieldName, fieldSchema] of Object.entries(properties)) {
      let shouldPopulate =
        required.has(fieldName) ||
        selectedOptionalFields.has(fieldName) ||
        fieldName === 'teamIds' ||
        (Boolean(fieldResourceMap[fieldName]) && canEnsureResource(fieldResourceMap[fieldName]!));
      if (!shouldPopulate) {
        continue;
      }

      let value = await resolveFieldValue({
        ctx: d.ctx,
        tool: d.tool,
        family: d.family,
        operation: d.operation,
        fieldName,
        fieldSchema,
        primaryResourceName: d.primaryResourceName,
        primaryResource: d.primaryResource
      });

      if (value !== undefined) {
        input[fieldName] = value;
        if (
          d.operation === 'update' &&
          verification === undefined &&
          !fieldName.endsWith('Id') &&
          fieldName !== 'action'
        ) {
          verification = {
            field: fieldName,
            value
          };
        }
      }
    }

    return {
      input,
      verification
    };
  };

  let buildScenario = (
    tool: LocalTool
  ): ToolScenario<Fixtures, Helpers> | null => {
    let override = integration.scenarioOverrides?.[tool.key];
    if (override) {
      return Array.isArray(override) ? override[0]! : override;
    }

    let defaultScenarioKind = getDefaultScenarioKind(tool);
    if (defaultScenarioKind === 'empty-input') {
      return {
        run: async ctx => {
          let schema = schemaToJson(tool.inputSchema);
          let input: Record<string, any> = {};
          if (schema.properties?.listAll?.type === 'boolean') {
            input.listAll = true;
          }
          await ctx.invokeTool(tool.key, input);
        }
      };
    }

    let parsed = parseToolKey(tool.key);
    if (!parsed) {
      return null;
    }

    let { operation, family } = parsed;

    if (operation === 'create') {
      return {
        run: async ctx => {
          let built = await buildHeuristicInput({
            ctx,
            tool,
            operation,
            family,
            primaryResourceName: family
          });
          let result = await ctx.invokeTool(tool.key, built.input);
          return {
            provide: {
              [family]: {
                ...built.input,
                ...result.output
              }
            }
          };
        }
      };
    }

    let defaultUse = canEnsureResource(family) ? [family] : [];

    if (operation === 'get') {
      return {
        use: defaultUse,
        run: async ctx => {
          let resource = defaultUse.length > 0 ? getLatestResource(family) ?? (await ensureResource(family)) : undefined;
          let built = await buildHeuristicInput({
            ctx,
            tool,
            operation,
            family,
            primaryResourceName: family,
            primaryResource: resource
          });
          let result = await ctx.invokeTool(tool.key, built.input);
          if (resource) {
            let expectedId = getIdValue(family, resource.value);
            if (expectedId) {
              let actualId = getIdValue(family, result.output);
              if (actualId && actualId !== expectedId) {
                throw new Error(
                  `Expected ${tool.key} to return ${expectedId}, received ${actualId}.`
                );
              }
            }
          }
        }
      };
    }

    if (operation === 'update') {
      return {
        use: defaultUse,
        run: async ctx => {
          let resource = await ensureResource(family);
          assertManagedResourceForMutation(tool.key, resource);
          let built = await buildHeuristicInput({
            ctx,
            tool,
            operation,
            family,
            primaryResourceName: family,
            primaryResource: resource
          });
          let updateResult = await ctx.invokeTool(tool.key, built.input);

          let getTool = findToolByOperation('get', family);
          if (getTool) {
            let getBuilt = await buildHeuristicInput({
              ctx,
              tool: getTool,
              operation: 'get',
              family,
              primaryResourceName: family,
              primaryResource: resource
            });
            let readBack = await ctx.invokeTool(getTool.key, getBuilt.input);
            if (built.verification) {
              compareValues(readBack.output[built.verification.field], built.verification.value);
            }
            ctx.updateResource(family, readBack.output);
            return;
          }

          ctx.updateResource(family, {
            ...built.input,
            ...updateResult.output
          });
        }
      };
    }

    if (operation === 'delete') {
      return {
        use: defaultUse,
        run: async ctx => {
          let resource = await ensureResource(family);
          assertManagedResourceForMutation(tool.key, resource);
          let built = await buildHeuristicInput({
            ctx,
            tool,
            operation,
            family,
            primaryResourceName: family,
            primaryResource: resource
          });
          await ctx.invokeTool(tool.key, built.input);
          ctx.deleteResource(family);
        }
      };
    }

    if (operation === 'list') {
      return {
        use: defaultUse,
        run: async ctx => {
          let resource = defaultUse.length > 0 ? await ensureResource(family) : undefined;
          let built = await buildHeuristicInput({
            ctx,
            tool,
            operation,
            family,
            primaryResourceName: family,
            primaryResource: resource
          });
          let result = await ctx.invokeTool(tool.key, built.input);
          if (resource) {
            assertResourcePresence(tool.key, family, resource, result.output);
          }
        }
      };
    }

    if (operation === 'search') {
      return {
        use: defaultUse,
        run: async ctx => {
          let resource = defaultUse.length > 0 ? await ensureResource(family) : undefined;
          let built = await buildHeuristicInput({
            ctx,
            tool,
            operation,
            family,
            primaryResourceName: family,
            primaryResource: resource
          });
          let result = await ctx.invokeTool(tool.key, built.input);
          if (resource) {
            assertResourcePresence(tool.key, family, resource, result.output);
            return;
          }

          let [, listValue] = findArrayField(result.output) ?? [];
          if (Array.isArray(listValue) && listValue.length === 0) {
            throw new Error(`Expected ${tool.key} to return at least one result.`);
          }
        }
      };
    }

    return null;
  };

  let getScenarios = (toolId: string) => {
    let override = integration.scenarioOverrides?.[toolId];
    if (override) {
      return Array.isArray(override) ? override : [override];
    }

    let scenario = buildScenario(findTool(tools, toolId));
    return scenario ? [scenario] : [];
  };

  let runScenario = async (toolId: string, index = 0) => {
    let scenarios = getScenarios(toolId);
    let scenario = scenarios[index];
    if (!scenario) {
      throw new Error(`No scenario available for ${toolId} at index ${index}.`);
    }

    let uses = [...new Set((scenario.use ?? []).map(normalizeResourceName))];
    for (let name of uses) {
      await ensureResource(name);
    }

    let result = await withAllowedResources(uses, async () => await scenario.run(context));
    for (let [name, value] of Object.entries(result?.provide ?? {})) {
      registerResource(name, value, {
        source: 'tool',
        toolId,
        created: true
      });
    }
  };

  let validateFailures = validateResourceDefinitions({
    tools,
    resources: resourceDefs
  });

  let scopeFailures = checkScopeCoverage(tools, d.profile);

  let uncoveredTools = tools
    .filter(tool => getScenarios(tool.key).length === 0)
    .map(tool => tool.key);

  return {
    tools,
    context,
    uncoveredTools,
    validateFailures,
    scopeFailures,
    getScenarios,
    runScenario,
    runBeforeSuite: async () => {
      if (validateFailures.length > 0) {
        throw new Error(validateFailures.join('\n'));
      }

      if (scopeFailures.length > 0) {
        let message = scopeFailures
          .map(
            failure =>
              `${failure.toolId}: ${failure.missingClauses
                .map(clause => `any of [${clause.join(', ')}]`)
                .join('; ')}`
          )
          .join('\n');
        throw new Error(`Missing required scopes for live E2E tools:\n${message}`);
      }

      for (let [name, resourceDef] of Object.entries(resourceDefs)) {
        if (resourceDef.janitor) {
          await withAllowedResources([name, ...(resourceDef.use ?? [])], async () =>
            await resourceDef.janitor!(context)
          );
        }
      }

      await integration.beforeSuite?.(context);
    },
    runAfterSuite: async () => {
      let cleanupErrors: string[] = [];

      try {
        await integration.afterSuite?.(context);
      } catch (error) {
        cleanupErrors.push(error instanceof Error ? error.message : String(error));
      }

      for (let task of cleanupTasks) {
        try {
          await task.run();
        } catch (error) {
          cleanupErrors.push(
            `${task.label ?? 'cleanup'}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      if (cleanupErrors.length > 0) {
        throw new Error(cleanupErrors.join('\n'));
      }
    }
  };
};

export let runSlateToolE2ESuite = <
  Fixtures = Record<string, any>,
  Helpers = unknown
>(d: {
  provider: LocalSlate;
  integration?: SlateToolE2EIntegration<Fixtures, Helpers>;
  suiteName?: string;
  timeoutMs?: number;
}) => {
  let suiteName = d.suiteName ?? `${d.provider.spec.key} live tool e2e`;
  let tools = d.provider.actions.filter(action => action.type === 'tool') as LocalTool[];
  let engine!: Awaited<ReturnType<typeof createSlateToolE2EEngine<Fixtures, Helpers>>>;

  describe.sequential(suiteName, () => {
    beforeAll(async () => {
      let [client, profile] = await Promise.all([createSlatesTestClient(), loadSlatesProfile()]);
      let fixturesRaw = process.env.SLATES_E2E_FIXTURES
        ? JSON.parse(process.env.SLATES_E2E_FIXTURES)
        : {};

      engine = await createSlateToolE2EEngine({
        provider: d.provider,
        integration: d.integration,
        client,
        profile,
        fixturesRaw
      });

      await engine.runBeforeSuite();
    }, d.timeoutMs);

    afterAll(async () => {
      if (engine) {
        await engine.runAfterSuite();
      }
    }, d.timeoutMs);

    it('covers every discovered tool', () => {
      let expect = getVitestExpect();
      expect(engine.uncoveredTools).toEqual([]);
    }, d.timeoutMs);

    for (let tool of tools) {
      let scenarios = listToolScenarioDefinitions(tool, d.integration);
      for (let [index, scenario] of scenarios.entries()) {
        let fallbackName =
          scenarios.length === 1 ? tool.key : `${tool.key} #${index + 1}`;
        it(scenario.name ?? fallbackName, async () => {
          await engine.runScenario(tool.key, index);
        }, d.timeoutMs);
      }
    }
  });
};
