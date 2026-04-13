import { SlateTool } from 'slates';
import { ClickHouseClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let apiKeySchema = z.object({
  keyId: z.string().describe('Unique API key identifier'),
  name: z.string().optional().describe('Name of the API key'),
  state: z.string().optional().describe('Key state (enabled, disabled)'),
  expireAt: z.string().optional().describe('Expiration date of the key'),
  assignedRoles: z
    .array(
      z.object({
        roleId: z.string().optional(),
        roleName: z.string().optional(),
        roleType: z.string().optional()
      })
    )
    .optional()
    .describe('Roles assigned to this key')
});

export let listApiKeys = SlateTool.create(spec, {
  name: 'List API Keys',
  key: 'list_api_keys',
  description: `List all API keys in the organization. Shows key names, states, expiration dates, and assigned roles.`,
  tags: {
    readOnly: true
  }
})
  .input(z.object({}))
  .output(
    z.object({
      apiKeys: z.array(apiKeySchema)
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let keys = await client.listApiKeys();
    let items = Array.isArray(keys) ? keys : [];

    return {
      output: {
        apiKeys: items.map((k: any) => ({
          keyId: k.id,
          name: k.name,
          state: k.state,
          expireAt: k.expireAt,
          assignedRoles: k.assignedRoles
        }))
      },
      message: `Found **${items.length}** API keys.`
    };
  })
  .build();

export let createApiKey = SlateTool.create(spec, {
  name: 'Create API Key',
  key: 'create_api_key',
  description: `Create a new API key for the organization. Specify the key name, permissions/roles, expiration, and optional IP restrictions. The key secret is only returned once — store it securely.`,
  constraints: [
    'Maximum 100 API keys per organization.',
    'The key secret is only returned at creation time and cannot be retrieved later.'
  ]
})
  .input(
    z.object({
      name: z.string().describe('Name for the new API key'),
      roles: z.array(z.string()).optional().describe('Roles to assign (e.g., ["admin"])'),
      assignedRoleIds: z.array(z.string()).optional().describe('Specific role IDs to assign'),
      expireAt: z.string().optional().describe('Expiration date in ISO-8601 format'),
      ipAccessList: z
        .array(
          z.object({
            source: z.string().describe('IP address or CIDR range'),
            description: z.string().optional()
          })
        )
        .optional()
        .describe('IP allow list for the key')
    })
  )
  .output(
    z.object({
      keyId: z.string().describe('ID of the created key'),
      keySecret: z.string().optional().describe('Key secret (only returned once)'),
      name: z.string().optional(),
      state: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let body: Record<string, any> = { name: ctx.input.name };
    if (ctx.input.roles) body.roles = ctx.input.roles;
    if (ctx.input.assignedRoleIds) body.assignedRoleIds = ctx.input.assignedRoleIds;
    if (ctx.input.expireAt) body.expireAt = ctx.input.expireAt;
    if (ctx.input.ipAccessList) body.ipAccessList = ctx.input.ipAccessList;

    let result = await client.createApiKey(body);

    return {
      output: {
        keyId: result.id || result.key?.id,
        keySecret: result.keySecret || result.key?.secret,
        name: result.name || result.key?.name,
        state: result.state || result.key?.state
      },
      message: `API key **${ctx.input.name}** created. Store the key secret securely — it cannot be retrieved later.`
    };
  })
  .build();

export let deleteApiKey = SlateTool.create(spec, {
  name: 'Delete API Key',
  key: 'delete_api_key',
  description: `Permanently delete an API key. The key used to authenticate the current request cannot be deleted.`,
  constraints: [
    'Cannot delete the key used to authenticate the current request.',
    'Deletion is permanent and cannot be undone.'
  ],
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      keyId: z.string().describe('ID of the API key to delete')
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

    await client.deleteApiKey(ctx.input.keyId);

    return {
      output: { deleted: true },
      message: `API key **${ctx.input.keyId}** permanently deleted.`
    };
  })
  .build();
