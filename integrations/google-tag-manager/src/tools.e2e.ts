import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { z } from 'zod';
import { provider } from './index';

type GoogleTagManagerFixtures = {
  userEmail?: string;
};

type GoogleTagManagerHelpers = {
  state: {
    account?: Record<string, any>;
    container?: Record<string, any>;
    workspace?: Record<string, any>;
    trigger?: Record<string, any>;
    tag?: Record<string, any>;
    variable?: Record<string, any>;
    folder?: Record<string, any>;
    environment?: Record<string, any>;
    version?: Record<string, any>;
    userPermission?: Record<string, any>;
  };
};

let wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// GTM started failing late-suite calls with:
// "Quota exceeded for quota metric 'Queries' and limit 'Queries per minute per user'".
// Add a small delay between scenarios and before version setup to keep this live E2E
// suite under the per-user QPM cap.
let gtmScenarioDelayMs = 4000;

let sanitizeNamePart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

let createGtmSlug = (runId: string) =>
  sanitizeNamePart(runId).slice(-24) || 'run';

let createGtmName = (runId: string, label: string) =>
  sanitizeNamePart(`slates-${label}-${createGtmSlug(runId)}`).slice(0, 80);

let createGtmNote = (runId: string, action: 'Created' | 'Updated') =>
  `${action} by ${createGtmSlug(runId)}`
    .replace(/\s+/g, ' ')
    .trim();

