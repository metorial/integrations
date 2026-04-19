import {
  Slate,
  SlateAuth,
  SlateConfig,
  SlateSpecification,
  SlateTool
} from '@slates/provider';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  checkScopeCoverage,
  createSlateToolE2EEngine,
  createLocalSlateTestClient,
  defineSlateToolE2EIntegration,
  parseE2EFixtures,
  validateResourceDefinitions
} from './index';

(globalThis as typeof globalThis & { expect?: typeof expect }).expect = expect;

let createTestSpec = (key: string) => {
  let config = SlateConfig.create(z.object({})).getDefaultConfig(() => ({}));
  let auth = SlateAuth.create<{ token: string }>()
    .output(
      z.object({
        token: z.string()
      })
    )
    .addTokenAuth({
      type: 'auth.token',
      key: 'token_auth',
      name: 'Token Auth',
      inputSchema: z.object({
        token: z.string()
      }),
      getOutput: async ctx => ({
        output: {
          token: ctx.input.token
        }
      })
    });

  return SlateSpecification.create({
    key,
    name: key,
    config,
    auth
  });
};

let createProfile = (scopes: string[] = []) =>
  ({
    id: 'profile-1',
    auth: {
      token_auth: {
        output: {
          token: 'secret-token'
        },
        scopes
      }
    }
  }) as any;

let createClientForSlate = (provider: ReturnType<typeof Slate.create>) =>
  createLocalSlateTestClient({
    slate: provider,
    state: {
      config: {},
      auth: {
        authenticationMethodId: 'token_auth',
        output: {
          token: 'secret-token'
        }
      }
    }
  });

let createCrudSlate = () => {
  let spec = createTestSpec('demo-crud');
  let items: Array<{ itemId: string; name: string; teamId?: string }> = [];
  let counters = {
    get: 0
  };

  let itemSchema = z.object({
    itemId: z.string(),
    name: z.string(),
    teamId: z.string().optional()
  });

  let createItem = SlateTool.create(spec, {
    key: 'create_item',
    name: 'Create Item'
  })
    .input(
      z.object({
        name: z.string(),
        teamId: z.string().optional()
      })
    )
    .output(itemSchema)
    .handleInvocation(async ctx => {
      let item = {
        itemId: `item-${items.length + 1}`,
        name: ctx.input.name,
        teamId: ctx.input.teamId
      };
      items.push(item);
      return {
        output: item,
        message: 'created'
      };
    })
    .build();

  let getItem = SlateTool.create(spec, {
    key: 'get_item',
    name: 'Get Item',
    tags: { readOnly: true }
  })
    .input(
      z.object({
        itemId: z.string()
      })
    )
    .output(itemSchema)
    .handleInvocation(async ctx => {
      counters.get += 1;
      let item = items.find(candidate => candidate.itemId === ctx.input.itemId);
      if (!item) {
        throw new Error('missing item');
      }
      return {
        output: item,
        message: 'got'
      };
    })
    .build();

  let updateItem = SlateTool.create(spec, {
    key: 'update_item',
    name: 'Update Item'
  })
    .input(
      z.object({
        itemId: z.string(),
        name: z.string().optional()
      })
    )
    .output(itemSchema)
    .handleInvocation(async ctx => {
      let item = items.find(candidate => candidate.itemId === ctx.input.itemId);
      if (!item) {
        throw new Error('missing item');
      }
      if (ctx.input.name !== undefined) {
        item.name = ctx.input.name;
      }
      return {
        output: item,
        message: 'updated'
      };
    })
    .build();

  let deleteItem = SlateTool.create(spec, {
    key: 'delete_item',
    name: 'Delete Item'
  })
    .input(
      z.object({
        itemId: z.string()
      })
    )
    .output(
      z.object({
        success: z.boolean()
      })
    )
    .handleInvocation(async ctx => {
      items = items.filter(candidate => candidate.itemId !== ctx.input.itemId);
      return {
        output: {
          success: true
        },
        message: 'deleted'
      };
    })
    .build();

  let listItems = SlateTool.create(spec, {
    key: 'list_items',
    name: 'List Items',
    tags: { readOnly: true }
  })
    .input(
      z.object({
        limit: z.number().optional()
      })
    )
    .output(
      z.object({
        items: z.array(itemSchema)
      })
    )
    .handleInvocation(async () => ({
      output: {
        items
      },
      message: 'listed'
    }))
    .build();

  let searchItems = SlateTool.create(spec, {
    key: 'search_items',
    name: 'Search Items',
    tags: { readOnly: true }
  })
    .input(
      z.object({
        query: z.string()
      })
    )
    .output(
      z.object({
        items: z.array(itemSchema)
      })
    )
    .handleInvocation(async ctx => ({
      output: {
        items: items.filter(item => item.name.includes(ctx.input.query))
      },
      message: 'searched'
    }))
    .build();

  let provider = Slate.create({
    spec,
    tools: [createItem, getItem, updateItem, deleteItem, listItems, searchItems],
    triggers: []
  });

  return {
    provider,
    counters
  };
};

