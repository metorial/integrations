import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    shopDomain: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Shopify OAuth',
    key: 'oauth',

    inputSchema: z.object({
      shopDomain: z.string().describe('Shop subdomain (e.g., "my-store" from "my-store.myshopify.com")')
    }),

    scopes: [
      { title: 'Read Products', description: 'View products, variants, and collections', scope: 'read_products' },
      { title: 'Write Products', description: 'Create and modify products, variants, and collections', scope: 'write_products' },
      { title: 'Read Orders', description: 'View orders, transactions, and fulfillments', scope: 'read_orders' },
      { title: 'Write Orders', description: 'Create and modify orders', scope: 'write_orders' },
      { title: 'Read All Orders', description: 'View all orders (not limited to last 60 days)', scope: 'read_all_orders' },
      { title: 'Read Customers', description: 'View customer records and groups', scope: 'read_customers' },
      { title: 'Write Customers', description: 'Create and modify customer records', scope: 'write_customers' },
      { title: 'Read Inventory', description: 'View inventory levels and locations', scope: 'read_inventory' },
      { title: 'Write Inventory', description: 'Modify inventory levels', scope: 'write_inventory' },
      { title: 'Read Fulfillments', description: 'View fulfillment details', scope: 'read_fulfillments' },
      { title: 'Write Fulfillments', description: 'Create and update fulfillments', scope: 'write_fulfillments' },
      { title: 'Read Draft Orders', description: 'View draft orders', scope: 'read_draft_orders' },
      { title: 'Write Draft Orders', description: 'Create and modify draft orders', scope: 'write_draft_orders' },
      { title: 'Read Content', description: 'View pages, blogs, and articles', scope: 'read_content' },
      { title: 'Write Content', description: 'Create and modify pages, blogs, and articles', scope: 'write_content' },
      { title: 'Read Shipping', description: 'View shipping rates and zones', scope: 'read_shipping' },
      { title: 'Write Shipping', description: 'Manage shipping rates and zones', scope: 'write_shipping' },
      { title: 'Read Discounts', description: 'View discount codes and price rules', scope: 'read_discounts' },
      { title: 'Write Discounts', description: 'Create and modify discount codes and price rules', scope: 'write_discounts' },
      { title: 'Read Locations', description: 'View store locations', scope: 'read_locations' },
      { title: 'Read Themes', description: 'View themes', scope: 'read_themes' },
      { title: 'Write Themes', description: 'Create and modify themes', scope: 'write_themes' }
    ],

    getAuthorizationUrl: async (ctx) => {
      let shopDomain = ctx.input.shopDomain.replace('.myshopify.com', '').trim();
      let scopeString = ctx.scopes.join(',');
      let url = `https://${shopDomain}.myshopify.com/admin/oauth/authorize?client_id=${encodeURIComponent(ctx.clientId)}&scope=${encodeURIComponent(scopeString)}&redirect_uri=${encodeURIComponent(ctx.redirectUri)}&state=${encodeURIComponent(ctx.state)}`;

      return {
        url,
        input: { shopDomain }
      };
    },

    handleCallback: async (ctx) => {
      let shopDomain = ctx.input.shopDomain.replace('.myshopify.com', '').trim();
      let http = createAxios({
        baseURL: `https://${shopDomain}.myshopify.com`
      });

      let response = await http.post('/admin/oauth/access_token', {
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code
      });

      return {
        output: {
          token: response.data.access_token,
          shopDomain
        },
        input: { shopDomain }
      };
    },

    getProfile: async (ctx: { output: { token: string; shopDomain?: string }; input: { shopDomain: string }; scopes: string[] }) => {
      let shopDomain = ctx.output.shopDomain || ctx.input.shopDomain;
      let http = createAxios({
        baseURL: `https://${shopDomain}.myshopify.com`,
        headers: {
          'X-Shopify-Access-Token': ctx.output.token
        }
      });

      let response = await http.get('/admin/api/2024-10/shop.json');
      let shop = response.data.shop;

      return {
        profile: {
          id: String(shop.id),
          name: shop.name,
          email: shop.email,
          shopDomain: shop.myshopify_domain
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Access Token',
    key: 'access_token',

    inputSchema: z.object({
      token: z.string().describe('Shopify Admin API access token (from custom app or manual setup)')
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; shopDomain?: string }; input: { token: string } }) => {
      return {
        profile: {
          name: 'Shopify Store'
        }
      };
    }
  });
