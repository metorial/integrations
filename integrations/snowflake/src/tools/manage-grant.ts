import { SlateTool } from 'slates';
import { SnowflakeClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageGrant = SlateTool.create(
  spec,
  {
    name: 'Manage Grant',
    key: 'manage_grant',
    description: `Grant or revoke privileges on Snowflake objects. Use this to control access by assigning specific privileges (e.g. SELECT, INSERT, USAGE) on resources (databases, schemas, tables, warehouses) to roles.`,
    instructions: [
      'For the securable, specify the type (e.g. "database", "schema", "table", "warehouse") and the fully qualified name.',
      'Use the Execute SQL tool for complex grant scenarios like GRANT ROLE or future grants.',
    ],
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    action: z.enum(['grant', 'revoke']).describe('Whether to grant or revoke privileges'),
    privileges: z.array(z.string()).describe('Privileges to grant or revoke (e.g. "SELECT", "INSERT", "USAGE", "ALL PRIVILEGES")'),
    securableType: z.string().describe('Type of securable object (e.g. "database", "schema", "table", "warehouse")'),
    securableName: z.string().describe('Fully qualified name of the securable object'),
    roleName: z.string().describe('Role to grant privileges to or revoke from'),
  }))
  .output(z.object({
    success: z.boolean().describe('Whether the grant/revoke operation succeeded'),
    action: z.string().describe('The action that was performed'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new SnowflakeClient({
      accountIdentifier: ctx.config.accountIdentifier,
      token: ctx.auth.token,
      tokenType: ctx.auth.tokenType,
    });

    let body: Record<string, any> = {
      privileges: ctx.input.privileges,
      securable: {
        type: ctx.input.securableType,
        name: ctx.input.securableName,
      },
      role: ctx.input.roleName,
    };

    if (ctx.input.action === 'grant') {
      await client.grantPrivileges(body);
    } else {
      await client.revokeGrant(body);
    }

    let actionLabel = ctx.input.action === 'grant' ? 'Granted' : 'Revoked';
    let privList = ctx.input.privileges.join(', ');

    return {
      output: {
        success: true,
        action: ctx.input.action,
      },
      message: `${actionLabel} **${privList}** on ${ctx.input.securableType} **${ctx.input.securableName}** ${ctx.input.action === 'grant' ? 'to' : 'from'} role **${ctx.input.roleName}**`,
    };
  })
  .build();
