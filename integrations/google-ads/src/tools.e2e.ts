import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { type AuthOutput, type ConfigOutput, createClient } from './lib/helpers';
import { provider } from './index';

type GoogleAdsAccount = {
  customerId: string;
  resourceName: string;
  name?: string;
  status?: string;
};

type GoogleAdsHelpers = {
  client: ReturnType<typeof createClient>;
  customer: GoogleAdsAccount;
};

let normalizeCustomerId = (value: string) => value.replace(/-/g, '');

let requireString = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} did not return a non-empty string.`);
  }

  return value;
};

let lastResourceSegment = (resourceName: string, label: string) => {
  let segment = resourceName.split('/').at(-1);
  if (!segment) {
    throw new Error(`${label} did not include a trailing resource ID.`);
  }

  return segment;
};

let criterionIdFromResourceName = (resourceName: string, label: string) => {
  let criterionId = resourceName.split('~').at(-1);
  if (!criterionId) {
    throw new Error(`${label} did not include a criterion ID.`);
  }

  return criterionId;
};

let compactToken = (value: string, length = 10) => {
  let token = value.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return token.slice(-length) || 'e2e';
};

let createFinalUrl = (runId: string, label: string) =>
  `https://example.com/${label}/${compactToken(runId, 16)}`;

let createResponsiveSearchAd = (runId: string) => {
  let token = compactToken(runId, 8);

  return {
    headlines: [
      { text: `Slate ${token} one`.slice(0, 30) },
      { text: `Slate ${token} two`.slice(0, 30) },
      { text: `Slate ${token} three`.slice(0, 30) }
    ],
    descriptions: [
      { text: `Automated search ad ${token} description one.`.slice(0, 90) },
      { text: `Automated search ad ${token} description two.`.slice(0, 90) }
    ],
    path1: 'slates',
    path2: token
  };
};

