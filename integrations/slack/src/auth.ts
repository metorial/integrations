import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      teamId: z.string().optional(),
      teamName: z.string().optional(),
      botUserId: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Slack OAuth (Bot)',
    key: 'oauth',

    scopes: [
      // Messaging
      { title: 'Send Messages', description: 'Send messages as the app', scope: 'chat:write' },
      {
        title: 'Send Public Messages',
        description: 'Send messages to channels the app is not a member of',
        scope: 'chat:write.public'
      },

      // Channels
      {
        title: 'Read Channels',
        description: 'View basic information about public channels',
        scope: 'channels:read'
      },
      {
        title: 'Manage Channels',
        description: 'Manage public channels and create new ones',
        scope: 'channels:manage'
      },
      {
        title: 'Channel History',
        description: 'View messages and content in public channels',
        scope: 'channels:history'
      },
      {
        title: 'Join Channels',
        description: 'Join public channels in a workspace',
        scope: 'channels:join'
      },

      // Private Channels (Groups)
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

      // Direct Messages
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

      // Group DMs
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

      // Users
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

      // Files
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

      // Reactions
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

      // Pins
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

      // Bookmarks
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

      // User Groups
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

      // Team/Workspace
      {
        title: 'Read Team Info',
        description: 'View the name, email domain, and icon for workspaces',
        scope: 'team:read'
      },

      // Commands
      {
        title: 'Commands',
        description: 'Add shortcuts and slash commands that people can use',
        scope: 'commands'
      },

      // Incoming Webhooks
      {
        title: 'Incoming Webhooks',
        description: 'Post messages to specific channels',
        scope: 'incoming-webhook'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        scope: ctx.scopes.join(','),
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
        access_token?: string;
        team?: { id?: string; name?: string };
        bot_user_id?: string;
        error?: string;
      };

      if (!data.ok || !data.access_token) {
        throw new Error(`Slack OAuth error: ${data.error || 'Unknown error'}`);
      }

      return {
        output: {
          token: data.access_token,
          teamId: data.team?.id,
          teamName: data.team?.name,
          botUserId: data.bot_user_id
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

      // Try to fetch the team icon as the profile image
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
    name: 'Bot Token',
    key: 'bot_token',

    inputSchema: z.object({
      token: z.string().describe('Slack Bot Token (starts with xoxb-)')
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
