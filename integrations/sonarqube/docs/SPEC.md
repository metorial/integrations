# SonarQube Integration Spec

## Scope

This package implements a read-first SonarQube Web API surface for SonarQube Server and SonarQube Cloud:

- Project discovery through `api/projects/search`
- Component lookup and tree browsing through `api/components`
- Branch and pull request analysis discovery through `api/project_branches` and `api/project_pull_requests`
- Metric discovery and measure reads through `api/metrics` and `api/measures`
- Quality gate status through `api/qualitygates/project_status`
- Issue search and changelog reads through `api/issues`
- Compute Engine task/status reads through `api/ce`

Mutating issue workflows, project lifecycle management, token administration, quality gate administration, and source-code export are out of scope for the initial package.

## Configuration

Config is one top-level object:

- `deployment`: `server` or `cloud`; defaults to `server`.
- `serverBaseUrl`: required for Server. The client normalizes it to `<serverBaseUrl>/api` and avoids duplicating `/api`.
- `cloudRegion`: `eu` or `us`; defaults to `eu`.
- `organization`: default SonarQube Cloud organization key for organization-scoped tools.
- `defaultProjectKey`: default project key for project-scoped tools.

Runtime validation throws `ServiceError` through `createApiServiceError` when required combinations are missing, such as Cloud project search without an organization or project-scoped calls without `projectKey` or `defaultProjectKey`.

## Authentication

The integration uses token auth only. Tokens are sent as bearer tokens against Web API v1 endpoints. `getProfile` verifies `/api/authentication/validate`; Server profiles additionally read `/api/server/version`. If response headers include `SonarQube-Authentication-Token-Expiration`, the value is captured on the profile as `tokenExpiresAt`.

System passcode auth is deferred because it is primarily for endpoints such as monitoring/metrics rather than the read-first quality workflow surface.

## Client Behavior

The client uses `createAuthenticatedAxios`, `requestAxios`, and `requestAxiosData` from `slates`. API failures are normalized with `buildApiServiceError`, including Sonar `errors[].msg`, `msg`, and `message` fields. Cloud 429 responses include rate-limit retry context in the error message.

Base URLs:

- Server v1: normalized `<serverBaseUrl>/api`
- Cloud v1 EU: `https://sonarcloud.io/api`
- Cloud v1 US: `https://sonarqube.us/api`
- Cloud v2 helpers are present but unused by public tools until a specific v2 migration is implemented.

Arrays are serialized as comma-separated query parameters, matching Sonar Web API v1 conventions. Page sizes are capped to documented endpoint limits.

## Tool Contracts

All tool input schemas are top-level `z.object` schemas to remain MCP/OpenAI tool bridge compatible. Conditional requirements are described in field descriptions and enforced at runtime with `ServiceError`.

Outputs expose normalized fields for agent workflows and include `raw` objects for Sonar-specific fields that are not normalized yet. No tool returns file contents, base64 blobs, or destructive mutation outputs.

## Verification

Package tests cover config/base URL validation, query parameter serialization, pagination caps, Cloud organization checks, project-key fallback, quality gate identifier validation, authentication response validation, and Sonar error normalization.

Schema regression coverage uses `describeMcpCompatibleToolSchemas('SonarQube tool input schemas', provider.actions)`.

Private live E2E coverage lives in `tests/integrations/sonarqube/tools.e2e.ts`. It can discover a readable project from the profile, or use optional fixtures for `projectKey`, `metricKeys`, `branch`, `pullRequest`, `issueKey`, and `ceTaskId`.
