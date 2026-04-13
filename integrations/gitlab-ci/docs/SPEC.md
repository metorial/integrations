Now let me fetch the GitLab PAT scopes page to get the full list of scopes:# Slates Specification for GitLab CI

## Overview

GitLab CI is the continuous integration and delivery component of GitLab, an open-source DevOps platform. It provides a set of tools for software development, including version control, CI/CD pipelines, and project management. The CI/CD API allows programmatic management of pipelines, jobs, runners, environments, variables, schedules, and artifacts within GitLab projects.

## Authentication

GitLab CI supports multiple authentication methods through the broader GitLab API (v4):

### Personal Access Tokens (PAT)

You can use access tokens to authenticate with the API. Pass the token using the `PRIVATE-TOKEN` header (recommended) or other methods. Tokens can also be sent via the `private_token` query parameter or as a Bearer token in the `Authorization` header.

Example: `PRIVATE-TOKEN: <your_access_token>` or `Authorization: Bearer <your_access_token>`

PATs are created under User Settings > Personal access tokens. The scopes of the personal access token valid values are: `api`, `read_user`, `read_api`, `read_repository`, `write_repository`, `read_registry`, `write_registry`, `create_runner`, `manage_runner`, `k8s_proxy`, `sudo`, `admin_mode`, `ai_features`, `self_rotate`.

For CI/CD integration, the `api` scope provides full read/write access. Use `read_api` for read-only access.

Default expiration of 30 days is populated in the UI. The ability to create non-expiring personal access tokens was removed in GitLab 16.0.

### Project Access Tokens

Project access tokens are scoped to a project. Like personal access tokens, you can use them to authenticate with the GitLab API, GitLab repositories, and the GitLab registry. You can limit the scope and expiration date of project access tokens.

### Group Access Tokens

Group access tokens are scoped to a group. Like personal access tokens, you can use them to authenticate with the GitLab API, GitLab repositories, and the GitLab registry. You can limit the scope and expiration date of group access tokens.

### OAuth 2.0

You can use an OAuth 2.0 token to authenticate with the API by passing it in either the `access_token` parameter or the `Authorization` header.

GitLab supports the following authorization flows: Authorization code with PKCE (most secure), Authorization code (recommended for server-side apps), Implicit grant (deprecated), and Resource Owner Password Credentials (first-party only).

To set up OAuth 2.0:

1. Register an application via the `/user_settings/applications` page. During registration, by enabling proper scopes, you can limit the range of resources which the application can access. Upon creation, you obtain the application credentials: Application ID and Client Secret.
2. Authorization endpoint: `https://<gitlab-host>/oauth/authorize`
3. Token endpoint: `https://<gitlab-host>/oauth/token`
4. Access tokens expire after two hours. Integrations that use access tokens must generate new ones using the `refresh_token` attribute.
5. By default, the scope of the access token is `api`, which provides complete read/write access.

**Base URL:** All API requests go to `https://<gitlab-host>/api/v4/`. The root endpoint is the GitLab host name. The path must start with `/api/v4`. For GitLab.com, this is `https://gitlab.com/api/v4/`. Self-managed instances use their own domain.

## Features

### Pipeline Management

Create, list, view, retry, cancel, and delete CI/CD pipelines for a project. Use this API to interact with CI/CD pipelines. Pipelines can be filtered by status, ref, SHA, source, and name. You can retrieve detailed information about a specific pipeline including its status, duration, and coverage. Pipelines can be manually executed, with predefined or manually-specified variables.

### Job Management

List, view, retry, cancel, and erase individual jobs within pipelines. Jobs can be filtered by scope (e.g., pending, running, failed, success). You can download job artifacts, view job logs/traces, and play manual jobs. Bridge jobs (for triggering downstream/child pipelines) can also be listed.

### Pipeline Triggers