let createListBackedMutableSlate = () => {
  let spec = createTestSpec('demo-list-backed');
  let items = [{ itemId: 'item-1', name: 'seed item' }];

  let itemSchema = z.object({
    itemId: z.string(),
    name: z.string()
  });

  let updateItem = SlateTool.create(spec, {
    key: 'update_item',
    name: 'Update Item'
  })
    .input(
      z.object({
        itemId: z.string(),
        name: z.string().optional()
      })
    )
    .output(itemSchema)
    .handleInvocation(async ctx => {
      let item = items.find(candidate => candidate.itemId === ctx.input.itemId);
      if (!item) {
        throw new Error('missing item');
      }
      if (ctx.input.name !== undefined) {
        item.name = ctx.input.name;
      }
      return {
        output: item,
        message: 'updated'
      };
    })
    .build();

  let deleteItem = SlateTool.create(spec, {
    key: 'delete_item',
    name: 'Delete Item'
  })
    .input(
      z.object({
        itemId: z.string()
      })
    )
    .output(
      z.object({
        success: z.boolean()
      })
    )
    .handleInvocation(async ctx => {
      items = items.filter(candidate => candidate.itemId !== ctx.input.itemId);
      return {
        output: {
          success: true
        },
        message: 'deleted'
      };
    })
    .build();

  let listItems = SlateTool.create(spec, {
    key: 'list_items',
    name: 'List Items',
    tags: { readOnly: true }
  })
    .input(
      z.object({
        limit: z.number().optional()
      })
    )
    .output(
      z.object({
        items: z.array(itemSchema)
      })
    )
    .handleInvocation(async () => ({
      output: {
        items
      },
      message: 'listed'
    }))
    .build();

  let provider = Slate.create({
    spec,
    tools: [updateItem, deleteItem, listItems],
    triggers: []
  });

  return {
    provider
  };
};

afterEach(() => {
  delete process.env.SLATES_E2E_FIXTURES;
});

