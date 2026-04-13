import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listUsers = SlateTool.create(spec, {
  name: 'List Users',
  key: 'list_users',
  description: `Retrieve all users (teammates) in your Apollo organization. Returns user IDs, names, and emails. User IDs are needed for assigning ownership on contacts, accounts, deals, and tasks.`,
  constraints: ['Requires a master API key'],
  tags: {
    readOnly: true
  }
})
  .input(z.object({}))
  .output(
    z.object({
      users: z.array(
        z.object({
          userId: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          imageUrl: z.string().optional(),
          teamId: z.string().optional()
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.listUsers();

    let users = result.users.map(u => ({
      userId: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      imageUrl: u.image_url,
      teamId: u.team_id
    }));

    return {
      output: { users },
      message: `Found **${users.length}** user(s) in the organization.`
    };
  })
  .build();

export let listStages = SlateTool.create(spec, {
  name: 'List Stages',
  key: 'list_stages',
  description: `Retrieve available stages for contacts, accounts, and deals. Stage IDs are needed when creating or updating records. Returns all stage types in a single call.`,
  constraints: ['Requires a master API key for some stage types'],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      stageType: z.enum(['contact', 'account', 'deal']).describe('Type of stages to retrieve')
    })
  )
  .output(
    z.object({
      stages: z.array(
        z.object({
          stageId: z.string(),
          name: z.string(),
          order: z.number().optional()
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let stages: Array<{ stageId: string; name: string; order?: number }> = [];

    if (ctx.input.stageType === 'contact') {
      let result = await client.listContactStages();
      stages = result.contactStages.map((s, i) => ({
        stageId: s.id,
        name: s.name,
        order: s.order ?? i
      }));
    } else if (ctx.input.stageType === 'account') {
      let result = await client.listAccountStages();
      stages = result.accountStages.map((s, i) => ({
        stageId: s.id,
        name: s.name,
        order: s.order ?? i
      }));
    } else if (ctx.input.stageType === 'deal') {
      let result = await client.listDealStages();
      stages = result.dealStages.map((s, i) => ({
        stageId: s.id,
        name: s.name,
        order: s.order ?? i
      }));
    }

    return {
      output: { stages },
      message: `Found **${stages.length}** ${ctx.input.stageType} stage(s): ${stages.map(s => s.name).join(', ')}.`
    };
  })
  .build();