let createOfflineConversionDateTime = () => {
  let value = new Date(Date.now() - 15 * 60 * 1000);
  let pad = (part: number) => String(part).padStart(2, '0');

  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(
    value.getUTCDate()
  )} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(
    value.getUTCSeconds()
  )}+00:00`;
};

let createSyntheticGclid = (runId: string) =>
  `EAIaIQobChMI${compactToken(runId, 24).padEnd(24, 'a')}`;

let selectWritableCustomer = (accounts: Array<Record<string, any>>): GoogleAdsAccount => {
  let candidates = accounts.filter(
    candidate =>
      typeof candidate.customerId === 'string' &&
      candidate.customerId.length > 0
  );
  let knownNonManagers = candidates.filter(candidate => candidate.isManager === false);
  let unknownManagerState = candidates.filter(candidate => candidate.isManager === undefined);
  let preferredPool =
    knownNonManagers.length > 0 ? knownNonManagers : unknownManagerState;

  let account =
    preferredPool.find(candidate => candidate.status === 'ENABLED') ?? preferredPool[0];

  if (!account) {
    throw new Error(
      'list_accounts did not return a writable non-manager customer account.'
    );
  }

  return {
    customerId: String(account.customerId),
    resourceName: requireString(account.resourceName, 'Accessible account resourceName'),
    name: typeof account.name === 'string' ? account.name : undefined,
    status: typeof account.status === 'string' ? account.status : undefined
  };
};

export let googleAdsToolE2E = defineSlateToolE2EIntegration<
  Record<string, never>,
  GoogleAdsHelpers
>({
  createHelpers: async ctx => {
    let accounts = await ctx.invokeTool('list_accounts', {
      includeDetails: true
    });

    return {
      client: createClient(
        ctx.auth as AuthOutput,
        (ctx.profile.config ?? {}) as ConfigOutput
      ),
      customer: selectWritableCustomer(accounts.output.accounts)
    };
  },
  resources: {
    customer: {
      fromFixture: ctx => ctx.helpers.customer
    },
    campaign_budget: {
      use: ['customer'],
      create: async ctx => {
        let customer = ctx.resource('customer');
        let result = await ctx.helpers.client.mutateCampaignBudgets(
          String(customer.customerId),
          [
            {
              create: {
                name: ctx.namespaced('budget'),
                amountMicros: '5000000',
                deliveryMethod: 'STANDARD',
                explicitlyShared: true
              }
            }
          ]
        );
        let budgetResourceName = requireString(
          result.results?.[0]?.resourceName,
          'Campaign budget resource name'
        );

        return {
          customerId: String(customer.customerId),
          budgetResourceName
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.budgetResourceName !== 'string'
          ) {
            return;
          }

          await ctx.helpers.client.mutateCampaignBudgets(String(value.customerId), [
            {
              remove: String(value.budgetResourceName)
            }
          ]);
        }
      }
    },
    campaign: {
      use: ['customer', 'campaign_budget'],
      create: async ctx => {
        let customer = ctx.resource('customer');
        let budget = ctx.resource('campaign_budget');
        let input = {
          customerId: String(customer.customerId),
          operation: 'create' as const,
          name: ctx.namespaced('campaign'),
          advertisingChannelType: 'SEARCH' as const,
          status: 'PAUSED' as const,
          biddingStrategyType: 'MANUAL_CPC',
          existingBudgetResourceName: String(budget.budgetResourceName)
        };
        let result = await ctx.invokeTool('manage_campaigns', input);
        let campaignResourceName = requireString(
          result.output.campaignResourceName,
          'Campaign resource name'
        );

        return {
          customerId: input.customerId,
          campaignId: lastResourceSegment(campaignResourceName, 'Campaign resource name'),
          campaignResourceName,
          budgetResourceName: input.existingBudgetResourceName,
          name: input.name,
          status: input.status
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.campaignId !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_campaigns', {
            customerId: String(value.customerId),
            operation: 'remove',
            campaignId: String(value.campaignId)
          });
        }
      }
    },
    ad_group: {
      use: ['campaign'],
      create: async ctx => {
        let campaign = ctx.resource('campaign');
        let input = {
          customerId: String(campaign.customerId),
          operation: 'create' as const,
          campaignId: String(campaign.campaignId),
          name: ctx.namespaced('ad group'),
          status: 'PAUSED' as const,
          type: 'SEARCH_STANDARD' as const,
          cpcBidMicros: '1000000'
        };
        let result = await ctx.invokeTool('manage_ad_groups', input);
        let adGroupResourceName = requireString(
          result.output.adGroupResourceName,
          'Ad group resource name'
        );

        return {
          customerId: input.customerId,
          campaignId: input.campaignId,
          adGroupId: lastResourceSegment(adGroupResourceName, 'Ad group resource name'),
          adGroupResourceName,
          name: input.name,
          status: input.status
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.adGroupId !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_ad_groups', {
            customerId: String(value.customerId),
            operation: 'remove',
            adGroupId: String(value.adGroupId)
          });
        }
      }
    },
    ad: {
      use: ['ad_group'],
      create: async ctx => {
        let adGroup = ctx.resource('ad_group');
        let input = {
          customerId: String(adGroup.customerId),
          operation: 'create' as const,
          adGroupId: String(adGroup.adGroupId),
          status: 'PAUSED' as const,
          adType: 'RESPONSIVE_SEARCH_AD' as const,
          responsiveSearchAd: createResponsiveSearchAd(ctx.runId),
          finalUrls: [createFinalUrl(ctx.runId, 'ads')]
        };
        let result = await ctx.invokeTool('manage_ads', input);
        let adGroupAdResourceName = requireString(
          result.output.adGroupAdResourceName,
          'Ad resource name'
        );

        return {
          customerId: input.customerId,
          adGroupId: input.adGroupId,
          adGroupAdResourceName,
          status: input.status
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.adGroupAdResourceName !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_ads', {
            customerId: String(value.customerId),
            operation: 'remove',
            adGroupAdResourceName: String(value.adGroupAdResourceName)
          });
        }
      }
    },
    keyword: {
      use: ['ad_group'],
      create: async ctx => {
        let adGroup = ctx.resource('ad_group');
        let input = {
          customerId: String(adGroup.customerId),
          operation: 'create' as const,
          adGroupId: String(adGroup.adGroupId),
          keyword: `slates ${compactToken(ctx.runId, 10)}`,
          matchType: 'PHRASE' as const,
          status: 'PAUSED' as const
        };
        let result = await ctx.invokeTool('manage_keywords', input);
        let criterionResourceName = requireString(
          result.output.criterionResourceName,
          'Keyword criterion resource name'
        );

        return {
          customerId: input.customerId,
          adGroupId: input.adGroupId,
          criterionId: criterionIdFromResourceName(
            criterionResourceName,
            'Keyword criterion resource name'
          ),
          criterionResourceName,
          keyword: input.keyword,
          status: input.status
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.adGroupId !== 'string' ||
            typeof value.criterionId !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_keywords', {
            customerId: String(value.customerId),
            operation: 'remove',
            adGroupId: String(value.adGroupId),
            criterionId: String(value.criterionId)
          });
        }
      }
    },
    bidding_strategy: {
      use: ['customer'],
      create: async ctx => {
        let customer = ctx.resource('customer');
        let input = {
          customerId: String(customer.customerId),
          operation: 'create' as const,
          name: ctx.namespaced('bidding strategy'),
          targetSpend: {
            cpcBidCeilingMicros: '1500000'
          }
        };
        let result = await ctx.invokeTool('manage_bidding_strategies', input);
        let biddingStrategyResourceName = requireString(
          result.output.biddingStrategyResourceName,
          'Bidding strategy resource name'
        );

        return {
          customerId: input.customerId,
          biddingStrategyId: lastResourceSegment(
            biddingStrategyResourceName,
            'Bidding strategy resource name'
          ),
          biddingStrategyResourceName,
          name: input.name
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.biddingStrategyId !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_bidding_strategies', {
            customerId: String(value.customerId),
            operation: 'remove',
            biddingStrategyId: String(value.biddingStrategyId)
          });
        }
      }
    },
    conversion_action: {
      use: ['customer'],
      create: async ctx => {
        let customer = ctx.resource('customer');
        let input = {
          customerId: String(customer.customerId),
          operation: 'create' as const,
          name: ctx.namespaced('conversion action'),
          type: 'UPLOAD' as const,
          category: 'LEAD',
          countingType: 'ONE_PER_CLICK' as const,
          defaultValue: 1,
          alwaysUseDefaultValue: true,
          includeInConversionsMetric: false
        };
        let result = await ctx.invokeTool('manage_conversion_actions', input);
        let conversionActionResourceName = requireString(
          result.output.conversionActionResourceName,
          'Conversion action resource name'
        );

        return {
          customerId: input.customerId,
          conversionActionId: lastResourceSegment(
            conversionActionResourceName,
            'Conversion action resource name'
          ),
          conversionActionResourceName,
          name: input.name
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.conversionActionId !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_conversion_actions', {
            customerId: String(value.customerId),
            operation: 'remove',
            conversionActionId: String(value.conversionActionId)
          });
        }
      }
    },
    audience_list: {
      use: ['customer'],
      create: async ctx => {
        let customer = ctx.resource('customer');
        let input = {
          customerId: String(customer.customerId),
          operation: 'create' as const,
          name: ctx.namespaced('audience list'),
          description: `Created by ${ctx.runId}`,
          membershipLifeSpan: 30,
          membershipStatus: 'OPEN' as const,
          listType: 'CRM_BASED' as const,
          crmBasedUserList: {
            uploadKeyType: 'CONTACT_INFO' as const,
            dataSourceType: 'FIRST_PARTY' as const
          }
        };
        let result = await ctx.invokeTool('manage_audience_lists', input);
        let userListResourceName = requireString(
          result.output.userListResourceName,
          'Audience list resource name'
        );

        return {
          customerId: input.customerId,
          userListId: lastResourceSegment(
            userListResourceName,
            'Audience list resource name'
          ),
          userListResourceName,
          name: input.name,
          description: input.description
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (
            typeof value.customerId !== 'string' ||
            typeof value.userListId !== 'string'
          ) {
            return;
          }

          await ctx.invokeTool('manage_audience_lists', {
            customerId: String(value.customerId),
            operation: 'remove',
            userListId: String(value.userListId)
          });
        }
      }
    }
  },
  scenarioOverrides: {
    list_accounts: {
      name: 'list_accounts returns the selected writable customer',
      use: ['customer'],
      run: async ctx => {
        let customer = ctx.resource('customer');
        let result = await ctx.invokeTool('list_accounts', {
          includeDetails: true
        });
        let expectedCustomerId = normalizeCustomerId(String(customer.customerId));

        if (
          !result.output.accounts.some(
            (candidate: { customerId?: string }) =>
              typeof candidate.customerId === 'string' &&
              normalizeCustomerId(candidate.customerId) === expectedCustomerId
          )
        ) {
          throw new Error(
            `list_accounts did not include customer ${String(customer.customerId)}.`
          );
        }
      }
    },
    search_reports: {
      name: 'search_reports reads basic customer fields through GAQL',
      use: ['customer'],
      run: async ctx => {
        let customer = ctx.resource('customer');
        let result = await ctx.invokeTool('search_reports', {
          customerId: String(customer.customerId),
          query:
            'SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1',
          pageSize: 1
        });
        let expectedCustomerId = normalizeCustomerId(String(customer.customerId));

        if (
          !result.output.results.some(
            (row: { customer?: { id?: string | number } }) =>
              String(row.customer?.id ?? '') === expectedCustomerId
          )
        ) {
          throw new Error(
            `search_reports did not return customer ${String(customer.customerId)}.`
          );
        }
      }
    },
    manage_campaigns: {
      name: 'manage_campaigns updates the created search campaign',
      use: ['campaign'],
      run: async ctx => {
        let campaign = ctx.resource('campaign');
        let name = ctx.namespaced('campaign updated');
        await ctx.invokeTool('manage_campaigns', {
          customerId: String(campaign.customerId),
          operation: 'update',
          campaignId: String(campaign.campaignId),
          name
        });

        ctx.updateResource('campaign', { name });
      }
    },
    manage_ad_groups: {
      name: 'manage_ad_groups updates the created ad group',
      use: ['ad_group'],
      run: async ctx => {
        let adGroup = ctx.resource('ad_group');
        let name = ctx.namespaced('ad group updated');
        await ctx.invokeTool('manage_ad_groups', {
          customerId: String(adGroup.customerId),
          operation: 'update',
          adGroupId: String(adGroup.adGroupId),
          name
        });

        ctx.updateResource('ad_group', { name });
      }
    },
    manage_ads: {
      name: 'manage_ads updates the created responsive search ad status',
      use: ['ad'],
      run: async ctx => {
        let ad = ctx.resource('ad');
        await ctx.invokeTool('manage_ads', {
          customerId: String(ad.customerId),
          operation: 'update',
          adGroupAdResourceName: String(ad.adGroupAdResourceName),
          status: 'ENABLED'
        });

        ctx.updateResource('ad', { status: 'ENABLED' });
      }
    },
    manage_keywords: {
      name: 'manage_keywords updates the created keyword criterion',
      use: ['keyword'],
      run: async ctx => {
        let keyword = ctx.resource('keyword');
        await ctx.invokeTool('manage_keywords', {
          customerId: String(keyword.customerId),
          operation: 'update',
          adGroupId: String(keyword.adGroupId),
          criterionId: String(keyword.criterionId),
          status: 'ENABLED'
        });

        ctx.updateResource('keyword', { status: 'ENABLED' });
      }
    },
    manage_bidding_strategies: {
      name: 'manage_bidding_strategies updates the created portfolio strategy name',
      use: ['bidding_strategy'],
      run: async ctx => {
        let strategy = ctx.resource('bidding_strategy');
        let name = ctx.namespaced('bidding strategy updated');
        await ctx.invokeTool('manage_bidding_strategies', {
          customerId: String(strategy.customerId),
          operation: 'update',
          biddingStrategyId: String(strategy.biddingStrategyId),
          name
        });

        ctx.updateResource('bidding_strategy', { name });
      }
    },
    manage_conversion_actions: {
      name: 'manage_conversion_actions updates the upload conversion action name',
      use: ['conversion_action'],
      run: async ctx => {
        let conversionAction = ctx.resource('conversion_action');
        let name = ctx.namespaced('conversion action updated');
        await ctx.invokeTool('manage_conversion_actions', {
          customerId: String(conversionAction.customerId),
          operation: 'update',
          conversionActionId: String(conversionAction.conversionActionId),
          name
        });

        ctx.updateResource('conversion_action', { name });
      }
    },
    generate_keyword_ideas: {
      name: 'generate_keyword_ideas returns keyword planner suggestions',
      use: ['customer'],
      run: async ctx => {
        let customer = ctx.resource('customer');
        let result = await ctx.invokeTool('generate_keyword_ideas', {
          customerId: String(customer.customerId),
          seedKeywords: ['project management software', 'team collaboration app'],
          language: 'languageConstants/1000',
          geoTargetConstants: ['geoTargetConstants/2840'],
          pageSize: 10
        });

        if (!Array.isArray(result.output.keywordIdeas)) {
          throw new Error('generate_keyword_ideas did not return a keywordIdeas array.');
        }
      }
    },
    upload_offline_conversions: {
      name: 'upload_offline_conversions accepts a partial-failure upload payload',
      use: ['customer', 'conversion_action'],
      run: async ctx => {
        let customer = ctx.resource('customer');
        let conversionAction = ctx.resource('conversion_action');
        let result = await ctx.invokeTool('upload_offline_conversions', {
          customerId: String(customer.customerId),
          partialFailure: true,
          conversions: [
            {
              gclid: createSyntheticGclid(ctx.runId),
              conversionAction: String(
                conversionAction.conversionActionResourceName
              ),
              conversionDateTime: createOfflineConversionDateTime(),
              conversionValue: 1,
              currencyCode: 'USD',
              orderId: `offline-${compactToken(ctx.runId, 16)}`
            }
          ]
        });

        if (result.output.uploadResults === undefined) {
          throw new Error(
            'upload_offline_conversions did not return uploadResults.'
          );
        }
      }
    },
    manage_audience_lists: {
      name: 'manage_audience_lists updates the created CRM audience list',
      use: ['audience_list'],
      run: async ctx => {
        let audienceList = ctx.resource('audience_list');
        let description = `Updated by ${ctx.runId}`;
        await ctx.invokeTool('manage_audience_lists', {
          customerId: String(audienceList.customerId),
          operation: 'update',
          userListId: String(audienceList.userListId),
          description
        });

        ctx.updateResource('audience_list', { description });
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleAdsToolE2E
});
