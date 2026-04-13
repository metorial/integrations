import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let searchOrganizations = SlateTool.create(
  spec,
  {
    name: 'Search Organizations',
    key: 'search_organizations',
    description: `Search Apollo's company database to find organizations matching specific criteria. Returns company details including industry, size, funding, and technology stack.`,
    instructions: [
      'Use specific filters to narrow results. Broad searches may hit the 50,000 record display limit.',
      'Employee count ranges use formats like "1,10", "11,50", "51,200", "201,500", "501,1000", "1001,5000", "5001,10000".'
    ],
    constraints: [
      'Maximum 50,000 results (100 per page, up to 500 pages)'
    ],
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({
    companyName: z.string().optional().describe('Search by company/organization name'),
    keywordTags: z.array(z.string()).optional().describe('Filter by keyword tags associated with organizations'),
    locations: z.array(z.string()).optional().describe('Filter by organization locations, e.g. ["San Francisco, CA"]'),
    employeeRanges: z.array(z.string()).optional().describe('Filter by employee count ranges, e.g. ["1,10", "51,200"]'),
    organizationIds: z.array(z.string()).optional().describe('Filter by specific Apollo organization IDs'),
    page: z.number().optional().describe('Page number (default: 1)'),
    perPage: z.number().optional().describe('Results per page (default: 25, max: 100)')
  }))
  .output(z.object({
    organizations: z.array(z.object({
      organizationId: z.string().optional(),
      name: z.string().optional(),
      websiteUrl: z.string().optional(),
      domain: z.string().optional(),
      linkedinUrl: z.string().optional(),
      industry: z.string().optional(),
      estimatedEmployees: z.number().optional(),
      foundedYear: z.number().optional(),
      annualRevenue: z.number().optional(),
      annualRevenuePrinted: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      shortDescription: z.string().optional(),
      logoUrl: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional()
    })),
    totalEntries: z.number().optional(),
    currentPage: z.number().optional(),
    totalPages: z.number().optional()
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.searchOrganizations({
      qOrganizationName: ctx.input.companyName,
      qOrganizationKeywordTags: ctx.input.keywordTags,
      organizationLocations: ctx.input.locations,
      organizationNumEmployeesRanges: ctx.input.employeeRanges,
      organizationIds: ctx.input.organizationIds,
      page: ctx.input.page,
      perPage: ctx.input.perPage
    });

    let organizations = result.organizations.map(o => ({
      organizationId: o.id,
      name: o.name,
      websiteUrl: o.website_url,
      domain: o.domain,
      linkedinUrl: o.linkedin_url,
      industry: o.industry,
      estimatedEmployees: o.estimated_num_employees,
      foundedYear: o.founded_year,
      annualRevenue: o.annual_revenue,
      annualRevenuePrinted: o.annual_revenue_printed,
      city: o.city,
      state: o.state,
      country: o.country,
      shortDescription: o.short_description,
      logoUrl: o.logo_url,
      keywords: o.keywords,
      technologies: o.technology_names
    }));

    return {
      output: {
        organizations,
        totalEntries: result.pagination?.total_entries,
        currentPage: result.pagination?.page,
        totalPages: result.pagination?.total_pages
      },
      message: `Found **${result.pagination?.total_entries ?? organizations.length}** organizations (page ${result.pagination?.page ?? 1} of ${result.pagination?.total_pages ?? 1}). Returned ${organizations.length} results.`
    };
  })
  .build();
