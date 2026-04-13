import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      teamId: z.string().optional(),
      teamName: z.string().optional(),
      userId: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Slack OAuth (User)',
    key: 'oauth',

    // User tokens only accept scopes marked for [`User`] on docs.slack.dev — not bot-only scopes
    // like chat:write.public, channels:manage, or channels:join (use channels:write for join/create).
    scopes: [
      {
        title: 'Send Messages',
        description: 'Send messages as the authorized user',
        scope: 'chat:write'
      },

      {
        title: 'Read Channels',
        description: 'View basic information about public channels',
        scope: 'channels:read'
      },
      {
        title: 'Manage Public Channels',
        description: 'Create, join, rename, archive public channels on the user’s behalf',
        scope: 'channels:write'
      },
      {
        title: 'Channel History',
        description: 'View messages and content in public channels',
        scope: 'channels:history'
      },

      {
        title: 'Read Private Channels',
        description: 'View basic information about private channels',
        scope: 'groups:read'
      },
      {
        title: 'Private Channel History',
        description: 'View messages and content in private channels',
        scope: 'groups:history'
      },
      {
        title: 'Write Private Channels',
        description: 'Manage private channels and create new ones',
        scope: 'groups:write'
      },

      {
        title: 'Read DMs',
        description: 'View basic information about direct messages',
        scope: 'im:read'
      },
      {
        title: 'DM History',
        description: 'View messages and content in direct messages',
        scope: 'im:history'
      },
      {
        title: 'Write DMs',
        description: 'Start direct messages with people',
        scope: 'im:write'
      },

      {
        title: 'Read Group DMs',
        description: 'View basic information about group direct messages',
        scope: 'mpim:read'
      },
      {
        title: 'Group DM History',
        description: 'View messages and content in group direct messages',
        scope: 'mpim:history'
      },
      {
        title: 'Write Group DMs',
        description: 'Start group direct messages with people',
        scope: 'mpim:write'
      },

      { title: 'Read Users', description: 'View people in a workspace', scope: 'users:read' },
      {
        title: 'Read User Emails',
        description: 'View email addresses of people in a workspace',
        scope: 'users:read.email'
      },
      {
        title: 'Read User Profile',
        description: 'View profile details about people in a workspace',
        scope: 'users.profile:read'
      },

      {
        title: 'Read Files',
        description: 'View files shared in channels and conversations',
        scope: 'files:read'
      },
      {
        title: 'Write Files',
        description: 'Upload, edit, and delete files',
        scope: 'files:write'
      },

      {
        title: 'Read Reactions',
        description: 'View emoji reactions and their associated content',
        scope: 'reactions:read'
      },
      {
        title: 'Write Reactions',
        description: 'Add and edit emoji reactions',
        scope: 'reactions:write'
      },

      {
        title: 'Read Pins',
        description: 'View pinned content in channels',
        scope: 'pins:read'
      },
      {
        title: 'Write Pins',
        description: 'Add and remove pinned messages in channels',
        scope: 'pins:write'
      },

      {
        title: 'Read Bookmarks',
        description: 'List bookmarks in channels',
        scope: 'bookmarks:read'
      },
      {
        title: 'Write Bookmarks',
        description: 'Add, edit, and remove bookmarks in channels',
        scope: 'bookmarks:write'
      },

      {
        title: 'Read User Groups',
        description: 'View user groups in a workspace',
        scope: 'usergroups:read'
      },
      {
        title: 'Write User Groups',
        description: 'Create and manage user groups',
        scope: 'usergroups:write'
      },

      { title: 'Read Reminders', description: 'View reminders', scope: 'reminders:read' },
      {
        title: 'Write Reminders',
        description: 'Add, remove, and mark reminders as complete',
        scope: 'reminders:write'
      },

      {
        title: 'Read Team Info',
        description: 'View the name, email domain, and icon for workspaces',
        scope: 'team:read'
      },

      {
        title: 'Search Workspace',
        description: 'Search messages and files (`search.messages` / `search.files`); add under User Token Scopes in the Slack app',
        scope: 'search:read'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        user_scope: ctx.scopes.join(','),
        redirect_uri: ctx.redirectUri,
        state: ctx.state
      });

      return {
        url: `https://slack.com/oauth/v2/authorize?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let client = createAxios({ baseURL: 'https://slack.com/api' });

      let response = await client.post('/oauth.v2.access', null, {
        params: {
          code: ctx.code,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri
        }
      });

      let data = response.data as {
        ok: boolean;
        authed_user?: {
          id?: string;
          access_token?: string;
          scope?: string;
        };
        team?: { id?: string; name?: string };
        error?: string;
      };

      let token = data.authed_user?.access_token;
      if (!data.ok || !token) {
        throw new Error(`Slack OAuth error: ${data.error || 'missing user access token'}`);
      }

      return {
        output: {
          token,
          teamId: data.team?.id,
          teamName: data.team?.name,
          userId: data.authed_user?.id
        }
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: {}; scopes: string[] }) => {
      let client = createAxios({ baseURL: 'https://slack.com/api' });

      let response = await client.get('/auth.test', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let data = response.data as {
        ok: boolean;
        user_id?: string;
        user?: string;
        team_id?: string;
        team?: string;
        url?: string;
      };

      let profile: Record<string, any> = {
        id: data.user_id,
        name: data.user,
        teamId: data.team_id,
        teamName: data.team
      };

      try {
        let teamResponse = await client.get('/team.info', {
          headers: { Authorization: `Bearer ${ctx.output.token}` }
        });

        let teamData = teamResponse.data as {
          ok: boolean;
          team?: { icon?: { image_132?: string } };
        };

        if (teamData.ok && teamData.team?.icon?.image_132) {
          profile.imageUrl = teamData.team.icon.image_132;
        }
      } catch {
        // Ignore if team.info fails
      }

      return { profile };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'User Token',
    key: 'user_token',

    inputSchema: z.object({
      token: z.string().describe('Slack user token (starts with xoxp-)')
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { token: string } }) => {
      let client = createAxios({ baseURL: 'https://slack.com/api' });

      let response = await client.get('/auth.test', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let data = response.data as {
        ok: boolean;
        user_id?: string;
        user?: string;
        team_id?: string;
        team?: string;
      };

      return {
        profile: {
          id: data.user_id,
          name: data.user,
          teamId: data.team_id,
          teamName: data.team
        }
      };
    }
  });
