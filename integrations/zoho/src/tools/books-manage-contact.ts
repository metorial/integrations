import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { ZohoBooksClient } from '../lib/client';
import type { Datacenter } from '../lib/urls';

export let booksManageContact = SlateTool.create(spec, {
  name: 'Books Manage Contact',
  key: 'books_manage_contact',
  description: `Create, update, or delete contacts (customers/vendors) in Zoho Books. Manage contact details, billing/shipping addresses, payment terms, and contact persons.`,
  instructions: [
    'The organizationId is required for all Zoho Books operations.',
    'For create, contactName is required.',
    'Use contactType to specify "customer" or "vendor".',
  ],
  tags: {
    destructive: true,
  },
})
  .input(z.object({
    organizationId: z.string().describe('Zoho Books organization ID'),
    action: z.enum(['create', 'update', 'delete', 'list']).describe('Operation to perform'),
    contactId: z.string().optional().describe('Contact ID (required for update, delete)'),
    contactName: z.string().optional().describe('Contact/company name (required for create)'),
    contactType: z.enum(['customer', 'vendor']).optional().describe('Type of contact'),
    companyName: z.string().optional().describe('Company name'),
    email: z.string().optional().describe('Contact email address'),
    phone: z.string().optional().describe('Contact phone number'),
    website: z.string().optional().describe('Contact website'),
    billingAddress: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    }).optional().describe('Billing address'),
    shippingAddress: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    }).optional().describe('Shipping address'),
    paymentTerms: z.number().optional().describe('Net payment terms in days'),
    notes: z.string().optional().describe('Notes about the contact'),
    page: z.number().optional().describe('Page number (for list action)'),
    perPage: z.number().optional().describe('Records per page (for list action)'),
  }))
  .output(z.object({
    contact: z.record(z.string(), z.any()).optional().describe('Contact record'),
    contacts: z.array(z.record(z.string(), z.any())).optional().describe('List of contacts (for list action)'),
    deleted: z.boolean().optional(),
    hasMorePages: z.boolean().optional(),
  }))
  .handleInvocation(async (ctx) => {
    let dc = (ctx.auth.datacenter || ctx.config.datacenter || 'us') as Datacenter;
    let client = new ZohoBooksClient({ token: ctx.auth.token, datacenter: dc, organizationId: ctx.input.organizationId });

    if (ctx.input.action === 'list') {
      let result = await client.listContacts({
        page: ctx.input.page,
        perPage: ctx.input.perPage,
        contactType: ctx.input.contactType,
      });
      return {
        output: {
          contacts: result?.contacts || [],
          hasMorePages: result?.page_context?.has_more_page ?? false,
        },
        message: `Retrieved **${(result?.contacts || []).length}** contacts.`,
      };
    }

    let buildData = () => {
      let data: Record<string, any> = {};
      if (ctx.input.contactName) data.contact_name = ctx.input.contactName;
      if (ctx.input.contactType) data.contact_type = ctx.input.contactType;
      if (ctx.input.companyName) data.company_name = ctx.input.companyName;
      if (ctx.input.email) data.email = ctx.input.email;
      if (ctx.input.phone) data.phone = ctx.input.phone;
      if (ctx.input.website) data.website = ctx.input.website;
      if (ctx.input.paymentTerms !== undefined) data.payment_terms = ctx.input.paymentTerms;
      if (ctx.input.notes) data.notes = ctx.input.notes;
      if (ctx.input.billingAddress) {
        data.billing_address = {
          street: ctx.input.billingAddress.street,
          city: ctx.input.billingAddress.city,
          state: ctx.input.billingAddress.state,
          zip: ctx.input.billingAddress.zip,
          country: ctx.input.billingAddress.country,
        };
      }
      if (ctx.input.shippingAddress) {
        data.shipping_address = {
          street: ctx.input.shippingAddress.street,
          city: ctx.input.shippingAddress.city,
          state: ctx.input.shippingAddress.state,
          zip: ctx.input.shippingAddress.zip,
          country: ctx.input.shippingAddress.country,
        };
      }
      return data;
    };

    if (ctx.input.action === 'create') {
      let result = await client.createContact(buildData());
      let contact = result?.contact;
      return {
        output: { contact },
        message: `Created contact **${contact?.contact_name}**.`,
      };
    }

    if (ctx.input.action === 'update') {
      if (!ctx.input.contactId) throw new Error('contactId is required for update');
      let result = await client.updateContact(ctx.input.contactId, buildData());
      let contact = result?.contact;
      return {
        output: { contact },
        message: `Updated contact **${contact?.contact_name || ctx.input.contactId}**.`,
      };
    }

    if (ctx.input.action === 'delete') {
      if (!ctx.input.contactId) throw new Error('contactId is required for delete');
      await client.deleteContact(ctx.input.contactId);
      return {
        output: { deleted: true },
        message: `Deleted contact **${ctx.input.contactId}**.`,
      };
    }

    throw new Error(`Unknown action: ${ctx.input.action}`);
  }).build();
