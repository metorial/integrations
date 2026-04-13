import { SlateAuth, axios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Google OAuth 2.0',
    key: 'google_oauth',

    scopes: [
      // User scopes
      { title: 'Users (Read/Write)', description: 'Full access to manage users', scope: 'https://www.googleapis.com/auth/admin.directory.user' },
      { title: 'Users (Read Only)', description: 'View user information', scope: 'https://www.googleapis.com/auth/admin.directory.user.readonly' },
      { title: 'User Aliases (Read/Write)', description: 'Manage user email aliases', scope: 'https://www.googleapis.com/auth/admin.directory.user.alias' },
      { title: 'User Aliases (Read Only)', description: 'View user email aliases', scope: 'https://www.googleapis.com/auth/admin.directory.user.alias.readonly' },
      { title: 'User Security', description: 'Manage user security settings, tokens, and verification codes', scope: 'https://www.googleapis.com/auth/admin.directory.user.security' },

      // Group scopes
      { title: 'Groups (Read/Write)', description: 'Full access to manage groups', scope: 'https://www.googleapis.com/auth/admin.directory.group' },
      { title: 'Groups (Read Only)', description: 'View group information', scope: 'https://www.googleapis.com/auth/admin.directory.group.readonly' },
      { title: 'Group Members (Read/Write)', description: 'Manage group membership', scope: 'https://www.googleapis.com/auth/admin.directory.group.member' },
      { title: 'Group Members (Read Only)', description: 'View group membership', scope: 'https://www.googleapis.com/auth/admin.directory.group.member.readonly' },
      { title: 'Groups Settings', description: 'Manage group settings and policies', scope: 'https://www.googleapis.com/auth/apps.groups.settings' },

      // Org unit scopes
      { title: 'Org Units (Read/Write)', description: 'Manage organizational units', scope: 'https://www.googleapis.com/auth/admin.directory.orgunit' },
      { title: 'Org Units (Read Only)', description: 'View organizational units', scope: 'https://www.googleapis.com/auth/admin.directory.orgunit.readonly' },

      // Role scopes
      { title: 'Roles (Read/Write)', description: 'Manage admin roles and assignments', scope: 'https://www.googleapis.com/auth/admin.directory.rolemanagement' },
      { title: 'Roles (Read Only)', description: 'View admin roles and assignments', scope: 'https://www.googleapis.com/auth/admin.directory.rolemanagement.readonly' },

      // Device scopes
      { title: 'ChromeOS Devices (Read/Write)', description: 'Manage ChromeOS devices', scope: 'https://www.googleapis.com/auth/admin.directory.device.chromeos' },
      { title: 'ChromeOS Devices (Read Only)', description: 'View ChromeOS devices', scope: 'https://www.googleapis.com/auth/admin.directory.device.chromeos.readonly' },
      { title: 'Mobile Devices (Read/Write)', description: 'Manage mobile devices', scope: 'https://www.googleapis.com/auth/admin.directory.device.mobile' },
      { title: 'Mobile Devices (Read Only)', description: 'View mobile devices', scope: 'https://www.googleapis.com/auth/admin.directory.device.mobile.readonly' },

      // Domain scopes
      { title: 'Domains (Read/Write)', description: 'Manage domains and domain aliases', scope: 'https://www.googleapis.com/auth/admin.directory.domain' },
      { title: 'Domains (Read Only)', description: 'View domains and domain aliases', scope: 'https://www.googleapis.com/auth/admin.directory.domain.readonly' },

      // Customer scopes
      { title: 'Customers (Read/Write)', description: 'Manage customer account information', scope: 'https://www.googleapis.com/auth/admin.directory.customer' },
      { title: 'Customers (Read Only)', description: 'View customer account information', scope: 'https://www.googleapis.com/auth/admin.directory.customer.readonly' },

      // Calendar resource scopes
      { title: 'Calendar Resources (Read/Write)', description: 'Manage calendar resources such as rooms and equipment', scope: 'https://www.googleapis.com/auth/admin.directory.resource.calendar' },
      { title: 'Calendar Resources (Read Only)', description: 'View calendar resources', scope: 'https://www.googleapis.com/auth/admin.directory.resource.calendar.readonly' },

      // Custom schema scopes
      { title: 'User Schemas (Read/Write)', description: 'Manage custom user schemas', scope: 'https://www.googleapis.com/auth/admin.directory.userschema' },
      { title: 'User Schemas (Read Only)', description: 'View custom user schemas', scope: 'https://www.googleapis.com/auth/admin.directory.userschema.readonly' },

      // Reports scopes
      { title: 'Audit Reports (Read Only)', description: 'View admin audit logs and activity reports', scope: 'https://www.googleapis.com/auth/admin.reports.audit.readonly' },
      { title: 'Usage Reports (Read Only)', description: 'View usage reports for apps and entities', scope: 'https://www.googleapis.com/auth/admin.reports.usage.readonly' },

      // Alert Center
      { title: 'Alert Center', description: 'Manage security alerts and alert feedback', scope: 'https://www.googleapis.com/auth/apps.alerts' },

      // Licensing
      { title: 'Licensing', description: 'Manage Google Workspace product licenses', scope: 'https://www.googleapis.com/auth/apps.licensing' },

      // Profile scope for getProfile
      { title: 'User Profile', description: 'View basic profile info of the authenticated user', scope: 'https://www.googleapis.com/auth/userinfo.email' },
      { title: 'User Profile Name', description: 'View the name of the authenticated user', scope: 'https://www.googleapis.com/auth/userinfo.profile' },
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        access_type: 'offline',
        prompt: 'consent'
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      };
    },

    handleCallback: async (ctx) => {
      let response = await axios.post('https://oauth2.googleapis.com/token', {
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        grant_type: 'authorization_code'
      });

      let data = response.data;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : undefined
        }
      };
    },

    handleTokenRefresh: async (ctx) => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: ctx.output.refreshToken,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        grant_type: 'refresh_token'
      });

      let data = response.data;

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : undefined
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let data = response.data;

      return {
        profile: {
          id: data.id,
          email: data.email,
          name: data.name,
          imageUrl: data.picture
        }
      };
    }
  });
