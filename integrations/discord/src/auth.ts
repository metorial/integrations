import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let discordApi = createAxios({
  baseURL: 'https://discord.com/api/v10'
});

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      tokenType: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth2',
    key: 'oauth2',

    scopes: [
      {
        title: 'Identify',
        description: 'Access basic user info (no email)',
        scope: 'identify'
      },
      {
        title: 'Email',
        description: 'Access user email address',
        scope: 'email'
      },
      {
        title: 'Guilds',
        description: "List the user's guilds",
        scope: 'guilds'
      },
      {
        title: 'Guilds Join',
        description: 'Add users to a guild (bot must already be a member)',
        scope: 'guilds.join'
      },
      {
        title: 'Guild Members Read',
        description: "Read a user's guild member info",
        scope: 'guilds.members.read'
      },
      {
        title: 'Connections',
        description: "Access user's linked third-party accounts",
        scope: 'connections'
      },
      {
        title: 'Bot',
        description: 'Install a bot user to a guild',
        scope: 'bot'
      },
      {
        title: 'App Commands',
        description: 'Register application commands in a guild',
        scope: 'applications.commands'
      },
      {
        title: 'Incoming Webhook',
        description: 'Generate an incoming webhook via OAuth2 flow',
        scope: 'webhook.incoming'
      },
      {
        title: 'Role Connections',
        description: "Update a user's role connection metadata",
        scope: 'role_connections.write'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        state: ctx.state,
        scope: ctx.scopes.join(' ')
      });

      return {
        url: `https://discord.com/oauth2/authorize?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        grant_type: 'authorization_code',
        code: ctx.code,
        redirect_uri: ctx.redirectUri
      });

      let response = await discordApi.post('/oauth2/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      let data = response.data;

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          tokenType: 'Bearer'
        }
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let params = new URLSearchParams({
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: ctx.output.refreshToken
      });

      let response = await discordApi.post('/oauth2/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      let data = response.data;

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt,
          tokenType: 'Bearer'
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await discordApi.get('/users/@me', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let user = response.data;
      let avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : undefined;

      return {
        profile: {
          id: user.id,
          name: user.username,
          email: user.email,
          imageUrl: avatarUrl
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Bot Token',
    key: 'bot_token',

    inputSchema: z.object({
      botToken: z.string().describe('Bot token from the Discord Developer Portal')
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.botToken,
          tokenType: 'Bot'
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await discordApi.get('/users/@me', {
        headers: {
          Authorization: `Bot ${ctx.output.token}`
        }
      });

      let user = response.data;
      let avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : undefined;

      return {
        profile: {
          id: user.id,
          name: user.username,
          imageUrl: avatarUrl
        }
      };
    }
  });