Triggers provide a way to interact with the GitLab CI. Using a trigger a user or an application can run a new build/job for a specific commit. You can create and manage pipeline trigger tokens, and use them to trigger pipelines on specific branches or tags with custom variables. Options include: a pipeline trigger token to trigger a branch or tag pipeline, a CI/CD job token to trigger a multi-project pipeline, or another token with API access to create a new pipeline.

### Pipeline Schedules

Create and manage scheduled pipelines that run at recurring intervals using cron syntax. Variables can be added to the schedule. These variables are available only when the scheduled pipeline runs, and not in any other pipeline run. Schedules are attached to a specific branch or tag.

### CI/CD Variables

CI/CD variables are a type of environment variable. You can use them to control the behavior of jobs and pipelines, store values you want to re-use, and avoid hard-coding values in your `.gitlab-ci.yml` file. Variables can be managed at the project, group, or instance level via the API. Variables support environment scoping, protection (limited to protected branches/tags), and masking.

### Environments and Deployments

Manage deployment environments (e.g., staging, production) for a project. You can list, create, update, stop, and delete environments. Track deployments to environments including their status, timing, and associated commits. Environments support tiers and auto-stop configurations.

### Runners

Register, list, view, update, and delete CI/CD runners. Runners can be shared (instance-level), group-level, or project-specific. You can pause/resume runners, view runner jobs, and manage runner tags.

### Artifacts

Download, browse, and delete job artifacts. Artifacts can be retrieved by job ID or by branch/tag and job name. Supports downloading individual artifact files or the complete artifact archive.

### Test Reports

This API route is part of the Unit test report feature. Retrieve test reports and test report summaries for a pipeline, including total counts, success/failure breakdowns, and timing information.

### CI Lint

Validate `.gitlab-ci.yml` configuration files through the API to check for syntax errors and configuration issues before committing.

## Events

GitLab supports webhooks at the project, group, and instance (system) level. Webhooks connect GitLab to your other tools and systems through real-time notifications. When important events happen in GitLab, webhooks send that information directly to your external applications.

Webhooks are configured per project or group under Settings > Webhooks. In Secret token, enter a token to validate requests. The secret token is sent with the webhook request in the `X-Gitlab-Token` HTTP header.

The following event categories are relevant to CI/CD:

### Pipeline Events

Triggered when a pipeline's status changes (e.g., pending, running, success, failed, canceled). You can set custom names for pipelines with `workflow:name`. If the pipeline has a name, that name is the value of `commit.name`. The payload includes pipeline details, project info, commit data, and a list of jobs with their statuses.

### Job Events

Triggered when individual CI/CD job statuses change (e.g., created, pending, running, success, failed). The payload includes job details such as name, stage, status, duration, runner info, and associated pipeline/project. The `retries_count` field is an integer that indicates if the job is a retry.

### Deployment Events

Deployment events are triggered when a deployment is created, updated, or completed. The `deployable_id` and `deployable_url` in the payload represent a CI/CD job that executed the deployment.

### Push Events

Push events are triggered when you push to the repository, which typically triggers CI/CD pipelines. Includes commit details, branch/ref information, and before/after SHAs.

### Tag Push Events

This hook is not executed if a single push includes changes for more than three tags by default. Triggered when tags are created or deleted, often used to trigger release pipelines.

### Merge Request Events

Triggered on merge request actions (open, close, merge, update, approve, unapprove). Useful for triggering merge request pipelines and tracking MR-related CI activity.

### Release Events

Triggered when a release is created or updated in a project. Includes release details such as tag, assets, and links.

### Feature Flag Events

Triggered when feature flags are toggled or modified, enabling deployment coordination workflows.

### Vulnerability Events

A vulnerability event is triggered when a vulnerability is created, a vulnerability's status is changed, or an issue is linked to a vulnerability.

### Access Token Expiry Events

Access token expiry events trigger before an access token expires. These events trigger one day, seven days, 30 days, and 60 days before the token expires.
