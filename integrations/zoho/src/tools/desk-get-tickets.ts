import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { ZohoDeskClient } from '../lib/client';
import type { Datacenter } from '../lib/urls';

export let deskGetTickets = SlateTool.create(spec, {
  name: 'Desk Get Tickets',
  key: 'desk_get_tickets',
  description: `List, search, or retrieve support tickets from Zoho Desk. Supports filtering by department, status, and keyword search. Can also list departments for reference.`,
  instructions: [
    'The orgId is required for all Zoho Desk operations.',
    'Provide ticketId to fetch a single ticket, or omit to list/search tickets.',
    'Use searchQuery for keyword-based search.',
    'Set includeDepartments to true to also return department list.'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      orgId: z.string().describe('Zoho Desk organization ID'),
      ticketId: z.string().optional().describe('Specific ticket ID to fetch'),
      searchQuery: z.string().optional().describe('Search keyword to find tickets'),
      departmentId: z.string().optional().describe('Filter by department ID'),
      status: z.string().optional().describe('Filter by ticket status'),
      from: z.number().optional().describe('Starting index for pagination (default 0)'),
      limit: z.number().optional().describe('Number of tickets to return (max 100)'),
      sortBy: z
        .string()
        .optional()
        .describe('Field to sort by (e.g., "modifiedTime", "createdTime")'),
      sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
      includeDepartments: z
        .boolean()
        .optional()
        .describe('Also return the list of departments')
    })
  )
  .output(
    z.object({
      tickets: z.array(z.record(z.string(), z.any())).describe('Support tickets'),
      departments: z
        .array(
          z.object({
            departmentId: z.string(),
            name: z.string()
          })
        )
        .optional()
        .describe('Departments (if includeDepartments is true)')
    })
  )
  .handleInvocation(async ctx => {
    let dc = (ctx.auth.datacenter || ctx.config.datacenter || 'us') as Datacenter;
    let client = new ZohoDeskClient({
      token: ctx.auth.token,
      datacenter: dc,
      orgId: ctx.input.orgId
    });

    if (ctx.input.ticketId) {
      let ticket = await client.getTicket(ctx.input.ticketId);
      return {
        output: { tickets: [ticket] },
        message: `Fetched ticket **#${ticket?.ticketNumber || ctx.input.ticketId}**.`
      };
    }

    let tickets: any[];
    if (ctx.input.searchQuery) {
      let result = await client.searchTickets({
        searchStr: ctx.input.searchQuery,
        departmentId: ctx.input.departmentId,
        from: ctx.input.from,
        limit: ctx.input.limit,
        statusType: ctx.input.status
      });
      tickets = result?.data || [];
    } else {
      let result = await client.listTickets({
        departmentId: ctx.input.departmentId,
        status: ctx.input.status,
        from: ctx.input.from,
        limit: ctx.input.limit,
        sortBy: ctx.input.sortBy,
        sortOrder: ctx.input.sortOrder
      });
      tickets = result?.data || result || [];
      if (!Array.isArray(tickets)) tickets = [];
    }

    let departments: any[] | undefined;
    if (ctx.input.includeDepartments) {
      let deptResult = await client.getDepartments();
      departments = (deptResult?.data || deptResult || []).map((d: any) => ({
        departmentId: d.id,
        name: d.name
      }));
    }

    return {
      output: { tickets, departments },
      message: `Retrieved **${tickets.length}** tickets${departments ? ` and **${departments.length}** departments` : ''}.`
    };
  })
  .build();