describe('@slates/test e2e framework', () => {
  it('parses fixtures with schema validation', () => {
    let fixtures = parseE2EFixtures(
      z.object({
        teamId: z.string()
      }),
      { teamId: 'team-1' }
    );

    expect(fixtures.teamId).toBe('team-1');
    expect(() =>
      parseE2EFixtures(
        z.object({
          teamId: z.string()
        }),
        {}
      )
    ).toThrow('fixtures validation failed');
  });

  it('fails early when required provider config is missing', async () => {
    let baseSpec = createTestSpec('configured-slate');
    let spec = SlateSpecification.create({
      key: 'configured-slate',
      name: 'configured-slate',
      config: SlateConfig.create(
        z.object({
          projectId: z.string()
        })
      ),
      auth: baseSpec.auth
    });

    let listItems = SlateTool.create(spec, {
      name: 'List Items',
      key: 'list_items',
      description: 'Lists items.',
      tags: {
        readOnly: true
      }
    })
      .input(z.object({}))
      .output(
        z.object({
          items: z.array(
            z.object({
              itemId: z.string(),
              name: z.string()
            })
          )
        })
      )
      .handleInvocation(async () => ({
        output: {
          items: [{ itemId: 'item-1', name: 'Item 1' }]
        }
      }))
      .build();

    let provider = Slate.create({
      spec,
      tools: [listItems],
      triggers: []
    });

    let client = createLocalSlateTestClient({
      slate: provider,
      state: {
        auth: {
          authenticationMethodId: 'token_auth',
          output: {
            token: 'secret-token'
          }
        }
      }
    });

    try {
      await createSlateToolE2EEngine({
        provider,
        client,
        profile: {
          ...createProfile(),
          config: null
        } as any
      });
      throw new Error('Expected missing config to fail engine creation.');
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      expect(message).toContain(
        'Missing or invalid provider config for live E2E tools (configured-slate).'
      );
      expect(message).toContain('projectId');
      expect(message).toContain('configured-slate config set');
    }
  });

  it('resolves fixture-backed dependencies before generic resource creation', async () => {
    let { provider } = createCrudSlate();
    let engine = await createSlateToolE2EEngine({
      provider,
      integration: defineSlateToolE2EIntegration({
        resources: {
          team: {
            fromFixture: ctx => ({
              teamId: ctx.fixtures.teamId
            })
          },
          item: {
            use: ['team']
          }
        }
      }),
      client: createClientForSlate(provider),
      profile: createProfile(),
      fixturesRaw: {
        teamId: 'team-42'
      }
    });

    await engine.runScenario('update_item');

    expect(engine.context.listResources('team')).toHaveLength(1);
    expect(engine.context.listResources('item')[0]?.value.teamId).toBe('team-42');
  });

  it('generic create scenarios provide reusable resources', async () => {
    let { provider } = createCrudSlate();
    let engine = await createSlateToolE2EEngine({
      provider,
      client: createClientForSlate(provider),
      profile: createProfile()
    });

    await engine.runScenario('create_item');

    expect(engine.context.listResources('item')).toHaveLength(1);
    expect(engine.context.listResources('item')[0]?.value.name).toContain('name');
  });

  it('generic update scenarios perform get read-back verification', async () => {
    let { provider, counters } = createCrudSlate();
    let engine = await createSlateToolE2EEngine({
      provider,
      client: createClientForSlate(provider),
      profile: createProfile()
    });

    await engine.runScenario('update_item');

    expect(counters.get).toBeGreaterThan(0);
    expect(engine.context.listResources('item')[0]?.value.name).toContain('name');
  });

  it('generic list and search scenarios assert the seeded resource is present', async () => {
    let { provider } = createCrudSlate();
    let engine = await createSlateToolE2EEngine({
      provider,
      client: createClientForSlate(provider),
      profile: createProfile()
    });

    await engine.runScenario('list_items');
    await engine.runScenario('search_items');

    expect(engine.context.listResources('item')).toHaveLength(1);
  });

  it('blocks generic mutation when a resource was only discovered via list fallback', async () => {
    let { provider } = createListBackedMutableSlate();
    let engine = await createSlateToolE2EEngine({
      provider,
      integration: defineSlateToolE2EIntegration({
        resources: {
          item: {}
        }
      }),
      client: createClientForSlate(provider),
      profile: createProfile()
    });

    await expect(engine.runScenario('update_item')).rejects.toThrow(
      'Default update_item scenario requires a resource created by the suite.'
    );
    await expect(engine.runScenario('delete_item')).rejects.toThrow(
      'Default delete_item scenario requires a resource created by the suite.'
    );
  });

  it('validates soft-cleanup resources require a janitor', () => {
    let { provider } = createCrudSlate();
    let errors = validateResourceDefinitions({
      tools: provider.actions.filter(action => action.type === 'tool') as any,
      resources: {
        managed_channel: {
          cleanup: {
            kind: 'soft',
            run: async () => {}
          }
        }
      }
    });

    expect(errors).toEqual([
      'Resource "managed_channel" uses soft cleanup but does not define a janitor.'
    ]);
  });

  it('runs cleanup in reverse order of resource creation', async () => {
    let spec = createTestSpec('cleanup-demo');
    let noop = SlateTool.create(spec, {
      key: 'noop',
      name: 'Noop'
    })
      .input(z.object({}))
      .output(z.object({}))
      .handleInvocation(async () => ({
        output: {},
        message: 'noop'
      }))
      .build();

    let provider = Slate.create({
      spec,
      tools: [noop],
      triggers: []
    });

    let order: string[] = [];
    let engine = await createSlateToolE2EEngine({
      provider,
      integration: defineSlateToolE2EIntegration({
        resources: {
          parent: {
            create: async () => ({ id: 'parent' }),
            cleanup: {
              kind: 'delete',
              run: async () => {
                order.push('parent');
              }
            }
          },
          child: {
            use: ['parent'],
            create: async () => ({ id: 'child' }),
            cleanup: {
              kind: 'delete',
              run: async () => {
                order.push('child');
              }
            }
          }
        },
        scenarioOverrides: {
          noop: {
            use: ['child'],
            run: async () => {}
          }
        }
      }),
      client: createClientForSlate(provider),
      profile: createProfile()
    });

    await engine.runScenario('noop');
    await engine.runAfterSuite();

    expect(order).toEqual(['child', 'parent']);
  });

  it('reports missing scope coverage per tool', () => {
    let spec = createTestSpec('scope-demo');
    let scopedTool = SlateTool.create(spec, {
      key: 'create_item',
      name: 'Create Item'
    })
      .scopes({
        AND: [{ OR: ['scope:write', 'scope:admin'] }]
      })
      .input(
        z.object({
          name: z.string()
        })
      )
      .output(
        z.object({
          itemId: z.string()
        })
      )
      .handleInvocation(async () => ({
        output: {
          itemId: 'item-1'
        },
        message: 'created'
      }))
      .build();

    let failures = checkScopeCoverage([scopedTool as any], createProfile(['scope:read']) as any);

    expect(failures).toEqual([
      {
        toolId: 'create_item',
        missingClauses: [['scope:write', 'scope:admin']]
      }
    ]);
  });

  it('reports uncovered tools when no override or generic scenario exists', async () => {
    let spec = createTestSpec('uncovered-demo');
    let customTool = SlateTool.create(spec, {
      key: 'manage_widget',
      name: 'Manage Widget'
    })
      .input(
        z.object({
          action: z.string()
        })
      )
      .output(z.object({}))
      .handleInvocation(async () => ({
        output: {},
        message: 'done'
      }))
      .build();

    let provider = Slate.create({
      spec,
      tools: [customTool],
      triggers: []
    });

    let engine = await createSlateToolE2EEngine({
      provider,
      client: createClientForSlate(provider),
      profile: createProfile()
    });

    expect(engine.uncoveredTools).toEqual(['manage_widget']);
  });
});
