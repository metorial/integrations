import { SlateTool } from 'slates';
import { MeetClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let addMemberTool = SlateTool.create(spec, {
  name: 'Add Space Member',
  key: 'add_member',
  description: `Add a member to a Google Meet space. Members can join the meeting without knocking. Optionally assign a role like COHOST to give them organizer-level control.`,
  instructions: [
    'Uses the v2beta API endpoint for member management.',
    'Provide either the user resource name or email address to identify the member.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      spaceName: z.string().describe('Space resource name (e.g., "spaces/abc123")'),
      email: z.string().optional().describe('Email address of the user to add'),
      user: z.string().optional().describe('User resource name (e.g., "users/123456")'),
      role: z
        .enum(['COHOST'])
        .optional()
        .describe('Role to assign. COHOST gives the same abilities as the meeting organizer.')
    })
  )
  .output(
    z.object({
      memberName: z.string().describe('Resource name of the created member'),
      email: z.string().optional().describe('Email of the member'),
      role: z.string().optional().describe('Assigned role')
    })
  )
  .handleInvocation(async ctx => {
    let client = new MeetClient({ token: ctx.auth.token });

    let member = await client.createMember(ctx.input.spaceName, {
      email: ctx.input.email,
      user: ctx.input.user,
      role: ctx.input.role
    });

    return {
      output: {
        memberName: member.name || '',
        email: member.email,
        role: member.role
      },
      message: `Added member${ctx.input.email ? ` **${ctx.input.email}**` : ''} to space${ctx.input.role ? ` as **${ctx.input.role}**` : ''}.`
    };
  })
  .build();

export let listMembersTool = SlateTool.create(spec, {
  name: 'List Space Members',
  key: 'list_members',
  description: `List all members configured in a Google Meet space. Members are users who can join without knocking and may have special roles.`,
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .input(
    z.object({
      spaceName: z.string().describe('Space resource name (e.g., "spaces/abc123")'),
      pageSize: z.number().optional().describe('Maximum number of members to return'),
      pageToken: z
        .string()
        .optional()
        .describe('Page token from a previous response for pagination')
    })
  )
  .output(
    z.object({
      members: z.array(
        z.object({
          memberName: z.string().describe('Resource name of the member'),
          email: z.string().optional().describe('Email of the member'),
          user: z.string().optional().describe('User resource name'),
          role: z.string().optional().describe('Member role')
        })
      ),
      nextPageToken: z.string().optional().describe('Token for the next page of results')
    })
  )
  .handleInvocation(async ctx => {
    let client = new MeetClient({ token: ctx.auth.token });

    let result = await client.listMembers(
      ctx.input.spaceName,
      ctx.input.pageSize,
      ctx.input.pageToken
    );

    let members = result.members.map(m => ({
      memberName: m.name || '',
      email: m.email,
      user: m.user,
      role: m.role
    }));

    return {
      output: {
        members,
        nextPageToken: result.nextPageToken
      },
      message: `Found **${members.length}** member(s) in the space.${result.nextPageToken ? ' More results available.' : ''}`
    };
  })
  .build();

export let removeMemberTool = SlateTool.create(spec, {
  name: 'Remove Space Member',
  key: 'remove_member',
  description: `Remove a member from a Google Meet space. The user will need to knock to join future meetings in this space.`,
  tags: {
    destructive: true,
    readOnly: false
  }
})
  .input(
    z.object({
      memberName: z
        .string()
        .describe(
          'Full resource name of the member to remove (e.g., "spaces/abc123/members/def456")'
        )
    })
  )
  .output(
    z.object({
      memberName: z.string().describe('Resource name of the removed member')
    })
  )
  .handleInvocation(async ctx => {
    let client = new MeetClient({ token: ctx.auth.token });
    await client.deleteMember(ctx.input.memberName);

    return {
      output: {
        memberName: ctx.input.memberName
      },
      message: `Removed member **${ctx.input.memberName}** from the space.`
    };
  })
  .build();
