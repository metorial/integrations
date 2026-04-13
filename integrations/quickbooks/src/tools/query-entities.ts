import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClientFromContext } from '../lib/helpers';
import { z } from 'zod';

export let queryEntities = SlateTool.create(spec, {
  name: 'Query Entities',
  key: 'query_entities',
  description: `Queries QuickBooks entities using a SQL-like query language. Search and filter any entity type (Customer, Invoice, Bill, Item, Account, Vendor, Payment, Estimate, etc.) with flexible WHERE conditions, sorting, and pagination.`,
  instructions: [
    'WHERE clause supports operators: =, <, >, <=, >=, IN, LIKE. String values must be in single quotes.',
    'Examples: "DisplayName LIKE \'%Smith%\'" or "Balance > \'0\'" or "TxnDate >= \'2024-01-01\'".',
    'Use ORDERBY with ASC or DESC, e.g., "TxnDate DESC".',
    'MAXRESULTS defaults to 100 if not specified. STARTPOSITION is 1-based.'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      entityType: z
        .enum([
          'Customer',
          'Invoice',
          'Bill',
          'Item',
          'Account',
          'Vendor',
          'Payment',
          'Estimate',
          'SalesReceipt',
          'Purchase',
          'JournalEntry',
          'BillPayment',
          'CreditMemo',
          'Deposit',
          'Transfer',
          'Employee',
          'Department',
          'Class',
          'Term',
          'TaxCode',
          'TaxRate'
        ])
        .describe('Type of entity to query'),
      where: z.string().optional().describe('WHERE clause for filtering (SQL-like syntax)'),
      orderBy: z.string().optional().describe('ORDER BY clause, e.g., "TxnDate DESC"'),
      maxResults: z
        .number()
        .optional()
        .default(100)
        .describe('Maximum number of results to return'),
      startPosition: z
        .number()
        .optional()
        .describe('Starting position for pagination (1-based)')
    })
  )
  .output(
    z.object({
      entities: z.array(z.any()).describe('Array of matching entities'),
      totalCount: z.number().optional().describe('Total number of matching records'),
      entityType: z.string().describe('Entity type that was queried')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);

    let entities = await client.runQuery(
      ctx.input.entityType,
      ctx.input.where,
      ctx.input.orderBy,
      ctx.input.maxResults,
      ctx.input.startPosition
    );

    return {
      output: {
        entities,
        totalCount: entities.length,
        entityType: ctx.input.entityType
      },
      message: `Found **${entities.length}** ${ctx.input.entityType} record(s)${ctx.input.where ? ` matching: ${ctx.input.where}` : ''}.`
    };
  })
  .build();

export let searchCustomersAndVendors = SlateTool.create(spec, {
  name: 'Search Contacts',
  key: 'search_contacts',
  description: `Searches for customers and/or vendors by name, email, or other criteria. A convenient alternative to raw queries for finding contacts.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      searchTerm: z
        .string()
        .describe('Search term to match against display name, company name, or email'),
      contactType: z
        .enum(['customer', 'vendor', 'both'])
        .default('both')
        .describe('Type of contacts to search'),
      activeOnly: z.boolean().optional().default(true).describe('Only return active contacts'),
      maxResults: z.number().optional().default(25).describe('Maximum number of results')
    })
  )
  .output(
    z.object({
      customers: z
        .array(
          z.object({
            customerId: z.string(),
            displayName: z.string(),
            companyName: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            balance: z.number().optional()
          })
        )
        .optional()
        .describe('Matching customers'),
      vendors: z
        .array(
          z.object({
            vendorId: z.string(),
            displayName: z.string(),
            companyName: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            balance: z.number().optional()
          })
        )
        .optional()
        .describe('Matching vendors')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let customers: any[] | undefined;
    let vendors: any[] | undefined;

    let nameFilter = `DisplayName LIKE '%${ctx.input.searchTerm}%'`;
    if (ctx.input.activeOnly) {
      nameFilter += ` AND Active = true`;
    }

    if (ctx.input.contactType === 'customer' || ctx.input.contactType === 'both') {
      let rawCustomers = await client.queryCustomers(
        nameFilter,
        undefined,
        ctx.input.maxResults
      );
      customers = rawCustomers.map((c: any) => ({
        customerId: c.Id,
        displayName: c.DisplayName,
        companyName: c.CompanyName,
        email: c.PrimaryEmailAddr?.Address,
        phone: c.PrimaryPhone?.FreeFormNumber,
        balance: c.Balance
      }));
    }

    if (ctx.input.contactType === 'vendor' || ctx.input.contactType === 'both') {
      let rawVendors = await client.queryVendors(nameFilter, undefined, ctx.input.maxResults);
      vendors = rawVendors.map((v: any) => ({
        vendorId: v.Id,
        displayName: v.DisplayName,
        companyName: v.CompanyName,
        email: v.PrimaryEmailAddr?.Address,
        phone: v.PrimaryPhone?.FreeFormNumber,
        balance: v.Balance
      }));
    }

    let total = (customers?.length ?? 0) + (vendors?.length ?? 0);

    return {
      output: {
        customers,
        vendors
      },
      message: `Found **${total}** contact(s) matching "${ctx.input.searchTerm}": ${customers?.length ?? 0} customer(s), ${vendors?.length ?? 0} vendor(s).`
    };
  })
  .build();
