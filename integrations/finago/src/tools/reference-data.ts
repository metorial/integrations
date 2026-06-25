import { SlateTool } from 'slates';
import { z } from 'zod';
import { finagoServiceError } from '../lib/errors';
import { createClientFromContext } from '../lib/helpers';
import { spec } from '../spec';
import { listOutputSchema, maxPagesSchema } from './shared';

let referenceTypeSchema = z.enum([
  'taxes',
  'currencies',
  'payment_methods',
  'transaction_types',
  'fiscal_periods',
  'product_categories',
  'product_units',
  'price_lists',
  'price_list_prices',
  'sales_types',
  'dimensions',
  'dimension_elements'
]);

let referencePath = (input: {
  referenceType: z.infer<typeof referenceTypeSchema>;
  id?: string;
  dimensionType?: number;
  value?: string;
}) => {
  switch (input.referenceType) {
    case 'taxes':
      return input.id ? `/taxes/${encodeURIComponent(input.id)}` : '/taxes';
    case 'currencies':
      return '/currencies';
    case 'payment_methods':
      return '/paymentmethods';
    case 'transaction_types':
      return '/transactiontypes';
    case 'fiscal_periods':
      return '/fiscalperiods';
    case 'product_categories':
      return input.id
        ? `/productcategories/${encodeURIComponent(input.id)}`
        : '/productcategories';
    case 'product_units':
      return '/productunits';
    case 'price_lists':
      return input.id ? `/pricelists/${encodeURIComponent(input.id)}` : '/pricelists';
    case 'price_list_prices':
      if (!input.id) throw finagoServiceError('id is required for price_list_prices.');
      return `/pricelists/${encodeURIComponent(input.id)}/prices`;
    case 'sales_types':
      return input.id ? `/salestypes/${encodeURIComponent(input.id)}` : '/salestypes';
    case 'dimensions':
      return input.dimensionType ? `/dimensions/${input.dimensionType}` : '/dimensions';
    case 'dimension_elements':
      if (!input.dimensionType) {
        throw finagoServiceError('dimensionType is required for dimension_elements.');
      }
      return input.value
        ? `/dimensions/${input.dimensionType}/elements/${encodeURIComponent(input.value)}`
        : `/dimensions/${input.dimensionType}/elements`;
  }
};

export let finagoListReferenceData = SlateTool.create(spec, {
  name: 'List Reference Data',
  key: 'finago_list_reference_data',
  description:
    'Read Finago reference data used by accounting, product, and sales workflows, including taxes, currencies, payment methods, transaction types, periods, product categories, units, price lists, sales types, and dimensions.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      referenceType: referenceTypeSchema.describe('The Finago reference data family to read.'),
      id: z
        .string()
        .optional()
        .describe('Optional ID for reference families that support reading one record.'),
      dimensionType: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Dimension type ID, required for dimension_elements.'),
      value: z
        .string()
        .optional()
        .describe('Dimension element value/key when reading one dimension element.'),
      fiscalPeriodType: z
        .enum(['Year', 'Period', 'All'])
        .optional()
        .describe('Filter fiscal periods by Year, Period, or All.'),
      productIds: z
        .string()
        .optional()
        .describe('Product IDs/ranges for price_list_prices, e.g. "1..10,20".'),
      limit: z.number().int().positive().optional().describe('Page size where supported.'),
      continuationToken: z
        .string()
        .optional()
        .describe('Continuation token for paginated dimension or sales APIs.'),
      maxPages: maxPagesSchema
    })
  )
  .output(listOutputSchema)
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let path = referencePath(ctx.input);
    let params = {
      type:
        ctx.input.referenceType === 'fiscal_periods' ? ctx.input.fiscalPeriodType : undefined,
      productIds:
        ctx.input.referenceType === 'price_list_prices' ? ctx.input.productIds : undefined,
      limit: ctx.input.limit,
      continuationToken: ctx.input.continuationToken
    };
    let result = await client.list(
      path,
      params,
      ctx.input.maxPages ?? 1,
      `read ${ctx.input.referenceType}`
    );

    return {
      output: result,
      message: `Retrieved **${result.count}** Finago ${ctx.input.referenceType.replace(/_/g, ' ')} record(s).`
    };
  })
  .build();
