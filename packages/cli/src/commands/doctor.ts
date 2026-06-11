import {
  listWorkspaceIntegrations,
  type WorkspaceIntegrationSummary
} from '../lib/integration';
import {
  buildCheckContext,
  CHECKS,
  type CheckSpec,
  SEVERITY_ORDER,
  type Severity
} from './doctor-checks';

export interface DoctorOptions {
  check?: string;
  integration?: string;
  json?: boolean;
  all?: boolean;
  includeTestIntegrations?: boolean;
  noColor?: boolean;
  cwd?: string;
}

export interface DoctorCheckReport {
  name: string;
  severity: Severity;
  description: string;
  failures: Array<{ integration: string; detail: string }>;
}

export interface DoctorReport {
  auditedIntegrations: number;
  checks: DoctorCheckReport[];
  totalFailures: number;
  totalsBySeverity: Record<Severity, number>;
}

interface Finding {
  check: string;
  severity: Severity;
  integration: string;
  detail: string;
}

let PRINT_LIMIT = 10;
let SEVERITY_COLOR: Record<Severity, string> = {
  error: '31',
  warn: '33',
  info: '36'
};
let SEVERITY_BADGE: Record<Severity, string> = {
  error: 'ERR',
  warn: 'WRN',
  info: 'INF'
};

let collectFindings = async (
  integrations: WorkspaceIntegrationSummary[],
  activeChecks: CheckSpec[]
): Promise<Finding[]> => {
  let findings: Finding[] = [];
  await Promise.all(
    integrations.map(async integration => {
      let ctx = await buildCheckContext(integration);
      for (let check of activeChecks) {
        let result = await check.run(ctx);
        if (result?.failed) {
          findings.push({
            check: check.name,
            severity: check.severity,
            integration: integration.name,
            detail: result.detail
          });
        }
      }
    })
  );
  findings.sort((left, right) => {
    if (left.severity !== right.severity) {
      return SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];
    }
    if (left.check !== right.check) return left.check.localeCompare(right.check);
    return left.integration.localeCompare(right.integration);
  });
  return findings;
};

let tallyBySeverity = (findings: Finding[]) =>
  findings.reduce<Record<Severity, number>>(
    (acc, finding) => {
      acc[finding.severity]++;
      return acc;
    },
    { error: 0, warn: 0, info: 0 }
  );

let useColor = (opts: DoctorOptions) =>
  !opts.noColor && !opts.json && Boolean(process.stdout.isTTY);

let paint = (enabled: boolean, code: string, text: string) =>
  enabled ? `\x1b[${code}m${text}\x1b[0m` : text;

let formatBadge = (severity: Severity, hasFailures: boolean, color: boolean) => {
  if (!hasFailures) return paint(color, '32', ' ok');
  return paint(color, SEVERITY_COLOR[severity], SEVERITY_BADGE[severity]);
};

let renderPretty = (
  integrations: WorkspaceIntegrationSummary[],
  activeChecks: CheckSpec[],
  findings: Finding[],
  opts: DoctorOptions
) => {
  let color = useColor(opts);
  let drillDown = Boolean(opts.check || opts.integration);
  let lines: string[] = [
    '',
    `Slates Doctor - ${integrations.length} integration${integrations.length === 1 ? '' : 's'} audited`,
    ''
  ];

  let sortedChecks = [...activeChecks].sort(
    (left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
  );

  for (let check of sortedChecks) {
    let checkFindings = findings.filter(finding => finding.check === check.name);
    let badge = formatBadge(check.severity, checkFindings.length > 0, color);
    let count = checkFindings.length.toString().padStart(5);
    lines.push(`${badge}  ${check.name.padEnd(18)} ${count}  ${check.description}`);

    if (drillDown && checkFindings.length > 0) {
      let toShow = opts.all ? checkFindings : checkFindings.slice(0, PRINT_LIMIT);
      for (let finding of toShow) {
        lines.push(`       - ${finding.integration.padEnd(32)} ${finding.detail}`);
      }
      let remaining = checkFindings.length - toShow.length;
      if (remaining > 0) {
        lines.push(`       ... and ${remaining} more (pass --all to see all)`);
      }
    }
  }

  let totals = tallyBySeverity(findings);
  lines.push('');
  lines.push(
    `Total: ${findings.length} finding${findings.length === 1 ? '' : 's'} (${totals.error} error, ${totals.warn} warn, ${totals.info} info)`
  );

  if (!drillDown && findings.length > 0) {
    lines.push('');
    lines.push(
      'Pass --check=<name> to drill into a check, --integration=<name> to filter, --json for machine output.'
    );
  }

  console.log(lines.join('\n'));
};

export let runDoctor = async (opts: DoctorOptions = {}): Promise<DoctorReport | undefined> => {
  let integrations = await listWorkspaceIntegrations({ cwd: opts.cwd });
  if (integrations.length === 0) {
    throw new Error('No integrations directory was found in the current repository.');
  }

  let activeChecks = opts.check ? CHECKS.filter(check => check.name === opts.check) : CHECKS;
  if (opts.check && activeChecks.length === 0) {
    let known = CHECKS.map(check => check.name).join(', ');
    throw new Error(`Unknown check "${opts.check}". Known checks: ${known}.`);
  }

  let filteredIntegrations = integrations.filter(integration => {
    if (opts.integration && integration.name !== opts.integration) return false;
    if (
      !opts.includeTestIntegrations &&
      integration.relativeDir.startsWith('test-integrations/')
    ) {
      return false;
    }
    return true;
  });

  if (opts.integration && filteredIntegrations.length === 0) {
    throw new Error(`No integration named "${opts.integration}" was found.`);
  }

  let findings = await collectFindings(filteredIntegrations, activeChecks);

  if (opts.json) {
    return {
      auditedIntegrations: filteredIntegrations.length,
      checks: activeChecks.map(check => ({
        name: check.name,
        severity: check.severity,
        description: check.description,
        failures: findings
          .filter(finding => finding.check === check.name)
          .map(finding => ({
            integration: finding.integration,
            detail: finding.detail
          }))
      })),
      totalFailures: findings.length,
      totalsBySeverity: tallyBySeverity(findings)
    };
  }

  renderPretty(filteredIntegrations, activeChecks, findings, opts);
  return undefined;
};
