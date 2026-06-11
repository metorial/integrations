# @slates/cli

Reference CLI for the Metorial integrations workspace. Provides per-integration
and global commands for setup, auth, tool invocation, profile management, and
workspace-wide audits.

## Install

The CLI runs through Bun directly from the workspace:

```bash
bun packages/cli/src/cli.ts <command>
```

Or via the root-level alias:

```bash
bun run integrations:cli <command>
```

## Global commands

### `slates test`

Run vitest across every integration in the workspace.

```bash
bun run integrations:cli test
bun run integrations:cli test -- --reporter=verbose
```

Arguments after `--` are forwarded to vitest.

### `slates doctor`

Workspace-wide consistency audit. Walks every `integrations/<name>` folder and
reports gaps against the standards used in the canonical Google-family
integrations (`gmail`, `google-meet`, `youtube`, `google-analytics`).

```bash
bun run integrations:cli doctor
bun run integrations:cli doctor --check=raw-throws --all
bun run integrations:cli doctor --integration=linear
bun run integrations:cli doctor --json > doctor.json
```

#### Checks

| Check | Severity | What it catches |
|-------|----------|------------------|
| `raw-throws` | `error` | `throw new Error(...)` outside test files. Tags partial migrations where `src/lib/errors.ts` already exists. |
| `scope-file` | `error` | Integration has `src/auth.ts` containing OAuth logic but no `src/scopes.ts`. |
| `vitest-config` | `error` | Test files present but no `vitest.config.ts`. |
| `contract-tests` | `warn` | `src/auth.ts` present but no `*.contract.test.ts`. |
| `zod-describe` | `warn` | Top-level Zod field declarations without `.describe()`. Multi-line chains handled. |
| `readme` | `info` | Integration has no `README.md`. |

Severity bucketing:

- `error` — breaks `@lowerdeck/error` tagging, runtime behavior, or test discovery.
- `warn` — degrades AI tool-calling quality, test coverage, or platform integration.
- `info` — best-practice gap, usually documentation or metadata.

#### Flags

| Flag | Effect |
|------|--------|
| `--check=<name>` | Run only the named check. Drills into the per-integration breakdown. |
| `--integration=<name>` | Limit the audit to a single integration directory. |
| `--all` | Show every failing integration (default: top 10 per check). |
| `--json` | Emit a machine-readable report instead of the pretty table. |
| `--no-color` | Disable ANSI color in pretty output (default: auto-detected from TTY). |
| `--include-test-integrations` | Include `test-integrations/` in the audit. |

#### Example output

```
Slates Doctor - 1121 integrations audited

ERR  raw-throws           584  src/ has raw `throw new Error(...)` - use lib/errors.ts helpers
ERR  scope-file           251  OAuth integration without src/scopes.ts
 ok  vitest-config          0  test files present but no vitest.config.ts
WRN  contract-tests      1092  src/auth.ts present but no *.contract.test.ts
WRN  zod-describe        1119  Zod field declarations without .describe()
 ok  readme                 0  integration is missing a README.md

Total: 3046 findings (835 error, 2211 warn, 0 info)
```

#### JSON shape

```jsonc
{
  "auditedIntegrations": 1121,
  "totalFailures": 3176,
  "totalsBySeverity": { "error": 630, "warn": 1296, "info": 1230 },
  "checks": [
    {
      "name": "raw-throws",
      "severity": "error",
      "description": "src/ has raw `throw new Error(...)` - use lib/errors.ts helpers",
      "failures": [
        { "integration": "optimizely", "detail": "69 raw throws (no lib/errors.ts)" }
      ]
    }
  ]
}
```

#### Relationship to `scripts/validate-pr-integrations.ts`

`validate-pr-integrations.ts` validates **schema diffs for paths changed in a
PR** by building both base and head, capturing snapshots, and comparing
provider / tool / auth-method schemas. It is the per-PR safety gate.

`slates doctor` complements it by auditing **code-shape consistency across the
whole workspace** without any build step. Use both: doctor for periodic health
snapshots and standards tracking, `validate-pr-integrations` for per-PR
behavioral safety.

## Per-integration commands

Invoked as `slates <integration> <command>`, where `<integration>` is the name
of a directory under `integrations/` or `test-integrations/`.

- `slates <integration> setup` — interactive integration setup
- `slates <integration> profiles {add,list,get,use,remove}` — profile management
- `slates <integration> tools {list,get,schema,call}` — invoke tools
- `slates <integration> auth {list,get,setup,refresh,credentials}` — manage auth state
- `slates <integration> config {get,set,schema}` — manage runtime config
- `slates <integration> test` — run vitest against this integration with a profile context
- `slates <integration> repl` — open an interactive REPL with the loaded provider

Run `bun run integrations:cli <integration> --help` for the full per-command
flag list.
