import { SlateTool } from 'slates';
import { AnalyticsAdminClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listAccountsAndProperties = SlateTool.create(spec, {
  name: 'List Accounts and Properties',
  key: 'list_accounts_and_properties',
  description: `List Google Analytics accounts accessible to the authenticated user and their GA4 properties. Useful for discovering available accounts and property IDs to use with other tools.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      accountId: z
        .string()
        .optional()
        .describe(
          'If provided, lists properties for this specific account (e.g., "123456"). Otherwise, lists all accessible accounts.'
        ),
      pageSize: z
        .number()
        .optional()
        .describe('Number of results per page (default: 50, max: 200).'),
      pageToken: z.string().optional().describe('Page token for pagination.')
    })
  )
  .output(
    z.object({
      accounts: z
        .array(
          z.object({
            name: z
              .string()
              .optional()
              .describe('Resource name of the account (e.g., "accounts/123456").'),
            displayName: z.string().optional(),
            regionCode: z.string().optional(),
            createTime: z.string().optional(),
            updateTime: z.string().optional()
          })
        )
        .optional()
        .describe('List of GA accounts (when no accountId is provided).'),
      properties: z
        .array(
          z.object({
            name: z
              .string()
              .optional()
              .describe('Resource name of the property (e.g., "properties/987654").'),
            displayName: z.string().optional(),
            propertyType: z.string().optional(),
            parent: z.string().optional().describe('Parent account resource name.'),
            timeZone: z.string().optional(),
            currencyCode: z.string().optional(),
            industryCategory: z.string().optional(),
            serviceLevel: z.string().optional(),
            createTime: z.string().optional(),
            updateTime: z.string().optional()
          })
        )
        .optional()
        .describe('List of GA4 properties (when accountId is provided).'),
      nextPageToken: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new AnalyticsAdminClient({
      token: ctx.auth.token,
      propertyId: ctx.config.propertyId
    });

    if (ctx.input.accountId) {
      let result = await client.listProperties({
        filter: `parent:accounts/${ctx.input.accountId}`,
        pageSize: ctx.input.pageSize,
        pageToken: ctx.input.pageToken
      });
      let properties = result.properties || [];
      return {
        output: {
          properties,
          nextPageToken: result.nextPageToken
        },
        message: `Found **${properties.length}** GA4 propert${properties.length === 1 ? 'y' : 'ies'} for account ${ctx.input.accountId}.`
      };
    }

    let result = await client.listAccounts({
      pageSize: ctx.input.pageSize,
      pageToken: ctx.input.pageToken
    });
    let accounts = result.accounts || [];
    return {
      output: {
        accounts,
        nextPageToken: result.nextPageToken
      },
      message: `Found **${accounts.length}** Google Analytics account(s).`
    };
  })
  .build();
