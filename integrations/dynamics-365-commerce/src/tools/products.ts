import { commerceProductInputSchema } from '@slates/dynamics-commerce-recipes';
import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import {
  buildCommerceToolOutput,
  commerceMessage,
  commerceResultOutputSchema,
  createCommerceClient,
  withCommerceDefaults
} from './shared';

let productInputSchema = commerceProductInputSchema.extend({
  includeAttributes: z
    .boolean()
    .optional()
    .describe('For search_products, ask Retail Server to include product attributes.'),
  refiners: z
    .array(z.unknown())
    .optional()
    .describe('For search_products, Retail Server refiner payloads to apply.'),
  affiliationLoyaltyTiers: z
    .array(z.unknown())
    .optional()
    .describe('For get_active_prices, customer affiliation/loyalty tier payloads.')
});

export let lookupProductsPricesInventory = SlateTool.create(spec, {
  name: 'Lookup Commerce Products, Prices, Promotions, And Inventory',
  key: 'lookup_products_prices_inventory',
  description:
    'Search Dynamics 365 Commerce products, retrieve product details, get active prices, inspect promotions, and check product or estimated inventory availability through Retail Server.',
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .input(productInputSchema)
  .output(commerceResultOutputSchema)
  .handleInvocation(async ctx => {
    let client = createCommerceClient(ctx);
    let input = withCommerceDefaults(ctx, ctx.input);
    let result: unknown;
    let collection = true;

    switch (input.action) {
      case 'search_products':
        result = await client.searchProducts(input);
        break;
      case 'get_product':
        result = await client.getProduct(input as any);
        collection = false;
        break;
      case 'get_products_by_ids':
        result = await client.getProductsByIds(input as any);
        break;
      case 'get_active_prices':
        result = await client.getActivePrices(input as any);
        break;
      case 'get_product_promotions':
        result = await client.getProductPromotions(input as any);
        break;
      case 'get_product_availabilities':
        result = await client.getProductAvailabilities(input as any);
        break;
      case 'get_estimated_availability':
        result = await client.getEstimatedAvailability(input as any);
        break;
    }

    let output = buildCommerceToolOutput(input.action, result, {
      collection,
      pageInput: collection ? input : undefined
    });

    return {
      output,
      message: commerceMessage(
        'Commerce products, prices, promotions, and inventory',
        input.action,
        output
      )
    };
  })
  .build();