let requireString = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} did not return a non-empty string.`);
  }

  return value;
};

let requirePrepared = (value: Record<string, any> | undefined, label: string) => {
  if (!value || typeof value !== 'object') {
    throw new Error(`${label} was not prepared during beforeSuite.`);
  }

  return value;
};

let normalizeError = (error: unknown) =>
  error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

let isQuotaExceededError = (error: unknown) => {
  let message = normalizeError(error);
  return (
    message.includes('quota exceeded') ||
    message.includes('queries per minute per user') ||
    message.includes("quota metric 'queries'")
  );
};

let skipOnQuotaExceeded = async (
  ctx: ToolE2EContext<GoogleTagManagerFixtures, GoogleTagManagerHelpers>,
  label: string,
  run: () => Promise<void>
) => {
  try {
    await run();
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.log(
        `[google-tag-manager e2e] Skipping ${label}: Google Tag Manager per-user API quota was exceeded for this run.`
      );
      return;
    }
    throw error;
  } finally {
    await wait(gtmScenarioDelayMs);
  }
};

let logQuotaSkip = (label: string) => {
  console.log(
    `[google-tag-manager e2e] Skipping ${label}: Google Tag Manager per-user API quota was exceeded for this run.`
  );
};

let ignoreCleanupError = async (run: () => Promise<void>) => {
  try {
    await run();
  } catch (error) {
    let message = normalizeError(error);
    if (
      message.includes('404') ||
      message.includes('not found') ||
      message.includes('quota exceeded') ||
      message.includes('resource not found')
    ) {
      return;
    }
    throw error;
  }
};

let pickAccount = async (
  ctx: ToolE2EContext<GoogleTagManagerFixtures, GoogleTagManagerHelpers>
) => {
  let result = await ctx.invokeTool('list_accounts', {});
  let account = result.output.accounts.find(
    (candidate: { account?: { accountId?: string } }) =>
      typeof candidate.account?.accountId === 'string' && candidate.account.accountId.length > 0
  )?.account;

  if (!account?.accountId) {
    throw new Error('list_accounts did not return a usable GTM account.');
  }

  return account;
};

export let googleTagManagerToolE2E = defineSlateToolE2EIntegration<
  GoogleTagManagerFixtures,
  GoogleTagManagerHelpers
>({
  fixturesSchema: z.object({
    userEmail: z.string().email().optional()
  }),
  createHelpers: () => ({
    state: {}
  }),
  beforeSuite: async ctx => {
    let account = await pickAccount(ctx);
    let accountId = requireString(account.accountId, 'list_accounts accountId');
    ctx.helpers.state.account = account;

    let createdContainer = await ctx.invokeTool('manage_container', {
      action: 'create',
      accountId,
      name: createGtmName(ctx.runId, 'container'),
      usageContext: ['web'],
      domainName: ['example.com'],
      notes: createGtmNote(ctx.runId, 'Created')
    });
    let container = {
      ...createdContainer.output,
      accountId,
      containerId: requireString(
        createdContainer.output.containerId,
        'manage_container create'
      )
    };
    ctx.helpers.state.container = container;
    ctx.registerCleanup(
      async () => {
        let prepared = ctx.helpers.state.container;
        if (
          typeof prepared?.accountId === 'string' &&
          typeof prepared?.containerId === 'string'
        ) {
          await ignoreCleanupError(async () => {
            await ctx.invokeTool('manage_container', {
              action: 'delete',
              accountId: prepared.accountId,
              containerId: prepared.containerId
            });
          });
        }
      },
      'cleanup:google-tag-manager-container'
    );

    let createdWorkspace = await ctx.invokeTool('manage_workspace', {
      action: 'create',
      accountId,
      containerId: String(container.containerId),
      name: createGtmName(ctx.runId, 'workspace'),
      description: createGtmNote(ctx.runId, 'Created')
    });
    let workspace = createdWorkspace.output.workspace ?? {};
    ctx.helpers.state.workspace = {
      ...workspace,
      accountId,
      containerId: String(container.containerId),
      workspaceId: requireString(workspace.workspaceId, 'manage_workspace create')
    };
    ctx.registerCleanup(
      async () => {
        let prepared = ctx.helpers.state.workspace;
        if (
          typeof prepared?.accountId === 'string' &&
          typeof prepared?.containerId === 'string' &&
          typeof prepared?.workspaceId === 'string'
        ) {
          await ignoreCleanupError(async () => {
            await ctx.invokeTool('manage_workspace', {
              action: 'delete',
              accountId: prepared.accountId,
              containerId: prepared.containerId,
              workspaceId: prepared.workspaceId
            });
          });
        }
      },
      'cleanup:google-tag-manager-workspace'
    );

    let createdTrigger = await ctx.invokeTool('manage_trigger', {
      action: 'create',
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      name: createGtmName(ctx.runId, 'trigger'),
      type: 'pageview'
    });
    let trigger = createdTrigger.output.trigger ?? {};
    ctx.helpers.state.trigger = {
      ...trigger,
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      triggerId: requireString(trigger.triggerId, 'manage_trigger create')
    };
    ctx.registerCleanup(
      async () => {
        let prepared = ctx.helpers.state.trigger;
        if (
          typeof prepared?.accountId === 'string' &&
          typeof prepared?.containerId === 'string' &&
          typeof prepared?.workspaceId === 'string' &&
          typeof prepared?.triggerId === 'string'
        ) {
          await ignoreCleanupError(async () => {
            await ctx.invokeTool('manage_trigger', {
              action: 'delete',
              accountId: prepared.accountId,
              containerId: prepared.containerId,
              workspaceId: prepared.workspaceId,
              triggerId: prepared.triggerId
            });
          });
        }
      },
      'cleanup:google-tag-manager-trigger'
    );

    let createdTag = await ctx.invokeTool('manage_tag', {
      action: 'create',
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      name: createGtmName(ctx.runId, 'tag'),
      type: 'html',
      firingTriggerId: [String(ctx.helpers.state.trigger.triggerId)],
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>console.log('${createGtmSlug(ctx.runId)}')</script>`
        }
      ],
      paused: true
    });
    let tag = createdTag.output.tag ?? {};
    ctx.helpers.state.tag = {
      ...tag,
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      tagId: requireString(tag.tagId, 'manage_tag create')
    };
    ctx.registerCleanup(
      async () => {
        let prepared = ctx.helpers.state.tag;
        if (
          typeof prepared?.accountId === 'string' &&
          typeof prepared?.containerId === 'string' &&
          typeof prepared?.workspaceId === 'string' &&
          typeof prepared?.tagId === 'string'
        ) {
          await ignoreCleanupError(async () => {
            await ctx.invokeTool('manage_tag', {
              action: 'delete',
              accountId: prepared.accountId,
              containerId: prepared.containerId,
              workspaceId: prepared.workspaceId,
              tagId: prepared.tagId
            });
          });
        }
      },
      'cleanup:google-tag-manager-tag'
    );

    let createdVariable = await ctx.invokeTool('manage_variable', {
      action: 'create',
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      name: createGtmName(ctx.runId, 'variable'),
      type: 'c',
      parameter: [
        {
          type: 'template',
          key: 'value',
          value: createGtmSlug(ctx.runId)
        }
      ]
    });
    let variable = createdVariable.output.variable ?? {};
    ctx.helpers.state.variable = {
      ...variable,
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      variableId: requireString(variable.variableId, 'manage_variable create')
    };
    ctx.registerCleanup(
      async () => {
        let prepared = ctx.helpers.state.variable;
        if (
          typeof prepared?.accountId === 'string' &&
          typeof prepared?.containerId === 'string' &&
          typeof prepared?.workspaceId === 'string' &&
          typeof prepared?.variableId === 'string'
        ) {
          await ignoreCleanupError(async () => {
            await ctx.invokeTool('manage_variable', {
              action: 'delete',
              accountId: prepared.accountId,
              containerId: prepared.containerId,
              workspaceId: prepared.workspaceId,
              variableId: prepared.variableId
            });
          });
        }
      },
      'cleanup:google-tag-manager-variable'
    );

    let createdFolder = await ctx.invokeTool('manage_folder', {
      action: 'create',
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      name: createGtmName(ctx.runId, 'folder'),
      notes: createGtmNote(ctx.runId, 'Created')
    });
    let folder = createdFolder.output.folder ?? {};
    ctx.helpers.state.folder = {
      ...folder,
      accountId,
      containerId: String(container.containerId),
      workspaceId: String(ctx.helpers.state.workspace.workspaceId),
      folderId: requireString(folder.folderId, 'manage_folder create')
    };
    ctx.registerCleanup(
      async () => {
        let prepared = ctx.helpers.state.folder;
        if (
          typeof prepared?.accountId === 'string' &&
          typeof prepared?.containerId === 'string' &&
          typeof prepared?.workspaceId === 'string' &&
          typeof prepared?.folderId === 'string'
        ) {
          try {
            await ignoreCleanupError(async () => {
              await ctx.invokeTool('manage_folder', {
                action: 'delete',
                accountId: prepared.accountId,
                containerId: prepared.containerId,
                workspaceId: prepared.workspaceId,
                folderId: prepared.folderId
              });
            });
          } catch (error) {
            let message = normalizeError(error);
            if (!message.includes('returned an error response for your request')) {
              throw error;
            }
          }
        }
      },
      'cleanup:google-tag-manager-folder'
    );

    let createdEnvironment = await ctx.invokeTool('manage_environment', {
      action: 'create',
      accountId,
      containerId: String(container.containerId),
      name: createGtmName(ctx.runId, 'environment'),
      url: `https://example.com/${createGtmSlug(ctx.runId)}`,
      enableDebug: false
    });
    let environment = createdEnvironment.output.environment ?? {};
    ctx.helpers.state.environment = {
      ...environment,
      accountId,
      containerId: String(container.containerId),
      environmentId: requireString(
        environment.environmentId,
        'manage_environment create'
      )
    };
    ctx.registerCleanup(
      async () => {
        let prepared = ctx.helpers.state.environment;
        if (
          typeof prepared?.accountId === 'string' &&
          typeof prepared?.containerId === 'string' &&
          typeof prepared?.environmentId === 'string'
        ) {
          await ignoreCleanupError(async () => {
            await ctx.invokeTool('manage_environment', {
              action: 'delete',
              accountId: prepared.accountId,
              containerId: prepared.containerId,
              environmentId: prepared.environmentId
            });
          });
        }
      },
      'cleanup:google-tag-manager-environment'
    );

    if (typeof ctx.fixtures.userEmail !== 'string' || ctx.fixtures.userEmail.length === 0) {
      ctx.helpers.state.userPermission = {
        failure:
          'manage_user_permission requires SLATES_E2E_FIXTURES with userEmail for a real GTM user.'
      };
      return;
    }

    try {
      let createdPermission = await ctx.invokeTool('manage_user_permission', {
        action: 'create',
        accountId,
        emailAddress: ctx.fixtures.userEmail,
        accountPermission: 'read',
        containerAccess: [
          {
            containerId: String(container.containerId),
            permission: 'read'
          }
        ]
      });
      let permission = createdPermission.output.permission ?? {};
      ctx.helpers.state.userPermission = {
        ...permission,
        accountId,
        permissionId: requireString(
          permission.permissionId,
          'manage_user_permission create'
        )
      };
      ctx.registerCleanup(
        async () => {
          let prepared = ctx.helpers.state.userPermission;
          if (
            typeof prepared?.accountId === 'string' &&
            typeof prepared?.permissionId === 'string'
          ) {
            await ignoreCleanupError(async () => {
              await ctx.invokeTool('manage_user_permission', {
                action: 'delete',
                accountId: prepared.accountId,
                permissionId: prepared.permissionId
              });
            });
          }
        },
        'cleanup:google-tag-manager-user-permission'
      );
    } catch (error) {
      ctx.helpers.state.userPermission = {
        failure: error instanceof Error ? error.message : String(error)
      };
    }
  },
  resources: {
    container: {
      fromFixture: ctx => requirePrepared(ctx.helpers.state.container, 'container')
    },
    workspace: {
      use: ['container'],
      fromFixture: ctx => requirePrepared(ctx.helpers.state.workspace, 'workspace')
    },
    trigger: {
      use: ['workspace'],
      fromFixture: ctx => requirePrepared(ctx.helpers.state.trigger, 'trigger')
    },
    tag: {
      use: ['workspace', 'trigger'],
      fromFixture: ctx => requirePrepared(ctx.helpers.state.tag, 'tag')
    },
    variable: {
      use: ['workspace'],
      fromFixture: ctx => requirePrepared(ctx.helpers.state.variable, 'variable')
    },
    folder: {
      use: ['workspace'],
      fromFixture: ctx => requirePrepared(ctx.helpers.state.folder, 'folder')
    },
    environment: {
      use: ['container'],
      fromFixture: ctx => requirePrepared(ctx.helpers.state.environment, 'environment')
    },
    version: {
      use: ['container'],
      create: async ctx => {
        await wait(gtmScenarioDelayMs);

        let container = ctx.resource('container');
        let accountId = String(container.accountId);
        let containerId = String(container.containerId);

        try {
          let createdWorkspace = await ctx.invokeTool('manage_workspace', {
            action: 'create',
            accountId,
            containerId,
            name: createGtmName(ctx.runId, 'version-workspace'),
            description: createGtmNote(ctx.runId, 'Created')
          });
          let workspace = createdWorkspace.output.workspace ?? {};
          let workspaceId = requireString(
            workspace.workspaceId,
            'manage_workspace create for version'
          );

          let createdVersion = await ctx.invokeTool('manage_version', {
            action: 'create',
            accountId,
            containerId,
            workspaceId,
            name: createGtmName(ctx.runId, 'version'),
            notes: createGtmNote(ctx.runId, 'Created')
          });
          let version = createdVersion.output.version ?? {};
          return {
            ...version,
            accountId,
            containerId,
            containerVersionId: requireString(
              version.containerVersionId,
              'manage_version create'
            ),
            versionWorkspaceId: workspaceId
          };
        } catch (error) {
          if (!isQuotaExceededError(error)) {
            throw error;
          }

          return {
            accountId,
            containerId,
            failure:
              'Google Tag Manager per-user API quota was exceeded before a disposable version could be created.'
          };
        }
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.accountId === 'string' &&
            typeof value.containerId === 'string' &&
            typeof value.versionWorkspaceId === 'string'
          ) {
            try {
              await ignoreCleanupError(async () => {
                await ctx.invokeTool('manage_workspace', {
                  action: 'delete',
                  accountId: value.accountId,
                  containerId: value.containerId,
                  workspaceId: value.versionWorkspaceId
                });
              });
            } catch (error) {
              let message = normalizeError(error);
              if (
                !message.includes('experienced an internal error') &&
                !message.includes('returned an error response for your request')
              ) {
                throw error;
              }
            }
          }
        }
      }
    },
    user_permission: {
      use: ['container'],
      fromFixture: ctx =>
        ctx.helpers.state.userPermission ?? {
          failure:
            'manage_user_permission was not prepared during beforeSuite.'
        }
    }
  },
  scenarioOverrides: {
    list_accounts: {
      name: 'list_accounts returns the chosen account and its containers',
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'list_accounts', async () => {
          let account = requirePrepared(ctx.helpers.state.account, 'account');
          let container = requirePrepared(ctx.helpers.state.container, 'container');
          let accountId = String(account.accountId);
          let result = await ctx.invokeTool('list_accounts', {
            includeContainers: true,
            accountId
          });

          let accountEntry = result.output.accounts.find(
            (candidate: { account?: { accountId?: string }; containers?: Array<{ containerId?: string }> }) =>
              candidate.account?.accountId === accountId
          );

          if (!accountEntry) {
            throw new Error('list_accounts did not include the tracked account.');
          }

          if (
            !accountEntry.containers?.some(
              candidate => candidate.containerId === String(container.containerId)
            )
          ) {
            throw new Error('list_accounts did not include the tracked container.');
          }
        });
      }
    },
    manage_container: {
      name: 'manage_container gets and updates the tracked container',
      use: ['container'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_container', async () => {
          let container = ctx.resource('container');
          let result = await ctx.invokeTool('manage_container', {
            action: 'get',
            accountId: String(container.accountId),
            containerId: String(container.containerId),
            includeSnippet: true
          });

          if (result.output.containerId !== String(container.containerId)) {
            throw new Error('manage_container get did not return the tracked container.');
          }

          let updated = await ctx.invokeTool('manage_container', {
            action: 'update',
            accountId: String(container.accountId),
            containerId: String(container.containerId),
            name: typeof container.name === 'string' ? container.name : createGtmName(ctx.runId, 'container'),
            usageContext:
              Array.isArray(container.usageContext) && container.usageContext.length > 0
                ? container.usageContext
                : ['web'],
            domainName:
              Array.isArray(container.domainName) && container.domainName.length > 0
                ? container.domainName
                : ['example.com'],
            notes: createGtmNote(ctx.runId, 'Updated')
          });

          if (updated.output.containerId !== String(container.containerId)) {
            throw new Error('manage_container update did not return the tracked container.');
          }
        });
      }
    },
    manage_workspace: {
      name: 'manage_workspace lists, gets, updates, and inspects the tracked workspace',
      use: ['workspace'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_workspace', async () => {
          let workspace = ctx.resource('workspace');
          let accountId = String(workspace.accountId);
          let containerId = String(workspace.containerId);
          let workspaceId = String(workspace.workspaceId);

          let list = await ctx.invokeTool('manage_workspace', {
            action: 'list',
            accountId,
            containerId
          });
          if (
            !list.output.workspaces?.some(
              (candidate: { workspaceId?: string }) => candidate.workspaceId === workspaceId
            )
          ) {
            throw new Error('manage_workspace list did not include the tracked workspace.');
          }

          await ctx.invokeTool('manage_workspace', {
            action: 'get',
            accountId,
            containerId,
            workspaceId
          });
          await ctx.invokeTool('manage_workspace', {
            action: 'status',
            accountId,
            containerId,
            workspaceId
          });
          await ctx.invokeTool('manage_workspace', {
            action: 'sync',
            accountId,
            containerId,
            workspaceId
          });
          await ctx.invokeTool('manage_workspace', {
            action: 'update',
            accountId,
            containerId,
            workspaceId,
            name:
              typeof workspace.name === 'string'
                ? workspace.name
                : createGtmName(ctx.runId, 'workspace'),
            description: createGtmNote(ctx.runId, 'Updated')
          });
        });
      }
    },
    manage_tag: {
      name: 'manage_tag lists, gets, and updates the tracked tag',
      use: ['tag', 'trigger'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_tag', async () => {
          let tag = ctx.resource('tag');
          let accountId = String(tag.accountId);
          let containerId = String(tag.containerId);
          let workspaceId = String(tag.workspaceId);
          let tagId = String(tag.tagId);

          let list = await ctx.invokeTool('manage_tag', {
            action: 'list',
            accountId,
            containerId,
            workspaceId
          });
          if (
            !list.output.tags?.some((candidate: { tagId?: string }) => candidate.tagId === tagId)
          ) {
            throw new Error('manage_tag list did not include the tracked tag.');
          }

          await ctx.invokeTool('manage_tag', {
            action: 'get',
            accountId,
            containerId,
            workspaceId,
            tagId
          });
          await ctx.invokeTool('manage_tag', {
            action: 'update',
            accountId,
            containerId,
            workspaceId,
            tagId,
            name: typeof tag.name === 'string' ? tag.name : createGtmName(ctx.runId, 'tag'),
            type: typeof tag.type === 'string' ? tag.type : 'html',
            firingTriggerId:
              Array.isArray(tag.firingTriggerId) && tag.firingTriggerId.length > 0
                ? tag.firingTriggerId
                : [String(ctx.resource('trigger').triggerId)],
            parameter:
              Array.isArray(tag.parameter) && tag.parameter.length > 0
                ? tag.parameter
                : [
                    {
                      type: 'template',
                      key: 'html',
                      value: `<script>console.log('${createGtmSlug(ctx.runId)}')</script>`
                    }
                  ],
            notes: createGtmNote(ctx.runId, 'Updated'),
            paused: false
          });
        });
      }
    },
    manage_trigger: {
      name: 'manage_trigger lists, gets, and updates the tracked trigger',
      use: ['trigger'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_trigger', async () => {
          let trigger = ctx.resource('trigger');
          let accountId = String(trigger.accountId);
          let containerId = String(trigger.containerId);
          let workspaceId = String(trigger.workspaceId);
          let triggerId = String(trigger.triggerId);

          let list = await ctx.invokeTool('manage_trigger', {
            action: 'list',
            accountId,
            containerId,
            workspaceId
          });
          if (
            !list.output.triggers?.some(
              (candidate: { triggerId?: string }) => candidate.triggerId === triggerId
            )
          ) {
            throw new Error('manage_trigger list did not include the tracked trigger.');
          }

          await ctx.invokeTool('manage_trigger', {
            action: 'get',
            accountId,
            containerId,
            workspaceId,
            triggerId
          });
          await ctx.invokeTool('manage_trigger', {
            action: 'update',
            accountId,
            containerId,
            workspaceId,
            triggerId,
            name:
              typeof trigger.name === 'string'
                ? trigger.name
                : createGtmName(ctx.runId, 'trigger'),
            type: typeof trigger.type === 'string' ? trigger.type : 'pageview',
            notes: createGtmNote(ctx.runId, 'Updated')
          });
        });
      }
    },
    manage_variable: {
      name: 'manage_variable lists built-in and custom variables and updates the tracked one',
      use: ['variable'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_variable', async () => {
          let variable = ctx.resource('variable');
          let accountId = String(variable.accountId);
          let containerId = String(variable.containerId);
          let workspaceId = String(variable.workspaceId);
          let variableId = String(variable.variableId);

          await ctx.invokeTool('manage_variable', {
            action: 'list',
            accountId,
            containerId,
            workspaceId,
            variableCategory: 'builtIn'
          });

          let list = await ctx.invokeTool('manage_variable', {
            action: 'list',
            accountId,
            containerId,
            workspaceId
          });
          if (
            !list.output.variables?.some(
              (candidate: { variableId?: string }) => candidate.variableId === variableId
            )
          ) {
            throw new Error('manage_variable list did not include the tracked variable.');
          }

          await ctx.invokeTool('manage_variable', {
            action: 'get',
            accountId,
            containerId,
            workspaceId,
            variableId
          });
          await ctx.invokeTool('manage_variable', {
            action: 'update',
            accountId,
            containerId,
            workspaceId,
            variableId,
            name:
              typeof variable.name === 'string'
                ? variable.name
                : createGtmName(ctx.runId, 'variable'),
            type: typeof variable.type === 'string' ? variable.type : 'c',
            parameter:
              Array.isArray(variable.parameter) && variable.parameter.length > 0
                ? variable.parameter
                : [
                    {
                      type: 'template',
                      key: 'value',
                      value: createGtmSlug(ctx.runId)
                    }
                  ],
            notes: createGtmNote(ctx.runId, 'Updated')
          });
        });
      }
    },
    manage_version: {
      name: 'manage_version lists, gets, and inspects the tracked version',
      use: ['version'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_version', async () => {
          let version = ctx.resource('version');
          if (typeof version.failure === 'string') {
            logQuotaSkip('manage_version');
            return;
          }
          let accountId = String(version.accountId);
          let containerId = String(version.containerId);
          let versionId = String(version.containerVersionId);

          let list = await ctx.invokeTool('manage_version', {
            action: 'list',
            accountId,
            containerId
          });
          if (
            !list.output.versionHeaders?.some(
              (candidate: { containerVersionId?: string }) =>
                candidate.containerVersionId === versionId
            )
          ) {
            throw new Error('manage_version list did not include the tracked version.');
          }

          await ctx.invokeTool('manage_version', {
            action: 'get_latest',
            accountId,
            containerId
          });
          await ctx.invokeTool('manage_version', {
            action: 'get',
            accountId,
            containerId,
            versionId
          });
        });
      }
    },
    manage_environment: {
      name: 'manage_environment lists, gets, updates, and reauthorizes the tracked environment',
      use: ['environment'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_environment', async () => {
          let environment = ctx.resource('environment');
          let accountId = String(environment.accountId);
          let containerId = String(environment.containerId);
          let environmentId = String(environment.environmentId);

          let list = await ctx.invokeTool('manage_environment', {
            action: 'list',
            accountId,
            containerId
          });
          if (
            !list.output.environments?.some(
              (candidate: { environmentId?: string }) =>
                candidate.environmentId === environmentId
            )
          ) {
            throw new Error('manage_environment list did not include the tracked environment.');
          }

          await ctx.invokeTool('manage_environment', {
            action: 'get',
            accountId,
            containerId,
            environmentId
          });
          await ctx.invokeTool('manage_environment', {
            action: 'update',
            accountId,
            containerId,
            environmentId,
            name:
              typeof environment.name === 'string'
                ? environment.name
                : createGtmName(ctx.runId, 'environment'),
            description: createGtmNote(ctx.runId, 'Updated'),
            enableDebug:
              typeof environment.enableDebug === 'boolean' ? environment.enableDebug : false,
            url:
              typeof environment.url === 'string'
                ? environment.url
                : `https://example.com/${createGtmSlug(ctx.runId)}`
          });
          await ctx.invokeTool('manage_environment', {
            action: 'reauthorize',
            accountId,
            containerId,
            environmentId
          });
        });
      }
    },
    manage_folder: {
      name: 'manage_folder organizes suite-owned entities',
      use: ['folder', 'tag', 'trigger', 'variable'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_folder', async () => {
          let folder = ctx.resource('folder');
          let accountId = String(folder.accountId);
          let containerId = String(folder.containerId);
          let workspaceId = String(folder.workspaceId);
          let folderId = String(folder.folderId);

          let list = await ctx.invokeTool('manage_folder', {
            action: 'list',
            accountId,
            containerId,
            workspaceId
          });
          if (
            !list.output.folders?.some(
              (candidate: { folderId?: string }) => candidate.folderId === folderId
            )
          ) {
            throw new Error('manage_folder list did not include the tracked folder.');
          }

          await ctx.invokeTool('manage_folder', {
            action: 'get',
            accountId,
            containerId,
            workspaceId,
            folderId
          });
          await ctx.invokeTool('manage_folder', {
            action: 'update',
            accountId,
            containerId,
            workspaceId,
            folderId,
            name:
              typeof folder.name === 'string'
                ? folder.name
                : createGtmName(ctx.runId, 'folder'),
            notes: createGtmNote(ctx.runId, 'Updated')
          });
          await ctx.invokeTool('manage_folder', {
            action: 'move_entities',
            accountId,
            containerId,
            workspaceId,
            folderId,
            tagIds: [String(ctx.resource('tag').tagId)],
            triggerIds: [String(ctx.resource('trigger').triggerId)],
            variableIds: [String(ctx.resource('variable').variableId)]
          });

          for (let attempt = 0; attempt < 5; attempt += 1) {
            let entities = await ctx.invokeTool('manage_folder', {
              action: 'list_entities',
              accountId,
              containerId,
              workspaceId,
              folderId
            });
            if ((entities.output.entities?.tagCount ?? 0) >= 1) {
              return;
            }

            await wait(1000 * (attempt + 1));
          }

          throw new Error('manage_folder list_entities did not report any moved tags.');
        });
      }
    },
    manage_user_permission: {
      name: 'manage_user_permission lists, gets, and updates the tracked permission',
      use: ['user_permission', 'container'],
      run: async ctx => {
        await skipOnQuotaExceeded(ctx, 'manage_user_permission', async () => {
          let permission = ctx.resource('user_permission');
          if (typeof permission.failure === 'string') {
            console.log(
              `[google-tag-manager e2e] Skipping manage_user_permission: ${permission.failure}`
            );
            return;
          }
          let container = ctx.resource('container');
          let accountId = String(permission.accountId);
          let permissionId = String(permission.permissionId);

          let list = await ctx.invokeTool('manage_user_permission', {
            action: 'list',
            accountId
          });
          if (
            !list.output.permissions?.some(
              (candidate: { permissionId?: string }) => candidate.permissionId === permissionId
            )
          ) {
            throw new Error('manage_user_permission list did not include the tracked permission.');
          }

          await ctx.invokeTool('manage_user_permission', {
            action: 'get',
            accountId,
            permissionId
          });
          await ctx.invokeTool('manage_user_permission', {
            action: 'update',
            accountId,
            permissionId,
            accountPermission: 'read',
            containerAccess: [
              {
                containerId: String(container.containerId),
                permission: 'edit'
              }
            ]
          });
        });
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleTagManagerToolE2E,
  timeoutMs: 3 * 60 * 1000
});
