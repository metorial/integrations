import { SlateTool } from 'slates';
import { ZoomClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageMeetingRegistrants = SlateTool.create(spec, {
  name: 'Manage Meeting Registrants',
  key: 'manage_meeting_registrants',
  description: `List existing registrants or add a new registrant to a Zoom meeting. When adding a registrant, provide their email and name. When listing, supports filtering by status and pagination.`,
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      meetingId: z.union([z.string(), z.number()]).describe('The meeting ID'),
      action: z
        .enum(['list', 'add'])
        .describe('Action to perform: list registrants or add a new one'),
      registrant: z
        .object({
          email: z.string().describe('Registrant email address'),
          firstName: z.string().describe('Registrant first name'),
          lastName: z.string().optional().describe('Registrant last name'),
          address: z.string().optional().describe('Address'),
          city: z.string().optional().describe('City'),
          state: z.string().optional().describe('State'),
          zip: z.string().optional().describe('Zip code'),
          country: z.string().optional().describe('Country'),
          phone: z.string().optional().describe('Phone number'),
          industry: z.string().optional().describe('Industry'),
          org: z.string().optional().describe('Organization'),
          jobTitle: z.string().optional().describe('Job title'),
          comments: z.string().optional().describe('Comments')
        })
        .optional()
        .describe('Registrant details (required when action is "add")'),
      status: z
        .enum(['approved', 'pending', 'denied'])
        .optional()
        .describe('Filter by registration status (for listing)'),
      pageSize: z.number().optional().describe('Number of records per page'),
      nextPageToken: z.string().optional().describe('Pagination token')
    })
  )
  .output(
    z.object({
      registrantId: z.string().optional().describe('New registrant ID (when adding)'),
      registrantUrl: z
        .string()
        .optional()
        .describe('Unique join URL for the registrant (when adding)'),
      totalRecords: z
        .number()
        .optional()
        .describe('Total number of registrants (when listing)'),
      nextPageToken: z.string().optional().describe('Token for next page (when listing)'),
      registrants: z
        .array(
          z.object({
            odataRegistrantId: z.string().optional().describe('Registrant ID'),
            email: z.string().describe('Email'),
            firstName: z.string().describe('First name'),
            lastName: z.string().optional().describe('Last name'),
            status: z.string().optional().describe('Registration status'),
            createTime: z.string().optional().describe('Registration time')
          })
        )
        .optional()
        .describe('List of registrants (when listing)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ZoomClient(ctx.auth.token);

    if (ctx.input.action === 'add') {
      if (!ctx.input.registrant) {
        throw new Error('Registrant details are required when adding a new registrant');
      }

      let result = await client.addMeetingRegistrant(ctx.input.meetingId, {
        email: ctx.input.registrant.email,
        first_name: ctx.input.registrant.firstName,
        last_name: ctx.input.registrant.lastName,
        address: ctx.input.registrant.address,
        city: ctx.input.registrant.city,
        state: ctx.input.registrant.state,
        zip: ctx.input.registrant.zip,
        country: ctx.input.registrant.country,
        phone: ctx.input.registrant.phone,
        industry: ctx.input.registrant.industry,
        org: ctx.input.registrant.org,
        job_title: ctx.input.registrant.jobTitle,
        comments: ctx.input.registrant.comments
      });

      return {
        output: {
          registrantId: result.registrant_id,
          registrantUrl: result.join_url
        },
        message: `Registrant **${ctx.input.registrant.email}** added to meeting **${ctx.input.meetingId}**.`
      };
    }

    // List registrants
    let result = await client.listMeetingRegistrants(ctx.input.meetingId, {
      status: ctx.input.status,
      pageSize: ctx.input.pageSize,
      nextPageToken: ctx.input.nextPageToken
    });

    let registrants = (result.registrants || []).map((r: any) => ({
      odataRegistrantId: r.id,
      email: r.email,
      firstName: r.first_name,
      lastName: r.last_name,
      status: r.status,
      createTime: r.create_time
    }));

    return {
      output: {
        totalRecords: result.total_records,
        nextPageToken: result.next_page_token || undefined,
        registrants
      },
      message: `Found **${registrants.length}** registrant(s) for meeting **${ctx.input.meetingId}**.`
    };
  })
  .build();
