import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageFirewallRulesTool = SlateTool.create(spec, {
  name: 'Manage Firewall Rules',
  key: 'manage_firewall_rules',
  description: `List, create, or delete firewall rules and IP access rules for a zone. Firewall rules use Cloudflare's expression language to match requests and apply actions like block, challenge, or allow.`,
  instructions: [
    'Firewall expressions use Cloudflare wirefilter syntax, e.g. `ip.src == 1.2.3.4` or `http.request.uri.path contains "/admin"`.',
    'Available actions: block, challenge, js_challenge, managed_challenge, allow, log, bypass.',
    'For IP access rules, use ipAction with mode and target IP/range.'
  ],
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      action: z
        .enum([
          'list',
          'create',
          'delete',
          'list_ip_rules',
          'create_ip_rule',
          'delete_ip_rule'
        ])
        .describe('Operation to perform'),
      zoneId: z.string().describe('Zone ID'),
      ruleId: z.string().optional().describe('Rule ID for delete operations'),
      expression: z.string().optional().describe('Firewall expression for matching requests'),
      firewallAction: z
        .string()
        .optional()
        .describe(
          'Action to take (block, challenge, js_challenge, managed_challenge, allow, log, bypass)'
        ),
      description: z.string().optional().describe('Description of the rule'),
      paused: z.boolean().optional().describe('Whether the rule is paused'),
      ipMode: z
        .string()
        .optional()
        .describe('IP access rule mode (block, challenge, whitelist, js_challenge)'),
      ipTarget: z
        .string()
        .optional()
        .describe('IP access rule target type (ip, ip_range, asn, country)'),
      ipValue: z
        .string()
        .optional()
        .describe('IP access rule value (IP address, CIDR range, ASN, or country code)'),
      notes: z.string().optional().describe('Notes for IP access rule')
    })
  )
  .output(
    z.object({
      rules: z
        .array(
          z.object({
            ruleId: z.string(),
            expression: z.string().optional(),
            action: z.string().optional(),
            description: z.string().optional(),
            paused: z.boolean().optional()
          })
        )
        .optional(),
      createdRule: z
        .object({
          ruleId: z.string(),
          action: z.string().optional()
        })
        .optional(),
      deleted: z.boolean().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client(ctx.auth);
    let { action, zoneId } = ctx.input;

    if (action === 'list') {
      let response = await client.listFirewallRules(zoneId);
      let rules = response.result.map((r: any) => ({
        ruleId: r.id,
        expression: r.filter?.expression,
        action: r.action,
        description: r.description,
        paused: r.paused
      }));
      return {
        output: { rules },
        message: `Found **${rules.length}** firewall rule(s).`
      };
    }

    if (action === 'create') {
      if (!ctx.input.expression || !ctx.input.firewallAction) {
        throw new Error('expression and firewallAction are required');
      }
      let response = await client.createFirewallRules(zoneId, [
        {
          filter: { expression: ctx.input.expression },
          action: ctx.input.firewallAction,
          description: ctx.input.description,
          paused: ctx.input.paused
        }
      ]);
      let created = response.result[0];
      return {
        output: { createdRule: { ruleId: created.id, action: created.action } },
        message: `Created firewall rule with action **${created.action}**.`
      };
    }

    if (action === 'delete') {
      if (!ctx.input.ruleId) throw new Error('ruleId is required for delete');
      await client.deleteFirewallRule(zoneId, ctx.input.ruleId);
      return {
        output: { deleted: true },
        message: `Deleted firewall rule \`${ctx.input.ruleId}\`.`
      };
    }

    if (action === 'list_ip_rules') {
      let response = await client.listIpAccessRules(zoneId);
      let rules = response.result.map((r: any) => ({
        ruleId: r.id,
        action: r.mode,
        description: `${r.configuration?.target}: ${r.configuration?.value}`,
        paused: false
      }));
      return {
        output: { rules },
        message: `Found **${rules.length}** IP access rule(s).`
      };
    }

    if (action === 'create_ip_rule') {
      if (!ctx.input.ipMode || !ctx.input.ipTarget || !ctx.input.ipValue) {
        throw new Error('ipMode, ipTarget, and ipValue are required');
      }
      let response = await client.createIpAccessRule(zoneId, {
        mode: ctx.input.ipMode,
        configuration: { target: ctx.input.ipTarget, value: ctx.input.ipValue },
        notes: ctx.input.notes
      });
      return {
        output: { createdRule: { ruleId: response.result.id, action: response.result.mode } },
        message: `Created IP access rule: **${ctx.input.ipMode}** ${ctx.input.ipValue}.`
      };
    }

    if (action === 'delete_ip_rule') {
      if (!ctx.input.ruleId) throw new Error('ruleId is required for delete');
      await client.deleteIpAccessRule(zoneId, ctx.input.ruleId);
      return {
        output: { deleted: true },
        message: `Deleted IP access rule \`${ctx.input.ruleId}\`.`
      };
    }

    throw new Error(`Unknown action: ${action}`);
  })
  .build();
