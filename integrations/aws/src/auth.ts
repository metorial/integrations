import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    accessKeyId: z.string().describe('AWS Access Key ID'),
    secretAccessKey: z.string().describe('AWS Secret Access Key'),
    sessionToken: z.string().optional().describe('AWS Session Token (for temporary credentials)'),
  }))
  .addCustomAuth({
    type: 'auth.custom',
    name: 'AWS Access Keys',
    key: 'aws_access_keys',

    inputSchema: z.object({
      accessKeyId: z.string().describe('AWS Access Key ID (e.g. AKIAIOSFODNN7EXAMPLE)'),
      secretAccessKey: z.string().describe('AWS Secret Access Key'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          accessKeyId: ctx.input.accessKeyId,
          secretAccessKey: ctx.input.secretAccessKey,
        },
      };
    },

    getProfile: async (ctx: any) => {
      let ax = createAxios();
      try {
        let { signRequest } = await import('./lib/signing');
        let signed = await signRequest({
          method: 'GET',
          url: 'https://sts.amazonaws.com/',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          params: { Action: 'GetCallerIdentity', Version: '2011-06-15' },
          credentials: {
            accessKeyId: ctx.output.accessKeyId,
            secretAccessKey: ctx.output.secretAccessKey,
            sessionToken: ctx.output.sessionToken,
          },
          region: 'us-east-1',
          service: 'sts',
        });

        let response = await ax.get('https://sts.amazonaws.com/', {
          headers: signed.headers,
          params: signed.params,
        });

        let body = response.data as string;
        let arnMatch = body.match(/<Arn>(.*?)<\/Arn>/);
        let accountMatch = body.match(/<Account>(.*?)<\/Account>/);
        let userIdMatch = body.match(/<UserId>(.*?)<\/UserId>/);

        return {
          profile: {
            id: userIdMatch?.[1] ?? ctx.output.accessKeyId,
            name: arnMatch?.[1] ?? ctx.output.accessKeyId,
            accountId: accountMatch?.[1],
          },
        };
      } catch {
        return {
          profile: {
            id: ctx.output.accessKeyId,
            name: ctx.output.accessKeyId,
          },
        };
      }
    },
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'AWS Temporary Credentials (STS)',
    key: 'aws_temporary_credentials',

    inputSchema: z.object({
      accessKeyId: z.string().describe('Temporary AWS Access Key ID'),
      secretAccessKey: z.string().describe('Temporary AWS Secret Access Key'),
      sessionToken: z.string().describe('AWS Session Token'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          accessKeyId: ctx.input.accessKeyId,
          secretAccessKey: ctx.input.secretAccessKey,
          sessionToken: ctx.input.sessionToken,
        },
      };
    },

    getProfile: async (ctx: any) => {
      let ax = createAxios();
      try {
        let { signRequest } = await import('./lib/signing');
        let signed = await signRequest({
          method: 'GET',
          url: 'https://sts.amazonaws.com/',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          params: { Action: 'GetCallerIdentity', Version: '2011-06-15' },
          credentials: {
            accessKeyId: ctx.output.accessKeyId,
            secretAccessKey: ctx.output.secretAccessKey,
            sessionToken: ctx.output.sessionToken,
          },
          region: 'us-east-1',
          service: 'sts',
        });

        let response = await ax.get('https://sts.amazonaws.com/', {
          headers: signed.headers,
          params: signed.params,
        });

        let body = response.data as string;
        let arnMatch = body.match(/<Arn>(.*?)<\/Arn>/);
        let accountMatch = body.match(/<Account>(.*?)<\/Account>/);
        let userIdMatch = body.match(/<UserId>(.*?)<\/UserId>/);

        return {
          profile: {
            id: userIdMatch?.[1] ?? ctx.output.accessKeyId,
            name: arnMatch?.[1] ?? ctx.output.accessKeyId,
            accountId: accountMatch?.[1],
          },
        };
      } catch {
        return {
          profile: {
            id: ctx.output.accessKeyId,
            name: ctx.output.accessKeyId,
          },
        };
      }
    },
  });
