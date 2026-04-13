# <img src="https://provider-logos.metorial-cdn.com/dbt-cloud.png" height="20"> Dbt Cloud

Manage dbt Cloud projects, environments, and data transformation jobs. Create, trigger, schedule, and monitor dbt job runs. Fetch run artifacts including manifest, run results, and catalog files. Query project metadata and lineage via the Discovery API for models, sources, tests, and execution results. Define and query business metrics and dimensions through the Semantic Layer. Manage users, permissions, service tokens, and webhook subscriptions for job run events. Configure repository connections and environment settings programmatically.

## Tools

### Cancel Run

Cancel a currently queued or in-progress dbt Cloud job run. The run must be in a cancellable state (Queued, Starting, or Running). Returns the updated run status.

### Get Account

Retrieve details about the configured dbt Cloud account. Returns account name, plan tier, run slots, developer seat count, and billing information. Useful for verifying the account configuration and available resources.

### Get Job

Retrieve detailed information about a specific dbt Cloud job, including its schedule, execution steps, settings, and run history metadata. Use this to inspect a job's full configuration before triggering or modifying it.

### Get Run Artifact

Fetch an artifact file from a completed dbt Cloud run. Supports retrieving \

### Get Run

Retrieve detailed information about a specific dbt Cloud job run. Returns status, timing, duration, git info, run steps, and execution details. Use this to monitor a triggered run or inspect a completed run's results.

### List Environments

List all environments for a given dbt Cloud project. Returns environment names, types, dbt versions, and configuration details. Useful for inspecting available deployment targets and their settings.

### List Jobs

List dbt Cloud jobs, optionally filtered by project or environment. Returns job names, schedules, settings, and execution configuration. Use this to discover available jobs that can be triggered or monitored.

### List Projects

List all projects in the dbt Cloud account. Returns project names, IDs, repository info, and connection details. Use this to discover available projects before performing operations on specific ones.

### List Runs

List dbt Cloud job runs with optional filters for job, project, environment, or status. Returns run IDs, statuses, timing, and duration. Useful for monitoring recent execution history and identifying failed or long-running jobs.

### List Users

List all users in the dbt Cloud account. Returns user names, email addresses, and license information. Useful for auditing account membership and permissions.

### Manage Webhook

Create, update, or delete a dbt Cloud webhook subscription. Webhooks notify external systems when job runs start, complete, or fail. Supports scoping to specific jobs and configuring which event types to listen for.

### Trigger Job Run

Trigger a new run for a dbt Cloud job. Supports overriding dbt version, threads, target name, timeout, doc generation, and execution steps. If the job is already running, the new run will be enqueued. Returns the created run's details including its ID for monitoring.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
