import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let intersectionKeywordSchema = z.object({
  keyword: z.string().describe('Shared keyword'),
  searchVolume: z.number().optional().describe('Monthly search volume'),
  cpc: z.number().optional().describe('Cost per click'),
  competition: z.number().optional().describe('Competition level'),
  domainPositions: z.record(z.string(), z.number()).optional().describe('SERP position per domain'),
}).passthrough();

export let domainIntersection = SlateTool.create(
  spec,
  {
    name: 'Domain Intersection',
    key: 'domain_intersection',
    description: `Find shared keywords between two or more domains to identify keyword overlap and content gaps. Compares organic search keywords that multiple domains rank for simultaneously. Returns keyword metrics and each domain's ranking position. Essential for competitive keyword gap analysis.`,
    instructions: [
      'Provide two or more domains as targets to find shared keywords.',
      'Targets should be provided as a record where keys are indices ("1", "2", etc.) and values are domain names.',
      'Filter and sort results to focus on the most valuable keyword opportunities.',
    ],
    tags: {
      destructive: false,
      readOnly: true,
    },
  },
)
  .input(z.object({
    targets: z.record(z.string(), z.string()).describe('Domains to compare (e.g., {"1": "example.com", "2": "competitor.com"})'),
    locationName: z.string().optional().describe('Target location (e.g., "United States")'),
    locationCode: z.number().optional().describe('DataForSEO location code'),
    languageName: z.string().optional().describe('Language name'),
    languageCode: z.string().optional().describe('Language code'),
    limit: z.number().optional().describe('Maximum number of results'),
    offset: z.number().optional().describe('Pagination offset'),
    filters: z.array(z.string()).optional().describe('Filter results'),
    orderBy: z.array(z.string()).optional().describe('Order results'),
  }))
  .output(z.object({
    targets: z.record(z.string(), z.string()).describe('Compared domains'),
    totalCount: z.number().optional().describe('Total shared keywords found'),
    keywords: z.array(intersectionKeywordSchema).describe('Shared keywords with metrics'),
    cost: z.number().optional().describe('API cost'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    let response = await client.labsDomainIntersectionLive({
      targets: ctx.input.targets,
      locationName: ctx.input.locationName,
      locationCode: ctx.input.locationCode,
      languageName: ctx.input.languageName,
      languageCode: ctx.input.languageCode,
      limit: ctx.input.limit,
      offset: ctx.input.offset,
      filters: ctx.input.filters,
      orderBy: ctx.input.orderBy,
    });

    let result = client.extractFirstResult(response);
    let items = (result?.items ?? []).map((item: any) => {
      let positions: Record<string, number> = {};
      if (item.intersection_result) {
        for (let [key, val] of Object.entries(item.intersection_result)) {
          let posVal = val as any;
          if (posVal?.rank_absolute) {
            positions[key] = posVal.rank_absolute;
          }
        }
      }
      return {
        keyword: item.keyword_data?.keyword ?? '',
        searchVolume: item.keyword_data?.keyword_info?.search_volume,
        cpc: item.keyword_data?.keyword_info?.cpc,
        competition: item.keyword_data?.keyword_info?.competition,
        domainPositions: Object.keys(positions).length > 0 ? positions : undefined,
      };
    });

    let domainNames = Object.values(ctx.input.targets).join(', ');

    return {
      output: {
        targets: ctx.input.targets,
        totalCount: result?.total_count,
        keywords: items,
        cost: response.cost,
      },
      message: `Found **${items.length}** shared keywords between **${domainNames}** (total: ${result?.total_count ?? 'unknown'}).`,
    };
  }).build();
