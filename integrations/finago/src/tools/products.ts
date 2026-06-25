import { SlateTool } from 'slates';
import { z } from 'zod';
import { finagoServiceError, requireInput, requireUpdateFields } from '../lib/errors';
import { createClientFromContext } from '../lib/helpers';
import {
  getNumber,
  getString,
  isRecord,
  mergeAdditionalFields,
  objectWithDefined
} from '../lib/records';
import { spec } from '../spec';
import { additionalFieldsSchema, maxPagesSchema } from './shared';

let productSchema = z.object({
  productId: z.number().optional().describe('Finago product ID.'),
  name: z.string().optional().describe('Product name.'),
  number: z.string().optional().describe('Product number.'),
  status: z.string().optional().describe('Product status.'),
  type: z.string().optional().describe('Product type.'),
  categoryId: z.number().optional().describe('Product category ID.'),
  salesPrice: z.number().optional().describe('Sales price.'),
  costPrice: z.number().optional().describe('Cost price.'),
  stockQuantity: z.number().optional().describe('Stock quantity if returned.'),
  createdAt: z.string().optional().describe('Created timestamp.'),
  modifiedAt: z.string().optional().describe('Modified timestamp.'),
  record: z.unknown().describe('Raw Finago product record.')
});

let nestedNumber = (record: unknown, parent: string, key: string) => {
  if (!isRecord(record) || !isRecord(record[parent])) return undefined;
  let value = record[parent][key];
  return typeof value === 'number' ? value : undefined;
};

let mapProduct = (record: unknown) => ({
  productId: getNumber(record, 'id'),
  name: getString(record, 'name'),
  number: getString(record, 'number'),
  status: getString(record, 'status'),
  type: getString(record, 'type'),
  categoryId: nestedNumber(record, 'category', 'id'),
  salesPrice: getNumber(record, 'salesPrice'),
  costPrice: getNumber(record, 'costPrice'),
  stockQuantity: nestedNumber(record, 'stock', 'quantity'),
  createdAt: getString(record, 'createdAt'),
  modifiedAt: getString(record, 'modifiedAt'),
  record
});

let productBody = (input: {
  name?: string;
  number?: string;
  type?: 'default' | 'structure';
  status?: 'active' | 'inactive';
  description?: string;
  costPrice?: number;
  salesPrice?: number;
  indirectCost?: number;
  webshopEnabled?: boolean;
  categoryId?: number;
  unitId?: number;
  supplierId?: number;
  ean?: string;
  eanAlternative?: string;
  stockManaged?: boolean;
  stockQuantity?: number;
  stockLocation?: string;
  additionalFields?: Record<string, unknown>;
}) => {
  let body: Record<string, unknown> = objectWithDefined({
    name: input.name,
    number: input.number,
    type: input.type,
    status: input.status,
    description: input.description,
    costPrice: input.costPrice,
    salesPrice: input.salesPrice,
    indirectCost: input.indirectCost,
    webshopEnabled: input.webshopEnabled,
    ean: input.ean,
    eanAlternative: input.eanAlternative
  });

  if (input.categoryId !== undefined) body.category = { id: input.categoryId };
  if (input.unitId !== undefined) body.units = { id: input.unitId };
  if (input.supplierId !== undefined) body.supplier = { id: input.supplierId };
  if (
    input.stockManaged !== undefined ||
    input.stockQuantity !== undefined ||
    input.stockLocation !== undefined
  ) {
    body.stock = objectWithDefined({
      isManaged: input.stockManaged,
      quantity: input.stockQuantity,
      location: input.stockLocation
    });
  }

  return mergeAdditionalFields(body, input.additionalFields);
};

