# <img src="https://provider-logos.metorial-cdn.com/gitlab.svg" height="20"> Gitlab Ci

Manage CI/CD pipelines, jobs, runners, environments, variables, schedules, and artifacts within GitLab projects. Create, list, retry, cancel, and delete pipelines. View and control individual jobs, download job artifacts and logs. Configure pipeline triggers and scheduled pipelines with cron syntax. Manage CI/CD variables at project, group, or instance level. Track deployments to environments such as staging and production. Register, update, and manage CI/CD runners. Validate .gitlab-ci.yml configuration files. Retrieve test reports and summaries. Listen for webhook events on pipeline status changes, job status changes, deployments, push events, tag events, merge requests, releases, feature flags, and vulnerability notifications.

## Tools

### Delete Pipeline

Permanently delete a pipeline and all of its associated resources (jobs, artifacts, logs). This action is irreversible.

### Get Pipeline

Retrieve detailed information about a specific pipeline, including status, duration, coverage, source, and associated user. Also optionally fetches test report summary.

### Get Test Report

Retrieve the unit test report for a pipeline, including total counts, success/failure breakdowns, test suites, and individual test case details. Use "summary" mode for a quick overview or "full" mode for detailed test case information.

### Lint CI Config

Validate a \

### List Deployments

List deployments for a project, optionally filtered by environment or status. Returns deployment details including the associated commit, environment, and timing information.

### List Jobs

List CI/CD jobs for a specific pipeline or across a project. Filter by job scope (status). Returns job name, stage, status, duration, and associated pipeline.

### List Pipelines

List CI/CD pipelines for a project. Filter by status, branch/tag ref, SHA, source, or pipeline name. Results are returned in reverse chronological order.

### Manage Environments

List, create, update, stop, or delete deployment environments for a project. Environments represent targets like staging or production. Supports filtering by name, search term, and state.

### Manage Job

Perform actions on a CI/CD job: get details, retry a failed job, cancel a running job, play a manual job, erase job artifacts/logs, or retrieve the job log output.

### Manage Runners

List, view, update, pause/resume, or delete CI/CD runners. Runners can be listed for a specific project or across all accessible runners. Update runner configuration including tags, description, and access level.

### Manage Pipeline Schedules

Create, list, update, or delete scheduled pipelines that run at recurring intervals using cron syntax. Schedule variables can be added, updated, or removed as part of schedule management.

### Manage Pipeline Triggers

Create, list, update, or delete pipeline trigger tokens. Trigger tokens allow external services to run pipelines via the trigger API. Can also fire a pipeline using a trigger token with custom variables.

### Manage CI/CD Variables

List, create, update, or delete CI/CD variables at the project or group level. Variables can be scoped to environments, marked as protected (limited to protected branches/tags), or masked in logs.

### Run Pipeline

Create and run a new pipeline on a specified branch or tag. Optionally pass CI/CD variables for the pipeline run. Can also retry or cancel an existing pipeline.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
