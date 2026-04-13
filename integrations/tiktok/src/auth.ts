import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      openId: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'TikTok OAuth (Consumer)',
    key: 'tiktok_oauth_consumer',

    scopes: [
      {
        title: 'Basic User Info',
        description: 'Read basic profile info such as avatar, display name, and open ID.',
        scope: 'user.info.basic'
      },
      {
        title: 'User Profile',
        description:
          'Read extended profile info such as bio description, verification status, and username.',
        scope: 'user.info.profile'
      },
      {
        title: 'User Stats',
        description: 'Read follower count, following count, likes count, and video count.',
        scope: 'user.info.stats'
      },
      {
        title: 'Video List',
        description: 'Read the list of public videos posted by the user.',
        scope: 'video.list'
      },
      {
        title: 'Video Upload',
        description: 'Upload video content to TikTok on behalf of the user.',
        scope: 'video.upload'
      },
      {
        title: 'Video Publish',
        description: "Publish video content to the user's TikTok profile.",
        scope: 'video.publish'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_key: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(','),
        response_type: 'code',
        state: ctx.state
      });
      return {
        url: `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let axios = createAxios();
      let response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        new URLSearchParams({
          client_key: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          grant_type: 'authorization_code',
          redirect_uri: ctx.redirectUri
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data;

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          openId: data.open_id
        }
      };
    },

    handleTokenRefresh: async ctx => {
      let axios = createAxios();
      let response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        new URLSearchParams({
          client_key: ctx.clientId,
          client_secret: ctx.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: ctx.output.refreshToken ?? ''
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data;

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token ?? ctx.output.refreshToken,
          expiresAt,
          openId: data.open_id ?? ctx.output.openId
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string; openId?: string };
      input: {};
      scopes: string[];
    }) => {
      let axios = createAxios();
      let fields = ['open_id', 'display_name', 'avatar_url'];

      if (ctx.scopes.includes('user.info.profile')) {
        fields.push('username', 'bio_description', 'is_verified');
      }

      let response = await axios.get(
        `https://open.tiktokapis.com/v2/user/info/?fields=${fields.join(',')}`,
        {
          headers: {
            Authorization: `Bearer ${ctx.output.token}`
          }
        }
      );

      let user = response.data?.data?.user ?? {};

      return {
        profile: {
          id: user.open_id,
          name: user.display_name,
          imageUrl: user.avatar_url,
          username: user.username,
          bio: user.bio_description,
          verified: user.is_verified
        }
      };
    }
  })
  .addOauth({
    type: 'auth.oauth',
    name: 'TikTok OAuth (Business)',
    key: 'tiktok_oauth_business',

    scopes: [],

    inputSchema: z.object({
      appId: z.string().describe('TikTok Business App ID'),
      secret: z.string().describe('TikTok Business App Secret')
    }),

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        app_id: ctx.input.appId,
        redirect_uri: ctx.redirectUri,
        state: ctx.state
      });
      return {
        url: `https://business-api.tiktok.com/portal/auth?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let axios = createAxios();
      let response = await axios.post(
        'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
        {
          app_id: ctx.input.appId,
          secret: ctx.input.secret,
          auth_code: ctx.code
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      let data = response.data?.data ?? response.data;

      return {
        output: {
          token: data.access_token,
          openId: undefined
        },
        input: ctx.input
      };
    }
  });
