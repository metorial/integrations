# <img src="logo.svg" height="20"> SonarQube

Connect to SonarQube Server or SonarQube Cloud to inspect code quality data from the Web API. This integration searches projects, browses components, lists branches and pull request analyses, reads measures and measure history, searches issues, reads issue changelogs, checks quality gate status, and inspects Compute Engine analysis tasks.

## Authentication

Use bearer token auth with a SonarQube Server user token or SonarQube Cloud personal access token. The token is sent in the `Authorization: Bearer <token>` header.

For SonarQube Server, configure:

- `deployment`: `server`
- `serverBaseUrl`: the SonarQube Server root URL, for example `https://sonarqube.example.com`
- `defaultProjectKey`: optional default project key for project-scoped tools

For SonarQube Cloud, configure:

- `deployment`: `cloud`
- `cloudRegion`: `eu` for `sonarcloud.io` or `us` for `sonarqube.us`
- `organization`: default organization key for organization-scoped tools
- `defaultProjectKey`: optional default project key for project-scoped tools

Credential validation calls `/api/authentication/validate`. Server profiles also read `/api/server/version`. When SonarQube returns `SonarQube-Authentication-Token-Expiration`, the auth profile includes the token expiration timestamp.

## Tools

### Search Projects

Search accessible projects by query or project keys. SonarQube Cloud requires an organization through input or config.

### Get Component / List Component Tree

Read component metadata and browse child components for projects, directories, files, tests, branches, or pull requests.

### List Project Branches / List Project Pull Requests

List branch and pull request analysis records for a project.

### List Metrics / Get Project Measures / Search Measure History

Discover available metrics, read current measures, and inspect historical measures for project, branch, or pull request quality trends.

### Get Quality Gate Status

Read quality gate status by exactly one of `analysisId`, `projectId`, or `projectKey`. `projectKey` may default from config.

### Search Issues / Get Issue Changelog

Search issues by project, component, branch, pull request, resolution, status, severity, type, tags, and text query. Read changelog entries for a specific issue.

### Get Compute Task / Get Project Analysis Status

Inspect Compute Engine task details and current project analysis queue/status.

## Deferred Tools

OAuth, system passcode auth, user token administration, source-code/raw file export, issue mutation, project creation/deletion, project visibility updates, branch deletion, and quality gate administration are intentionally deferred. The first package focuses on safe read workflows.

SonarQube Cloud is migrating some capabilities to Web API v2. This package uses stable Web API v1 endpoints for the initial tool surface and keeps Cloud v2 base URL handling isolated in the client for future migration.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
