import { SlateTool } from 'slates';
import { z } from 'zod';
import { SternFinancialDataClient } from '../lib/client';
import { applySourceFilters, BetaFilters, ErpFilters } from '../lib/filters';
import { sternFinancialDataServiceError } from '../lib/errors';
import { spec } from '../spec';

let commonControls = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .default(25)
    .describe('Maximum rows to return when returnAll is false. Defaults to 25.'),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe('Number of filtered rows to skip.'),
  returnAll: z
    .boolean()
    .optional()
    .default(false)
    .describe('Return all filtered rows. Use sparingly because full Stern rows are wide.'),
  includeRaw: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include original cell text in each returned row.')
};

let percentageDescription = 'Decimal percentage value; for example, 0.05 means 5%.';

let erpInputSchema = z.object({
  source: z.literal('erp').describe('Country equity risk premium source.'),
  ...commonControls,
  countries: z
    .array(z.string())
    .optional()
    .describe('Exact country names to include, case-insensitive.'),
  countrySearch: z
    .string()
    .optional()
    .describe('Case-insensitive substring search over country names.'),
  moodysRatings: z
    .array(z.string())
    .optional()
    .describe("Moody's ratings to include, such as Aaa, Baa2, Caa1, or NR."),
  minEquityRiskPremium: z
    .number()
    .optional()
    .describe(`Minimum equity risk premium. ${percentageDescription}`),
  maxEquityRiskPremium: z
    .number()
    .optional()
    .describe(`Maximum equity risk premium. ${percentageDescription}`),
  minCountryRiskPremium: z
    .number()
    .optional()
    .describe(`Minimum country risk premium. ${percentageDescription}`),
  maxCountryRiskPremium: z
    .number()
    .optional()
    .describe(`Maximum country risk premium. ${percentageDescription}`),
  minCorporateTaxRate: z
    .number()
    .optional()
    .describe(`Minimum corporate tax rate. ${percentageDescription}`),
  maxCorporateTaxRate: z
    .number()
    .optional()
    .describe(`Maximum corporate tax rate. ${percentageDescription}`),
  hasSovereignCds: z
    .boolean()
    .optional()
    .describe('Filter by whether the row has a sovereign CDS value.')
});

let betaFilterControls = {
  industries: z
    .array(z.string())
    .optional()
    .describe('Exact industry names to include, case-insensitive.'),
  industrySearch: z
    .string()
    .optional()
    .describe('Case-insensitive substring search over industry names.'),
  rowType: z
    .enum(['industry', 'aggregate'])
    .optional()
    .describe('Filter regular industries or total-market aggregate rows.'),
  minBeta: z.number().optional().describe('Minimum levered beta.'),
  maxBeta: z.number().optional().describe('Maximum levered beta.'),
  minUnleveredBeta: z.number().optional().describe('Minimum unlevered beta.'),
  maxUnleveredBeta: z.number().optional().describe('Maximum unlevered beta.'),
  minNumberOfFirms: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Minimum number of firms in the industry row.'),
  maxDebtToEquityRatio: z
    .number()
    .optional()
    .describe(`Maximum debt-to-equity ratio. ${percentageDescription}`)
};

let usIndustryBetasInputSchema = z.object({
  source: z.literal('us_industry_betas').describe('US industry beta source.'),
  ...commonControls,
  ...betaFilterControls
});

let globalIndustryBetasInputSchema = z.object({
  source: z.literal('global_industry_betas').describe('Global industry beta source.'),
  ...commonControls,
  ...betaFilterControls
});

let inputSchema = z.discriminatedUnion('source', [
  erpInputSchema,
  usIndustryBetasInputSchema,
  globalIndustryBetasInputSchema
]);

let outputSchema = z.object({
  metadata: z.object({
    source: z.string().describe('Source id that was retrieved.'),
    title: z.string().describe('Source title.'),
    pageUrl: z.string().describe('Stern HTML page URL.'),
    workbookUrl: z.string().describe('Stern workbook URL.'),
    retrievedAt: z.string().describe('ISO timestamp for this retrieval.'),
    sourceType: z
      .enum(['workbook', 'html'])
      .describe('Whether rows came from the workbook or HTML fallback.'),
    workbookFallbackReason: z
      .string()
      .optional()
      .describe('Reason workbook extraction fell back to HTML, when applicable.')
  }),
  totalRowCount: z.number().describe('Rows extracted before filtering.'),
  filteredRowCount: z.number().describe('Rows remaining after filters.'),
  returnedRowCount: z.number().describe('Rows returned in this response.'),
  offset: z.number().describe('Filtered-row offset applied.'),
  limit: z.number().nullable().describe('Row limit applied, or null when returnAll is true.'),
  returnAll: z.boolean().describe('Whether all filtered rows were requested.'),
  truncated: z.boolean().describe('Whether additional filtered rows were omitted.'),
  rows: z.array(z.any()).describe('Filtered Stern financial data rows.')
});

let validateRange = (min: number | undefined, max: number | undefined, label: string) => {
  if (min !== undefined && max !== undefined && min > max) {
    throw sternFinancialDataServiceError(`${label} minimum cannot be greater than maximum.`);
  }
};

let validateInput = (input: z.infer<typeof inputSchema>) => {
  if (input.source === 'erp') {
    validateRange(input.minEquityRiskPremium, input.maxEquityRiskPremium, 'equityRiskPremium');
    validateRange(
      input.minCountryRiskPremium,
      input.maxCountryRiskPremium,
      'countryRiskPremium'
    );
    validateRange(input.minCorporateTaxRate, input.maxCorporateTaxRate, 'corporateTaxRate');
    return;
  }

  validateRange(input.minBeta, input.maxBeta, 'beta');
  validateRange(input.minUnleveredBeta, input.maxUnleveredBeta, 'unleveredBeta');
};

export let getSource = SlateTool.create(spec, {
  name: 'Get Source',
  key: 'get_source',
  description:
    'Retrieve a Stern financial data source and return filtered rows. Full output is available with returnAll=true, but use filters and limits when possible because full rows include many financial metrics and raw cell text can be large.',
  instructions: [
    'Call list_sources first when you need the available source ids, row fields, or filter hints.',
    'Use filters such as countrySearch, industrySearch, rating, beta, premium, and rowType before requesting full output.',
    'Set includeRaw only when original formatted cell text is needed for audit or display.'
  ],
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(inputSchema)
  .output(outputSchema)
  .handleInvocation(async ctx => {
    validateInput(ctx.input);

    let client = new SternFinancialDataClient();
    let result = await client.getSource(ctx.input.source);
    let paginated = applySourceFilters(
      ctx.input.source,
      result.rows,
      ctx.input.source === 'erp' ? (ctx.input as ErpFilters) : (ctx.input as BetaFilters)
    );

    return {
      output: {
        metadata: result.metadata,
        totalRowCount: paginated.totalRowCount,
        filteredRowCount: paginated.filteredRowCount,
        returnedRowCount: paginated.returnedRowCount,
        offset: ctx.input.offset,
        limit: ctx.input.returnAll ? null : ctx.input.limit,
        returnAll: ctx.input.returnAll,
        truncated: paginated.truncated,
        rows: paginated.returnedRows
      },
      message: `Retrieved **${paginated.returnedRowCount}** of **${paginated.filteredRowCount}** filtered Stern **${ctx.input.source}** rows.`
    };
  })
  .build();
