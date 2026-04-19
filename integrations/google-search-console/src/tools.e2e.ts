import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { z } from 'zod';
import { provider } from './index';

type GoogleSearchConsoleFixtures = {
  siteUrl?: string;
  sitemapUrl?: string;
};

let dateOffset = (daysFromToday: number) => {
  let date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
};

export let googleSearchConsoleToolE2E =
  defineSlateToolE2EIntegration<GoogleSearchConsoleFixtures>({
    fixturesSchema: z.object({
      siteUrl: z
        .string()
        .url()
        .optional()
        .describe(
          'Exact URL-prefix Search Console property to test. Use a live page URL such as the site homepage.'
        ),
      sitemapUrl: z
        .string()
        .url()
        .optional()
        .describe('Existing sitemap URL that belongs to the fixture siteUrl property')
    }),
    resources: {
      site: {
        fromFixture: ctx => ({
          siteUrl: ctx.fixtures.siteUrl
        })
      },
      sitemap: {
        use: ['site'],
        fromFixture: ctx => ({
          siteUrl: ctx.fixtures.siteUrl,
          sitemapUrl: ctx.fixtures.sitemapUrl
        })
      }
    },
    scenarioOverrides: {
      query_search_analytics: {
        name: 'query_search_analytics queries recent data for the fixture site',
        use: ['site'],
        run: async ctx => {
          let siteUrl = ctx.fixtures.siteUrl;
          if (typeof siteUrl !== 'string' || siteUrl.length === 0) {
            console.log(
              '[google-search-console e2e] Skipping query_search_analytics: ' +
                'requires SLATES_E2E_FIXTURES with siteUrl for a real verified property.'
            );
            return;
          }

          await ctx.invokeTool('query_search_analytics', {
            siteUrl: String(ctx.resource('site').siteUrl),
            startDate: dateOffset(-28),
            endDate: dateOffset(-3),
            dimensions: ['page'],
            searchType: 'web',
            rowLimit: 10,
            dataState: 'final'
          });
        }
      },
      list_sites: {
        name: 'list_sites includes the fixture site',
        use: ['site'],
        run: async ctx => {
          let siteUrl = ctx.fixtures.siteUrl;
          if (typeof siteUrl !== 'string' || siteUrl.length === 0) {
            console.log(
              '[google-search-console e2e] Skipping list_sites: ' +
                'requires SLATES_E2E_FIXTURES with siteUrl for a real verified property.'
            );
            return;
          }

          let result = await ctx.invokeTool('list_sites', {});

          if (
            !result.output.sites.some(
              (candidate: { siteUrl?: string }) =>
                candidate.siteUrl === String(ctx.resource('site').siteUrl)
            )
          ) {
            throw new Error(`list_sites did not include the fixture site ${siteUrl}.`);
          }
        }
      },
      manage_site: {
        name: 'manage_site retrieves the fixture site',
        use: ['site'],
        run: async ctx => {
          let siteUrl = ctx.fixtures.siteUrl;
          if (typeof siteUrl !== 'string' || siteUrl.length === 0) {
            console.log(
              '[google-search-console e2e] Skipping manage_site: ' +
                'requires SLATES_E2E_FIXTURES with siteUrl for a real verified property.'
            );
            return;
          }

          let result = await ctx.invokeTool('manage_site', {
            action: 'get',
            siteUrl: String(ctx.resource('site').siteUrl)
          });

          if (result.output.siteUrl !== String(ctx.resource('site').siteUrl)) {
            throw new Error(`manage_site get did not return the fixture site ${siteUrl}.`);
          }
        }
      },
      manage_sitemap: {
        name: 'manage_sitemap lists and retrieves the fixture sitemap',
        use: ['sitemap'],
        run: async ctx => {
          let siteUrl = ctx.fixtures.siteUrl;
          let sitemapUrl = ctx.fixtures.sitemapUrl;
          if (
            typeof siteUrl !== 'string' ||
            siteUrl.length === 0 ||
            typeof sitemapUrl !== 'string' ||
            sitemapUrl.length === 0
          ) {
            console.log(
              '[google-search-console e2e] Skipping manage_sitemap: ' +
                'requires SLATES_E2E_FIXTURES with siteUrl and sitemapUrl for a real property.'
            );
            return;
          }

          let sitemap = ctx.resource('sitemap');
          siteUrl = String(sitemap.siteUrl);
          sitemapUrl = String(sitemap.sitemapUrl);

          let list = await ctx.invokeTool('manage_sitemap', {
            action: 'list',
            siteUrl
          });

          if (
            !list.output.sitemaps?.some(
              (candidate: { path?: string }) => candidate.path === sitemapUrl
            )
          ) {
            throw new Error(
              `manage_sitemap list did not include the fixture sitemap ${sitemapUrl}.`
            );
          }

          let get = await ctx.invokeTool('manage_sitemap', {
            action: 'get',
            siteUrl,
            sitemapUrl
          });

          if (get.output.sitemaps?.[0]?.path !== sitemapUrl) {
            throw new Error(
              `manage_sitemap get did not return the fixture sitemap ${sitemapUrl}.`
            );
          }
        }
      },
      inspect_url: {
        name: 'inspect_url inspects the fixture site URL',
        use: ['site'],
        run: async ctx => {
          let siteUrl = ctx.fixtures.siteUrl;
          if (typeof siteUrl !== 'string' || siteUrl.length === 0) {
            console.log(
              '[google-search-console e2e] Skipping inspect_url: ' +
                'requires SLATES_E2E_FIXTURES with siteUrl for a real verified property.'
            );
            return;
          }

          await ctx.invokeTool('inspect_url', {
            inspectionUrl: String(ctx.resource('site').siteUrl),
            siteUrl: String(ctx.resource('site').siteUrl),
            languageCode: 'en-US'
          });
        }
      },
      run_mobile_friendly_test: {
        name: 'run_mobile_friendly_test tests the fixture site URL',
        use: ['site'],
        run: async ctx => {
          let siteUrl = ctx.fixtures.siteUrl;
          if (typeof siteUrl !== 'string' || siteUrl.length === 0) {
            console.log(
              '[google-search-console e2e] Skipping run_mobile_friendly_test: ' +
                'requires SLATES_E2E_FIXTURES with siteUrl for a real site URL.'
            );
            return;
          }

          await ctx.invokeTool('run_mobile_friendly_test', {
            url: String(ctx.resource('site').siteUrl)
          });
        }
      }
    }
  });

runSlateToolE2ESuite({
  provider,
  integration: googleSearchConsoleToolE2E
});
