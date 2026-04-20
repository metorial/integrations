import {
  defineSlateToolE2EIntegration,
  loadSlatesProfile,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { Slate } from 'slates';
import { describe, it } from 'vitest';
import { provider } from './index';

type GoogleAdminProfileConfig = {
  domain?: string;
};

let workspaceDomainCache: string | undefined;

let getStoredAuthProfileEmail = (ctx: ToolE2EContext) => {
  let auth = Object.values(ctx.profile.auth ?? {})[0];
  let authProfile = auth?.profile;

  if (!authProfile || typeof authProfile !== 'object') {
    return undefined;
  }

  let email = (authProfile as { email?: unknown }).email;
  return typeof email === 'string' && email.length > 0 ? email : undefined;
};

let slugify = (value: string, maxLength = 28) => {
  let slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

  if (slug.length === 0) {
    return 'slates-e2e';
  }

  return slug.slice(0, maxLength).replace(/-+$/g, '') || 'slates-e2e';
};

let createResourceToken = (ctx: ToolE2EContext, label: string, maxLength = 28) =>
  slugify(`${label}-${ctx.runId}-${Math.random().toString(36).slice(2, 8)}`, maxLength);

let getConfiguredDomain = (ctx: ToolE2EContext) => {
  let config = ctx.profile.config as GoogleAdminProfileConfig | null;
  return typeof config?.domain === 'string' && config.domain.length > 0
    ? config.domain
    : undefined;
};

let getWorkspaceDomain = async (ctx: ToolE2EContext) => {
  if (workspaceDomainCache) {
    return workspaceDomainCache;
  }

  let configuredDomain = getConfiguredDomain(ctx);
  if (configuredDomain) {
    workspaceDomainCache = configuredDomain;
    return configuredDomain;
  }

  let authEmail = getStoredAuthProfileEmail(ctx);
  if (authEmail && authEmail.includes('@')) {
    workspaceDomainCache = authEmail.split('@')[1]!;
    return workspaceDomainCache;
  }

  let customerInfo = await ctx.invokeTool('get_customer_info', {});
  let customerDomain = customerInfo.output.customerDomain;
  if (typeof customerDomain !== 'string' || customerDomain.length === 0) {
    throw new Error('Unable to determine the Google Workspace domain for live E2E setup.');
  }

  workspaceDomainCache = customerDomain;
  return customerDomain;
};

let createWorkspaceEmail = async (
  ctx: ToolE2EContext,
  label: string,
  localPartLength = 30
) => {
  let domain = await getWorkspaceDomain(ctx);
  return `${createResourceToken(ctx, label, localPartLength)}@${domain}`;
};

let createStrongPassword = (ctx: ToolE2EContext) =>
  `Slates!9${createResourceToken(ctx, 'pw', 12)}Aa`;

let daysAgoIsoDate = (daysAgo: number) => {
  let date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

let hoursAgoIsoDateTime = (hoursAgo: number) => {
  let date = new Date();
  date.setUTCHours(date.getUTCHours() - hoursAgo, 0, 0, 0);
  return date.toISOString();
};

let findRolePrivilege = async (ctx: ToolE2EContext) => {
  let listed = await ctx.invokeTool('manage_roles', {
    action: 'list_roles',
    maxResults: 50
  });

  for (let role of listed.output.roles ?? []) {
    if (typeof role.roleId !== 'string' || role.roleId.length === 0) {
      continue;
    }

    let details = await ctx.invokeTool('manage_roles', {
      action: 'get_role',
      roleId: role.roleId
    });

    let privilege = details.output.role?.rolePrivileges?.find(
      (candidate: { privilegeName?: string; serviceId?: string }) =>
        typeof candidate?.privilegeName === 'string' &&
        candidate.privilegeName.length > 0 &&
        typeof candidate?.serviceId === 'string' &&
        candidate.serviceId.length > 0
    );

    if (privilege) {
      return {
        privilegeName: String(privilege.privilegeName),
        serviceId: String(privilege.serviceId)
      };
    }
  }

  throw new Error('Unable to discover a reusable Google Admin privilege for role creation.');
};

let e2eProvider = Slate.create({
  spec: provider.spec,
  triggers: provider.actions.filter(action => action.type === 'trigger'),
  tools: provider.actions.filter(
    action => action.type === 'tool' && action.key !== 'manage_alerts'
  )
});

let getStoredAuthEmail = async () => {
  let profile = await loadSlatesProfile().catch(() => null);
  let auth = Object.values(profile?.auth ?? {})[0];
  let authProfile = auth?.profile;

  if (!authProfile || typeof authProfile !== 'object') {
    return undefined;
  }

  let email = (authProfile as { email?: unknown }).email;
  return typeof email === 'string' && email.length > 0 ? email : undefined;
};

let isConsumerGoogleEmail = (email?: string) =>
  Boolean(email && /@(gmail|googlemail)\.com$/i.test(email));

export let googleAdminToolE2E = defineSlateToolE2EIntegration({
  resources: {
    user: {
      create: async ctx => {
        let primaryEmail = await createWorkspaceEmail(ctx, 'user');
        let givenName = `Slates${createResourceToken(ctx, 'given', 12)}`;
        let familyName = 'E2E';
        let result = await ctx.invokeTool('create_user', {
          primaryEmail,
          givenName,
          familyName,
          password: createStrongPassword(ctx),
          changePasswordAtNextLogin: false
        });

        return {
          ...result.output,
          userKey: result.output.primaryEmail ?? primaryEmail
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.userKey !== 'string') {
            return;
          }

          await ctx.invokeTool('delete_user', {
            userKey: value.userKey,
            action: 'delete'
          });
        }
      }
    },
    user_alias: {
      use: ['user'],
      create: async ctx => {
        let user = ctx.resource('user');
        let domain =
          typeof user.primaryEmail === 'string' && user.primaryEmail.includes('@')
            ? user.primaryEmail.split('@')[1]
            : await getWorkspaceDomain(ctx);
        let alias = `${createResourceToken(ctx, 'alias', 24)}@${domain}`;

        await ctx.invokeTool('manage_user_aliases', {
          userKey: String(user.userKey),
          action: 'add',
          alias
        });

        return {
          userKey: String(user.userKey),
          alias
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.userKey !== 'string' || typeof value.alias !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_user_aliases', {
            userKey: value.userKey,
            action: 'remove',
            alias: value.alias
          });
        }
      }
    },
    group: {
      create: async ctx => {
        let email = await createWorkspaceEmail(ctx, 'group');
        let name = `Slates ${createResourceToken(ctx, 'group-name', 18)}`;
        let description = `Created by ${ctx.runId}`;
        let result = await ctx.invokeTool('manage_group', {
          action: 'create',
          email,
          name,
          description
        });

        return {
          ...result.output,
          groupKey: result.output.email ?? email
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.groupKey !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_group', {
            action: 'delete',
            groupKey: value.groupKey
          });
        }
      }
    },
    group_member: {
      use: ['group', 'user'],
      create: async ctx => {
        let group = ctx.resource('group');
        let user = ctx.resource('user');

        await ctx.invokeTool('manage_group_members', {
          groupKey: String(group.groupKey),
          action: 'add',
          memberEmail: String(user.primaryEmail),
          role: 'MEMBER'
        });

        return {
          groupKey: String(group.groupKey),
          memberEmail: String(user.primaryEmail),
          role: 'MEMBER'
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.groupKey !== 'string' ||
            typeof value.memberEmail !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_group_members', {
            groupKey: value.groupKey,
            action: 'remove',
            memberEmail: value.memberEmail
          });
        }
      }
    },
    org_unit: {
      create: async ctx => {
        let name = createResourceToken(ctx, 'ou', 24);
        let description = `Created by ${ctx.runId}`;
        let result = await ctx.invokeTool('manage_org_units', {
          action: 'create',
          name,
          description
        });

        return result.output.orgUnit ?? {};
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.orgUnitPath !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_org_units', {
            action: 'delete',
            orgUnitPath: value.orgUnitPath
          });
        }
      }
    },
    role: {
      create: async ctx => {
        let privilege = await findRolePrivilege(ctx);
        let result = await ctx.invokeTool('manage_roles', {
          action: 'create_role',
          roleName: createResourceToken(ctx, 'role', 30),
          roleDescription: `Created by ${ctx.runId}`,
          rolePrivileges: [privilege]
        });

        return result.output.role ?? {};
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.roleId !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_roles', {
            action: 'delete_role',
            roleId: value.roleId
          });
        }
      }
    },
    calendar_resource: {
      create: async ctx => {
        let existing = await ctx.invokeTool('manage_calendar_resources', {
          action: 'list',
          maxResults: 1
        });
        let buildingId =
          typeof existing.output.resources?.[0]?.buildingId === 'string'
            ? existing.output.resources[0].buildingId
            : undefined;

        let result = await ctx.invokeTool('manage_calendar_resources', {
          action: 'create',
          calendarResourceId: createResourceToken(ctx, 'room', 28),
          resourceName: `Slates ${createResourceToken(ctx, 'room-name', 18)}`,
          resourceType: 'Conference Room',
          resourceDescription: `Created by ${ctx.runId}`,
          buildingId
        });

        return result.output.resource ?? {};
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.calendarResourceId !== 'string') {
            return;
          }

          await ctx.invokeTool('manage_calendar_resources', {
            action: 'delete',
            calendarResourceId: value.calendarResourceId
          });
        }
      }
    }
  },
  scenarioOverrides: {
    list_users: {
      name: 'list_users returns directory users',
      run: async ctx => {
        let result = await ctx.invokeTool('list_users', {
          maxResults: 10,
          orderBy: 'email'
        });

        if ((result.output.users ?? []).length === 0) {
          throw new Error('list_users did not return any users.');
        }
      }
    },
    get_user: {
      name: 'get_user reads an existing tenant user',
      run: async ctx => {
        let listed = await ctx.invokeTool('list_users', {
          maxResults: 1,
          orderBy: 'email'
        });
        let user = listed.output.users?.[0];
        let userKey = user?.primaryEmail ?? user?.userId;

        if (typeof userKey !== 'string' || userKey.length === 0) {
          throw new Error('Unable to find a user for get_user.');
        }

        let result = await ctx.invokeTool('get_user', { userKey });
        if (typeof user?.userId === 'string' && result.output.userId !== user.userId) {
          throw new Error('get_user returned a different user than the selected directory entry.');
        }
      }
    },
    create_user: {
      name: 'create_user creates a disposable Workspace user',
      use: ['user'],
      run: async () => {}
    },
    update_user: {
      name: 'update_user mutates the created user profile',
      use: ['user'],
      run: async ctx => {
        let user = ctx.resource('user');
        let givenName = `Updated${createResourceToken(ctx, 'user', 12)}`;

        await ctx.invokeTool('update_user', {
          userKey: String(user.userKey),
          givenName
        });

        let readBack = await ctx.invokeTool('get_user', {
          userKey: String(user.userKey)
        });

        if (readBack.output.name?.givenName !== givenName) {
          throw new Error('update_user did not persist the updated given name.');
        }

        ctx.updateResource('user', readBack.output);
      }
    },
    delete_user: {
      name: 'delete_user removes the created user',
      use: ['user'],
      run: async ctx => {
        let user = ctx.resource('user');
        let result = await ctx.invokeTool('delete_user', {
          userKey: String(user.userKey),
          action: 'delete'
        });

        if (!result.output.success) {
          throw new Error('delete_user did not report success.');
        }

        ctx.deleteResource('user');
      }
    },
    manage_user_aliases: {
      name: 'manage_user_aliases lists aliases for the created user alias',
      use: ['user_alias'],
      run: async ctx => {
        let userAlias = ctx.resource('user_alias');
        let result = await ctx.invokeTool('manage_user_aliases', {
          userKey: String(userAlias.userKey),
          action: 'list'
        });

        if (
          !result.output.aliases?.some(
            (candidate: { alias?: string }) => candidate.alias === String(userAlias.alias)
          )
        ) {
          throw new Error('manage_user_aliases list did not include the tracked alias.');
        }
      }
    },
    list_groups: {
      name: 'list_groups lists tenant groups',
      run: async ctx => {
        await ctx.invokeTool('list_groups', {
          maxResults: 10
        });
      }
    },
    manage_group: {
      name: 'manage_group gets and updates the created group',
      use: ['group'],
      run: async ctx => {
        let group = ctx.resource('group');
        let description = `Updated by ${ctx.runId}`;

        await ctx.invokeTool('manage_group', {
          action: 'get',
          groupKey: String(group.groupKey)
        });

        await ctx.invokeTool('manage_group', {
          action: 'update',
          groupKey: String(group.groupKey),
          description
        });

        let readBack = await ctx.invokeTool('manage_group', {
          action: 'get',
          groupKey: String(group.groupKey)
        });

        if (readBack.output.description !== description) {
          throw new Error('manage_group did not persist the updated group description.');
        }

        ctx.updateResource('group', readBack.output);
      }
    },
    manage_group_members: {
      name: 'manage_group_members lists and updates the created membership',
      use: ['group_member'],
      run: async ctx => {
        let groupMember = ctx.resource('group_member');

        let listed = await ctx.invokeTool('manage_group_members', {
          groupKey: String(groupMember.groupKey),
          action: 'list'
        });

        if (
          !listed.output.members?.some(
            (candidate: { email?: string }) =>
              candidate.email === String(groupMember.memberEmail)
          )
        ) {
          throw new Error('manage_group_members list did not include the tracked member.');
        }

        await ctx.invokeTool('manage_group_members', {
          groupKey: String(groupMember.groupKey),
          action: 'update',
          memberEmail: String(groupMember.memberEmail),
          role: 'MANAGER'
        });

        let readBack = await ctx.invokeTool('manage_group_members', {
          groupKey: String(groupMember.groupKey),
          action: 'list'
        });

        if (
          !readBack.output.members?.some(
            (candidate: { email?: string; role?: string }) =>
              candidate.email === String(groupMember.memberEmail) &&
              candidate.role === 'MANAGER'
          )
        ) {
          throw new Error('manage_group_members did not persist the updated member role.');
        }

        ctx.updateResource('group_member', {
          role: 'MANAGER'
        });
      }
    },
    manage_org_units: {
      name: 'manage_org_units gets, lists, and updates the created org unit',
      use: ['org_unit'],
      run: async ctx => {
        let orgUnit = ctx.resource('org_unit');
        let description = `Updated by ${ctx.runId}`;

        await ctx.invokeTool('manage_org_units', {
          action: 'list',
          listType: 'all'
        });

        await ctx.invokeTool('manage_org_units', {
          action: 'update',
          orgUnitPath: String(orgUnit.orgUnitPath),
          description
        });

        let readBack = await ctx.invokeTool('manage_org_units', {
          action: 'get',
          orgUnitPath: String(orgUnit.orgUnitPath)
        });

        if (readBack.output.orgUnit?.description !== description) {
          throw new Error('manage_org_units did not persist the updated description.');
        }

        ctx.updateResource('org_unit', readBack.output.orgUnit ?? {});
      }
    },
    manage_roles: {
      name: 'manage_roles gets, lists, and inspects assignments for the created role',
      use: ['role'],
      run: async ctx => {
        let role = ctx.resource('role');

        await ctx.invokeTool('manage_roles', {
          action: 'list_roles',
          maxResults: 50
        });

        let readBack = await ctx.invokeTool('manage_roles', {
          action: 'get_role',
          roleId: String(role.roleId)
        });

        await ctx.invokeTool('manage_roles', {
          action: 'list_assignments',
          roleId: String(role.roleId),
          maxResults: 20
        });

        ctx.updateResource('role', readBack.output.role ?? {});
      }
    },
    manage_chromeos_devices: {
      name: 'manage_chromeos_devices lists devices and reads one when available',
      run: async ctx => {
        let listed = await ctx.invokeTool('manage_chromeos_devices', {
          action: 'list',
          maxResults: 10
        });
        let deviceId = listed.output.devices?.[0]?.deviceId;

        if (typeof deviceId === 'string' && deviceId.length > 0) {
          await ctx.invokeTool('manage_chromeos_devices', {
            action: 'get',
            deviceId
          });
        }
      }
    },
    manage_mobile_devices: {
      name: 'manage_mobile_devices lists devices and reads one when available',
      run: async ctx => {
        let listed = await ctx.invokeTool('manage_mobile_devices', {
          action: 'list',
          maxResults: 10
        });
        let resourceId = listed.output.devices?.[0]?.resourceId;

        if (typeof resourceId === 'string' && resourceId.length > 0) {
          await ctx.invokeTool('manage_mobile_devices', {
            action: 'get',
            resourceId
          });
        }
      }
    },
    manage_domains: {
      name: 'manage_domains lists domains and gets the primary tenant domain',
      run: async ctx => {
        let listed = await ctx.invokeTool('manage_domains', {
          action: 'list'
        });
        let domainName =
          listed.output.domains?.[0]?.domainName ?? (await getWorkspaceDomain(ctx));

        await ctx.invokeTool('manage_domains', {
          action: 'get',
          domainName: String(domainName)
        });
      }
    },
    get_activity_reports: {
      name: 'get_activity_reports fetches recent admin audit entries',
      run: async ctx => {
        await ctx.invokeTool('get_activity_reports', {
          userKey: 'all',
          applicationName: 'admin',
          startTime: hoursAgoIsoDateTime(168),
          maxResults: 10
        });
      }
    },
    get_usage_reports: {
      name: 'get_usage_reports fetches a recent customer usage report',
      run: async ctx => {
        await ctx.invokeTool('get_usage_reports', {
          reportType: 'customer',
          date: daysAgoIsoDate(3)
        });
      }
    },
    manage_alerts: {
      name: 'manage_alerts lists alerts and reads alert details when available',
      run: async ctx => {
        let listed = await ctx.invokeTool('manage_alerts', {
          action: 'list',
          pageSize: 10
        });
        let alertId = listed.output.alerts?.[0]?.alertId;

        if (typeof alertId === 'string' && alertId.length > 0) {
          await ctx.invokeTool('manage_alerts', {
            action: 'get',
            alertId
          });
          await ctx.invokeTool('manage_alerts', {
            action: 'list_feedback',
            alertId
          });
          await ctx.invokeTool('manage_alerts', {
            action: 'get_metadata',
            alertId
          });
        }
      }
    },
    manage_calendar_resources: {
      name: 'manage_calendar_resources gets, lists, and updates the created resource',
      use: ['calendar_resource'],
      run: async ctx => {
        let calendarResource = ctx.resource('calendar_resource');
        let resourceDescription = `Updated by ${ctx.runId}`;

        await ctx.invokeTool('manage_calendar_resources', {
          action: 'list',
          maxResults: 20
        });

        await ctx.invokeTool('manage_calendar_resources', {
          action: 'update',
          calendarResourceId: String(calendarResource.calendarResourceId),
          resourceDescription
        });

        let readBack = await ctx.invokeTool('manage_calendar_resources', {
          action: 'get',
          calendarResourceId: String(calendarResource.calendarResourceId)
        });

        if (readBack.output.resource?.resourceDescription !== resourceDescription) {
          throw new Error(
            'manage_calendar_resources did not persist the updated resource description.'
          );
        }

        ctx.updateResource('calendar_resource', readBack.output.resource ?? {});
      }
    },
    manage_licenses: {
      name: 'manage_licenses lists Workspace assignments and reads one when available',
      run: async ctx => {
        let listed = await ctx.invokeTool('manage_licenses', {
          action: 'list',
          productId: 'Google-Apps',
          maxResults: 10
        });
        let license = listed.output.licenses?.find(
          (candidate: { skuId?: string; userId?: string }) =>
            typeof candidate.skuId === 'string' &&
            candidate.skuId.length > 0 &&
            typeof candidate.userId === 'string' &&
            candidate.userId.length > 0
        );

        if (license) {
          await ctx.invokeTool('manage_licenses', {
            action: 'get',
            productId: 'Google-Apps',
            skuId: String(license.skuId),
            userId: String(license.userId)
          });
        }
      }
    },
    transfer_data: {
      name: 'transfer_data lists transfer applications and reads a transfer when available',
      run: async ctx => {
        await ctx.invokeTool('transfer_data', {
          action: 'list_applications'
        });

        let listed = await ctx.invokeTool('transfer_data', {
          action: 'list',
          maxResults: 10
        });
        let transferId = listed.output.transfers?.[0]?.transferId;

        if (typeof transferId === 'string' && transferId.length > 0) {
          await ctx.invokeTool('transfer_data', {
            action: 'get',
            transferId
          });
        }
      }
    },
    get_customer_info: {
      name: 'get_customer_info returns tenant metadata',
      run: async ctx => {
        await ctx.invokeTool('get_customer_info', {});
      }
    }
  }
});

let storedAuthEmail = await getStoredAuthEmail();

if (isConsumerGoogleEmail(storedAuthEmail)) {
  describe.sequential('google-admin live tool e2e', () => {
    it.skip(
      `requires a Google Workspace admin account (current auth email: ${storedAuthEmail})`,
      () => {}
    );
  });
} else {
  runSlateToolE2ESuite({
    provider: e2eProvider,
    integration: googleAdminToolE2E
  });
}
