import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { clientFromContext, flattenParams } from '../lib/helpers';
import { extractXmlValue, extractXmlValues, extractXmlBlocks } from '../lib/xml';

let IAM_VERSION = '2010-05-08';
let IAM_SERVICE = 'iam';

let iamQuery = (ctx: any, action: string, params?: Record<string, string>) =>
  clientFromContext(ctx).queryApi({
    service: IAM_SERVICE,
    action,
    version: IAM_VERSION,
    params,
  });

let iamPost = (ctx: any, action: string, params?: Record<string, string>) =>
  clientFromContext(ctx).postQueryApi({
    service: IAM_SERVICE,
    action,
    version: IAM_VERSION,
    params,
  });

let parseUser = (xml: string) => ({
  userName: extractXmlValue(xml, 'UserName'),
  userId: extractXmlValue(xml, 'UserId'),
  arn: extractXmlValue(xml, 'Arn'),
  path: extractXmlValue(xml, 'Path'),
  createDate: extractXmlValue(xml, 'CreateDate'),
  passwordLastUsed: extractXmlValue(xml, 'PasswordLastUsed'),
});

let parseRole = (xml: string) => ({
  roleName: extractXmlValue(xml, 'RoleName'),
  roleId: extractXmlValue(xml, 'RoleId'),
  arn: extractXmlValue(xml, 'Arn'),
  path: extractXmlValue(xml, 'Path'),
  createDate: extractXmlValue(xml, 'CreateDate'),
  description: extractXmlValue(xml, 'Description'),
  maxSessionDuration: extractXmlValue(xml, 'MaxSessionDuration'),
  assumeRolePolicyDocument: extractXmlValue(xml, 'AssumeRolePolicyDocument'),
});

let parseAttachedPolicy = (xml: string) => ({
  policyName: extractXmlValue(xml, 'PolicyName'),
  policyArn: extractXmlValue(xml, 'PolicyArn'),
});

let userSchema = z.object({
  userName: z.string().optional().describe('Name of the IAM user'),
  userId: z.string().optional().describe('Unique ID of the IAM user'),
  arn: z.string().optional().describe('ARN of the IAM user'),
  path: z.string().optional().describe('Path of the IAM user'),
  createDate: z.string().optional().describe('Date the user was created'),
  passwordLastUsed: z.string().optional().describe('Date the password was last used'),
});

let roleSchema = z.object({
  roleName: z.string().optional().describe('Name of the IAM role'),
  roleId: z.string().optional().describe('Unique ID of the IAM role'),
  arn: z.string().optional().describe('ARN of the IAM role'),
  path: z.string().optional().describe('Path of the IAM role'),
  createDate: z.string().optional().describe('Date the role was created'),
  description: z.string().optional().describe('Description of the IAM role'),
  maxSessionDuration: z.string().optional().describe('Maximum session duration in seconds'),
  assumeRolePolicyDocument: z.string().optional().describe('Trust policy document (URL-encoded JSON)'),
});

let attachedPolicySchema = z.object({
  policyName: z.string().optional().describe('Name of the attached policy'),
  policyArn: z.string().optional().describe('ARN of the attached policy'),
});

