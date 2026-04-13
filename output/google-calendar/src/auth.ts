import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let googleAxios = createAxios({
  baseURL: 'https://oauth2.googleapis.com'
});

let profileAxios = createAxios({
  baseURL: 'https://www.googleapis.com'
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Full Access',
        description: 'See, edit, share, and permanently delete all accessible calendars.',
        scope: 'https://www.googleapis.com/auth/calendar'
      },
      {
        title: 'Read Only',
        description: 'Read-only access to all accessible calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
      },
      {
        title: 'Events',
        description: 'View and edit events on all calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.events'
      },
      {
        title: 'Events Read Only',
        description: 'View events on all calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly'
      },
      {
        title: 'Owned Events',
        description: 'Manage events only on calendars the user owns.',
        scope: 'https://www.googleapis.com/auth/calendar.events.owned'
      },
      {
        title: 'Owned Events Read Only',
        description: 'View events only on calendars the user owns.',
        scope: 'https://www.googleapis.com/auth/calendar.events.owned.readonly'
      },
      {
        title: 'Free/Busy (Events)',
        description: 'View availability on accessible calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.events.freebusy'
      },
      {
        title: 'Public Events Read Only',
        description: 'View events on public calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.events.public.readonly'
      },
      {
        title: 'Free/Busy',
        description: 'View free/busy availability only.',
        scope: 'https://www.googleapis.com/auth/calendar.freebusy'
      },
      {
        title: 'Settings Read Only',
        description: 'View Calendar settings.',
        scope: 'https://www.googleapis.com/auth/calendar.settings.readonly'
      },
      {
        title: 'Calendars',
        description: 'See/change calendar properties and create secondary calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.calendars'
      },
      {
        title: 'Calendars Read Only',
        description: 'View calendar properties (title, description, timezone, etc.).',
        scope: 'https://www.googleapis.com/auth/calendar.calendars.readonly'
      },
      {
        title: 'Calendar List',
        description: 'See, add, and remove subscribed calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.calendarlist'
      },
      {
        title: 'Calendar List Read Only',
        description: 'View the list of subscribed calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.calendarlist.readonly'
      },
      {
        title: 'ACLs',
        description: 'View and change sharing permissions on owned calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.acls'
      },
      {
        title: 'ACLs Read Only',
        description: 'View sharing permissions on owned calendars.',
        scope: 'https://www.googleapis.com/auth/calendar.acls.readonly'
      },
      {
        title: 'App Created',
        description: 'Manage secondary calendars and their events (app-created only).',
        scope: 'https://www.googleapis.com/auth/calendar.app.created'
      },
      {
        title: 'User Profile',
        description: 'View basic profile information.',
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      },
      {
        title: 'User Email',
        description: 'View email address.',
        scope: 'https://www.googleapis.com/auth/userinfo.email'
      }
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
      let response = await googleAxios.post('/token', new URLSearchParams({
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        grant_type: 'authorization_code'
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      let data = response.data;
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

    handleTokenRefresh: async (ctx) => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let response = await googleAxios.post('/token', new URLSearchParams({
        refresh_token: ctx.output.refreshToken,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        grant_type: 'refresh_token'
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: {}; scopes: string[] }) => {
      let response = await profileAxios.get('/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
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
