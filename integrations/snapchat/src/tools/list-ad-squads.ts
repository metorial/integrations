import { SlateTool } from 'slates';
import { SnapchatClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let adSquadSchema = z.object({
  adSquadId: z.string().describe('Unique ID of the ad squad'),
  campaignId: z.string().optional().describe('Parent campaign ID'),
  name: z.string().optional().describe('Ad squad name'),
  status: z.string().optional().describe('Ad squad status'),
  type: z.string().optional().describe('Ad squad type'),
  billingEvent: z.string().optional().describe('Billing event type'),
  bidMicro: z.number().optional().describe('Bid amount in micro-currency'),
  dailyBudgetMicro: z.number().optional().describe('Daily budget in micro-currency'),
  startTime: z.string().optional().describe('Start time'),
  endTime: z.string().optional().describe('End time'),
  optimizationGoal: z.string().optional().describe('Optimization goal'),
  createdAt: z.string().optional().describe('Creation timestamp'),
  updatedAt: z.string().optional().describe('Last update timestamp')
});

export let listAdSquads = SlateTool.create(spec, {
  name: 'List Ad Squads',
  key: 'list_ad_squads',
  description: `List all ad squads (ad sets) under a Snapchat campaign. Returns ad squad IDs, names, statuses, budgets, bids, and targeting details.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      campaignId: z.string().describe('Campaign ID to list ad squads for')
    })
  )
  .output(
    z.object({
      adSquads: z.array(adSquadSchema).describe('List of ad squads')
    })
  )
  .handleInvocation(async ctx => {
    let client = new SnapchatClient(ctx.auth.token);
    let results = await client.listAdSquads(ctx.input.campaignId);

    let adSquads = results.map((a: any) => ({
      adSquadId: a.id,
      campaignId: a.campaign_id,
      name: a.name,
      status: a.status,
      type: a.type,
      billingEvent: a.billing_event,
      bidMicro: a.bid_micro,
      dailyBudgetMicro: a.daily_budget_micro,
      startTime: a.start_time,
      endTime: a.end_time,
      optimizationGoal: a.optimization_goal,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }));

    return {
      output: { adSquads },
      message: `Found **${adSquads.length}** ad squad(s).`
    };
  })
  .build();