export let manageIamTool = SlateTool.create(
  spec,
  {
    name: 'Manage IAM',
    key: 'manage_iam',
    description: `Manage AWS IAM users, roles, and policy attachments. Supports listing, creating, and deleting users; listing and inspecting roles; and attaching or detaching managed policies to users and roles.`,
    instructions: [
      'Use **operation** to select the action: list_users, get_user, create_user, delete_user, list_roles, get_role, list_user_policies, list_role_policies, attach_user_policy, detach_user_policy, attach_role_policy, or detach_role_policy.',
      'For user operations, provide **userName**.',
      'For role operations, provide **roleName**.',
      'For policy attach/detach operations, provide the target name (userName or roleName) and **policyArn**.',
      'When creating a user, optionally provide **path** and **tags**.',
      'List operations support pagination via **marker** and **maxItems**.',
    ],
    constraints: [
      'IAM is a global service; region configuration is not used for IAM calls.',
      'User and role names are case-insensitive for uniqueness but case-preserving.',
      'Deleting a user requires removing all attached policies, access keys, and group memberships first.',
    ],
    tags: {
      destructive: false,
    },
  }
)
  .input(z.object({
    operation: z.enum([
      'list_users',
      'get_user',
      'create_user',
      'delete_user',
      'list_roles',
      'get_role',
      'list_user_policies',
      'list_role_policies',
      'attach_user_policy',
      'detach_user_policy',
      'attach_role_policy',
      'detach_role_policy',
    ]).describe('The IAM operation to perform'),
    userName: z.string().optional().describe('IAM user name. Required for user operations (get_user, create_user, delete_user, list_user_policies, attach_user_policy, detach_user_policy)'),
    roleName: z.string().optional().describe('IAM role name. Required for role operations (get_role, list_role_policies, attach_role_policy, detach_role_policy)'),
    policyArn: z.string().optional().describe('Full ARN of the managed policy. Required for attach/detach operations (e.g., arn:aws:iam::aws:policy/ReadOnlyAccess)'),
    path: z.string().optional().describe('Path for the new user (defaults to /). Used with create_user'),
    tags: z.array(z.object({
      key: z.string().describe('Tag key'),
      value: z.string().describe('Tag value'),
    })).optional().describe('Tags to attach to the new user. Used with create_user'),
    maxItems: z.number().optional().describe('Maximum number of items to return (1-1000). Used with list operations'),
    marker: z.string().optional().describe('Pagination marker from a previous response. Used with list operations'),
  }))
  .output(z.object({
    users: z.array(userSchema).optional().describe('List of IAM users'),
    user: userSchema.optional().describe('IAM user details'),
    roles: z.array(roleSchema).optional().describe('List of IAM roles'),
    role: roleSchema.optional().describe('IAM role details'),
    attachedPolicies: z.array(attachedPolicySchema).optional().describe('List of attached managed policies'),
    isTruncated: z.boolean().optional().describe('Whether there are more results available'),
    marker: z.string().optional().describe('Pagination marker for the next request'),
    created: z.boolean().optional().describe('Whether a user was created'),
    deleted: z.boolean().optional().describe('Whether a user was deleted'),
    attached: z.boolean().optional().describe('Whether a policy was attached'),
    detached: z.boolean().optional().describe('Whether a policy was detached'),
  }))
  .handleInvocation(async (ctx) => {
    let { operation, userName, roleName, policyArn, path, tags, maxItems, marker } = ctx.input;

    let paginationParams = (): Record<string, string> => {
      let params: Record<string, string> = {};
      if (maxItems !== undefined) params['MaxItems'] = String(maxItems);
      if (marker) params['Marker'] = marker;
      return params;
    };

    if (operation === 'list_users') {
      let xml = await iamQuery(ctx, 'ListUsers', paginationParams());
      let memberBlocks = extractXmlBlocks(xml, 'member');
      let users = memberBlocks
        .map(parseUser)
        .filter((u) => u.userName);
      let isTruncated = extractXmlValue(xml, 'IsTruncated') === 'true';
      let nextMarker = extractXmlValue(xml, 'Marker');

      return {
        output: {
          users,
          isTruncated,
          ...(isTruncated && nextMarker ? { marker: nextMarker } : {}),
        },
        message: `Found **${users.length}** IAM user(s)${isTruncated ? ' (more available)' : ''}.`,
      };
    }

    if (operation === 'get_user') {
      if (!userName) throw new Error('userName is required for get_user operation.');
      let xml = await iamQuery(ctx, 'GetUser', { UserName: userName });
      let userBlock = extractXmlBlocks(xml, 'User')[0];
      if (!userBlock) throw new Error(`User "${userName}" not found in response.`);
      let user = parseUser(userBlock);

      return {
        output: { user },
        message: `Retrieved details for user **${userName}** (${user.arn}).`,
      };
    }

    if (operation === 'create_user') {
      if (!userName) throw new Error('userName is required for create_user operation.');
      let params: Record<string, string> = { UserName: userName };
      if (path) params['Path'] = path;
      if (tags && tags.length > 0) {
        let tagParams = flattenParams('Tags.member', tags.map((t) => ({ Key: t.key, Value: t.value })));
        Object.assign(params, tagParams);
      }

      let xml = await iamPost(ctx, 'CreateUser', params);
      let userBlock = extractXmlBlocks(xml, 'User')[0];
      let user = userBlock ? parseUser(userBlock) : { userName, arn: extractXmlValue(xml, 'Arn') };

      return {
        output: { user, created: true },
        message: `Created IAM user **${userName}**${user.arn ? ` (${user.arn})` : ''}.`,
      };
    }

    if (operation === 'delete_user') {
      if (!userName) throw new Error('userName is required for delete_user operation.');
      await iamPost(ctx, 'DeleteUser', { UserName: userName });

      return {
        output: { deleted: true },
        message: `Deleted IAM user **${userName}**.`,
      };
    }

    if (operation === 'list_roles') {
      let xml = await iamQuery(ctx, 'ListRoles', paginationParams());
      let memberBlocks = extractXmlBlocks(xml, 'member');
      let roles = memberBlocks
        .map(parseRole)
        .filter((r) => r.roleName);
      let isTruncated = extractXmlValue(xml, 'IsTruncated') === 'true';
      let nextMarker = extractXmlValue(xml, 'Marker');

      return {
        output: {
          roles,
          isTruncated,
          ...(isTruncated && nextMarker ? { marker: nextMarker } : {}),
        },
        message: `Found **${roles.length}** IAM role(s)${isTruncated ? ' (more available)' : ''}.`,
      };
    }

    if (operation === 'get_role') {
      if (!roleName) throw new Error('roleName is required for get_role operation.');
      let xml = await iamQuery(ctx, 'GetRole', { RoleName: roleName });
      let roleBlock = extractXmlBlocks(xml, 'Role')[0];
      if (!roleBlock) throw new Error(`Role "${roleName}" not found in response.`);
      let role = parseRole(roleBlock);

      return {
        output: { role },
        message: `Retrieved details for role **${roleName}** (${role.arn}).`,
      };
    }

    if (operation === 'list_user_policies') {
      if (!userName) throw new Error('userName is required for list_user_policies operation.');
      let xml = await iamQuery(ctx, 'ListAttachedUserPolicies', {
        UserName: userName,
        ...paginationParams(),
      });
      let memberBlocks = extractXmlBlocks(xml, 'member');
      let attachedPolicies = memberBlocks.map(parseAttachedPolicy).filter((p) => p.policyArn);
      let isTruncated = extractXmlValue(xml, 'IsTruncated') === 'true';
      let nextMarker = extractXmlValue(xml, 'Marker');

      return {
        output: {
          attachedPolicies,
          isTruncated,
          ...(isTruncated && nextMarker ? { marker: nextMarker } : {}),
        },
        message: `Found **${attachedPolicies.length}** attached policy(ies) for user **${userName}**${isTruncated ? ' (more available)' : ''}.`,
      };
    }

    if (operation === 'list_role_policies') {
      if (!roleName) throw new Error('roleName is required for list_role_policies operation.');
      let xml = await iamQuery(ctx, 'ListAttachedRolePolicies', {
        RoleName: roleName,
        ...paginationParams(),
      });
      let memberBlocks = extractXmlBlocks(xml, 'member');
      let attachedPolicies = memberBlocks.map(parseAttachedPolicy).filter((p) => p.policyArn);
      let isTruncated = extractXmlValue(xml, 'IsTruncated') === 'true';
      let nextMarker = extractXmlValue(xml, 'Marker');

      return {
        output: {
          attachedPolicies,
          isTruncated,
          ...(isTruncated && nextMarker ? { marker: nextMarker } : {}),
        },
        message: `Found **${attachedPolicies.length}** attached policy(ies) for role **${roleName}**${isTruncated ? ' (more available)' : ''}.`,
      };
    }

    if (operation === 'attach_user_policy') {
      if (!userName) throw new Error('userName is required for attach_user_policy operation.');
      if (!policyArn) throw new Error('policyArn is required for attach_user_policy operation.');
      await iamPost(ctx, 'AttachUserPolicy', {
        UserName: userName,
        PolicyArn: policyArn,
      });

      return {
        output: { attached: true },
        message: `Attached policy \`${policyArn}\` to user **${userName}**.`,
      };
    }

    if (operation === 'detach_user_policy') {
      if (!userName) throw new Error('userName is required for detach_user_policy operation.');
      if (!policyArn) throw new Error('policyArn is required for detach_user_policy operation.');
      await iamPost(ctx, 'DetachUserPolicy', {
        UserName: userName,
        PolicyArn: policyArn,
      });

      return {
        output: { detached: true },
        message: `Detached policy \`${policyArn}\` from user **${userName}**.`,
      };
    }

    if (operation === 'attach_role_policy') {
      if (!roleName) throw new Error('roleName is required for attach_role_policy operation.');
      if (!policyArn) throw new Error('policyArn is required for attach_role_policy operation.');
      await iamPost(ctx, 'AttachRolePolicy', {
        RoleName: roleName,
        PolicyArn: policyArn,
      });

      return {
        output: { attached: true },
        message: `Attached policy \`${policyArn}\` to role **${roleName}**.`,
      };
    }

    if (operation === 'detach_role_policy') {
      if (!roleName) throw new Error('roleName is required for detach_role_policy operation.');
      if (!policyArn) throw new Error('policyArn is required for detach_role_policy operation.');
      await iamPost(ctx, 'DetachRolePolicy', {
        RoleName: roleName,
        PolicyArn: policyArn,
      });

      return {
        output: { detached: true },
        message: `Detached policy \`${policyArn}\` from role **${roleName}**.`,
      };
    }

    throw new Error(`Unknown operation: ${operation}`);
  }).build();
