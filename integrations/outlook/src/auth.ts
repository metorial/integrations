import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let scopes = [
  {
    title: 'Read Mail',
    description: 'Read email messages in user mailboxes',
    scope: 'Mail.Read'
  },
  {
    title: 'Read/Write Mail',
    description: 'Read and write email messages in user mailboxes',
    scope: 'Mail.ReadWrite'
  },
  {
    title: 'Send Mail',
    description: 'Send email messages on behalf of the user',
    scope: 'Mail.Send'
  },
  {
    title: 'Read Basic Mail',
    description: 'Read basic email properties (sender, subject, date)',
    scope: 'Mail.ReadBasic'
  },
  {
    title: 'Read Shared Mail',
    description: 'Read email in shared mailboxes',
    scope: 'Mail.Read.Shared'
  },
  {
    title: 'Send Shared Mail',
    description: 'Send email from shared mailboxes',
    scope: 'Mail.Send.Shared'
  },
  { title: 'Read Calendars', description: 'Read calendar events', scope: 'Calendars.Read' },
  {
    title: 'Read/Write Calendars',
    description: 'Read and write calendar events',
    scope: 'Calendars.ReadWrite'
  },
  {
    title: 'Read Shared Calendars',
    description: 'Read shared calendar events',
    scope: 'Calendars.Read.Shared'
  },
  {
    title: 'Read/Write Shared Calendars',
    description: 'Read and write shared calendar events',
    scope: 'Calendars.ReadWrite.Shared'
  },
  { title: 'Read Contacts', description: 'Read user contacts', scope: 'Contacts.Read' },
  {
    title: 'Read/Write Contacts',
    description: 'Read and write user contacts',
    scope: 'Contacts.ReadWrite'
  },
  {
    title: 'Read Tasks',
    description: 'Read user tasks in Microsoft To Do',
    scope: 'Tasks.Read'
  },
  {
    title: 'Read/Write Tasks',
    description: 'Read and write user tasks in Microsoft To Do',
    scope: 'Tasks.ReadWrite'
  },
  {
    title: 'Read User Profile',
    description: 'Read basic user profile information',
    scope: 'User.Read'
  },
  {
    title: 'Offline Access',
    description: 'Maintain access with a refresh token',
    scope: 'offline_access'
  },
  { title: 'OpenID', description: 'Sign in and read user profile', scope: 'openid' },
  { title: 'Profile', description: 'Read user basic profile', scope: 'profile' },
  { title: 'Email', description: 'Read user email address', scope: 'email' }
];

function createMicrosoftOauth(name: string, key: string, tenant: string) {
  return {
    type: 'auth.oauth' as const,
    name,
    key,
    scopes,

    getAuthorizationUrl: async (ctx: any) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        response_mode: 'query'
      });

      return {
        url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: any) => {
      let tokenAxios = createAxios({
        baseURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`
      });

      let response = await tokenAxios.post(
        '/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: ctx.scopes.join(' ')
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      let data = response.data as any;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        }
      };
    },

    handleTokenRefresh: async (ctx: any) => {
      if (!ctx.output.refreshToken) {
        throw new Error(
          'No refresh token available. Ensure offline_access scope is requested.'
        );
      }

      let tokenAxios = createAxios({
        baseURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`
      });

      let response = await tokenAxios.post(
        '/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: ctx.scopes.join(' ')
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      let data = response.data as any;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: any) => {
      let graphAxios = createAxios({
        baseURL: 'https://graph.microsoft.com/v1.0'
      });

      let response = await graphAxios.get('/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data as any;

      return {
        profile: {
          id: user.id,
          email: user.mail || user.userPrincipalName,
          name: user.displayName
        }
      };
    }
  };
}

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional()
    })
  )
  .addOauth(createMicrosoftOauth('Work & Personal', 'oauth_common', 'common'))
  .addOauth(createMicrosoftOauth('Work Only', 'oauth_organizations', 'organizations'));