export let finagoListProducts = SlateTool.create(spec, {
  name: 'List Products',
  key: 'finago_list_products',
  description:
    'List Finago products with search, product number, category, supplier, and pagination filters. Use categories, units, and price lists from reference data before creating products.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      productId: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Read one product by ID instead of listing products.'),
      page: z.number().int().positive().optional().describe('Page number.'),
      limit: z.number().int().min(1).max(100).optional().describe('Page size.'),
      productSearch: z
        .string()
        .optional()
        .describe('Search product number, name, supplier product number, and supplier name.'),
      categoryIds: z.string().optional().describe('Comma-separated product category IDs.'),
      supplierIds: z.string().optional().describe('Comma-separated supplier IDs.'),
      productNumber: z.string().optional().describe('Filter by product number.'),
      maxPages: maxPagesSchema
    })
  )
  .output(
    z.object({
      products: z.array(productSchema).describe('Products returned by Finago.'),
      count: z.number().describe('Number of products returned.'),
      pageCount: z.number().optional(),
      hasNextPage: z.boolean().optional(),
      nextLink: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let result =
      ctx.input.productId !== undefined
        ? {
            records: [
              await client.get(`/products/${ctx.input.productId}`, undefined, 'read product')
            ],
            pageCount: 1,
            hasNextPage: false,
            nextLink: undefined
          }
        : await client.list(
            '/products',
            {
              page: ctx.input.page,
              limit: ctx.input.limit,
              productSearch: ctx.input.productSearch,
              categoryIds: ctx.input.categoryIds,
              supplierIds: ctx.input.supplierIds,
              productNumber: ctx.input.productNumber
            },
            ctx.input.maxPages ?? 1,
            'list products'
          );
    let products = result.records.map(mapProduct);

    return {
      output: {
        products,
        count: products.length,
        pageCount: result.pageCount,
        hasNextPage: result.hasNextPage,
        nextLink: result.nextLink
      },
      message: `Retrieved **${products.length}** Finago product(s).`
    };
  })
  .build();

export let finagoUpsertProduct = SlateTool.create(spec, {
  name: 'Upsert Product',
  key: 'finago_upsert_product',
  description:
    'Create or update a Finago product. Creating a product requires a name and categoryId; updating requires productId and at least one product field.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      operation: z.enum(['create', 'update']).describe('Create a product or update one.'),
      productId: z.number().int().positive().optional().describe('Required for update.'),
      name: z.string().optional().describe('Product name. Required for create.'),
      number: z.string().optional().describe('Product number.'),
      type: z.enum(['default', 'structure']).optional().describe('Product type.'),
      status: z.enum(['active', 'inactive']).optional().describe('Product status.'),
      description: z.string().optional().describe('Product description.'),
      costPrice: z.number().optional().describe('Cost price.'),
      salesPrice: z.number().optional().describe('Sales price.'),
      indirectCost: z.number().optional().describe('Indirect cost.'),
      webshopEnabled: z.boolean().optional().describe('Whether webshop sales are enabled.'),
      categoryId: z.number().int().positive().optional().describe('Product category ID.'),
      unitId: z.number().int().positive().optional().describe('Product unit ID.'),
      supplierId: z.number().int().positive().optional().describe('Supplier customer ID.'),
      ean: z.string().optional().describe('GTIN/EAN.'),
      eanAlternative: z.string().optional().describe('Alternative EAN/article number.'),
      stockManaged: z.boolean().optional().describe('Whether Finago manages stock quantity.'),
      stockQuantity: z.number().optional().describe('Stock quantity.'),
      stockLocation: z.string().optional().describe('Stock location identifier.'),
      additionalFields: additionalFieldsSchema
    })
  )
  .output(productSchema)
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);

    if (ctx.input.operation === 'create') {
      if (!ctx.input.name)
        throw finagoServiceError('name is required when creating a product.');
      if (ctx.input.categoryId === undefined) {
        throw finagoServiceError('categoryId is required when creating a product.');
      }
    } else {
      requireInput(ctx.input.productId, 'productId');
    }

    let body = productBody(ctx.input);
    if (ctx.input.operation === 'update') {
      requireUpdateFields(body, 'product');
    }

    let record =
      ctx.input.operation === 'create'
        ? await client.post('/products', body, undefined, 'create product')
        : await client.patch(
            `/products/${ctx.input.productId}`,
            body,
            undefined,
            'update product'
          );
    let output = mapProduct(record);

    return {
      output,
      message: `${ctx.input.operation === 'create' ? 'Created' : 'Updated'} Finago product **${output.name ?? output.productId ?? 'unknown'}**.`
    };
  })
  .build();
