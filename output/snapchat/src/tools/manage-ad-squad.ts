import { SlateTool } from 'slates';
import { SnapchatClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let adSquadOutputSchema = z.object({
  adSquadId: z.string().describe('Unique ID of the ad squad'),
  campaignId: z.string().optional().describe('Parent campaign ID'),
  name: z.string().optional().describe('Ad squad name'),
  status: z.string().optional().describe('Ad squad status'),
  type: z.string().optional().describe('Ad squad type (SNAP_ADS, LENS, etc.)'),
  placementV2: z.any().optional().describe('Placement configuration'),
  billingEvent: z.string().optional().describe('Billing event type'),
  bidMicro: z.number().optional().describe('Bid amount in micro-currency'),
  dailyBudgetMicro: z.number().optional().describe('Daily budget in micro-currency'),
  lifetimeBudgetMicro: z.number().optional().describe('Lifetime budget in micro-currency'),
  startTime: z.string().optional().describe('Start time'),
  endTime: z.string().optional().describe('End time'),
  optimizationGoal: z.string().optional().describe('Optimization goal'),
  createdAt: z.string().optional().describe('Creation timestamp'),
  updatedAt: z.string().optional().describe('Last update timestamp')
});

export let manageAdSquad = SlateTool.create(
  spec,
  {
    name: 'Manage Ad Squad',
    key: 'manage_ad_squad',
    description: `Create or update a Snapchat ad squad (ad set) under a campaign. Ad squads define targeting, budget, bid, and schedule for a group of ads. To create, provide a **campaignId** and ad squad properties. To update, also provide an **adSquadId**.`,
    instructions: [
      'Budget and bid values are in micro-currency (1 USD = 1,000,000 micro-currency).',
      'Valid statuses: ACTIVE, PAUSED.',
      'For creation, campaignId, name, type, and billing_event are typically required.'
    ]
  }
)
  .input(z.object({
    campaignId: z.string().describe('Campaign ID this ad squad belongs to'),
    adSquadId: z.string().optional().describe('Ad squad ID to update (omit to create a new ad squad)'),
    name: z.string().optional().describe('Ad squad name'),
    status: z.enum(['ACTIVE', 'PAUSED']).optional().describe('Ad squad status'),
    type: z.string().optional().describe('Ad squad type (e.g., SNAP_ADS)'),
    billingEvent: z.string().optional().describe('Billing event (e.g., IMPRESSION, SWIPE)'),
    bidMicro: z.number().optional().describe('Bid amount in micro-currency'),
    dailyBudgetMicro: z.number().optional().describe('Daily budget in micro-currency'),
    lifetimeBudgetMicro: z.number().optional().describe('Lifetime budget in micro-currency'),
    startTime: z.string().optional().describe('Start time in ISO 8601 format'),
    endTime: z.string().optional().describe('End time in ISO 8601 format'),
    optimizationGoal: z.string().optional().describe('Optimization goal (e.g., IMPRESSIONS, SWIPES, APP_INSTALLS, CONVERSIONS)'),
    targeting: z.any().optional().describe('Targeting spec object with demographics, geos, interests, devices, etc.')
  }))
  .output(adSquadOutputSchema)
  .handleInvocation(async (ctx) => {
    let client = new SnapchatClient(ctx.auth.token);
    let { campaignId, adSquadId, ...fields } = ctx.input;

    let adSquadData: Record<string, any> = {};
    if (adSquadId) adSquadData.id = adSquadId;
    if (fields.name) adSquadData.name = fields.name;
    if (fields.status) adSquadData.status = fields.status;
    if (fields.type) adSquadData.type = fields.type;
    if (fields.billingEvent) adSquadData.billing_event = fields.billingEvent;
    if (fields.bidMicro !== undefined) adSquadData.bid_micro = fields.bidMicro;
    if (fields.dailyBudgetMicro !== undefined) adSquadData.daily_budget_micro = fields.dailyBudgetMicro;
    if (fields.lifetimeBudgetMicro !== undefined) adSquadData.lifetime_budget_micro = fields.lifetimeBudgetMicro;
    if (fields.startTime) adSquadData.start_time = fields.startTime;
    if (fields.endTime) adSquadData.end_time = fields.endTime;
    if (fields.optimizationGoal) adSquadData.optimization_goal = fields.optimizationGoal;
    if (fields.targeting) adSquadData.targeting = fields.targeting;

    let result: any;
    if (adSquadId) {
      result = await client.updateAdSquad(campaignId, adSquadData);
    } else {
      result = await client.createAdSquad(campaignId, adSquadData);
    }

    let output = {
      adSquadId: result.id,
      campaignId: result.campaign_id,
      name: result.name,
      status: result.status,
      type: result.type,
      placementV2: result.placement_v2,
      billingEvent: result.billing_event,
      bidMicro: result.bid_micro,
      dailyBudgetMicro: result.daily_budget_micro,
      lifetimeBudgetMicro: result.lifetime_budget_micro,
      startTime: result.start_time,
      endTime: result.end_time,
      optimizationGoal: result.optimization_goal,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };

    let action = adSquadId ? 'Updated' : 'Created';
    return {
      output,
      message: `${action} ad squad **${output.name}** (${output.adSquadId}).`
    };
  })
  .build();
