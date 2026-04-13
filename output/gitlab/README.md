# <img src="https://provider-logos.metorial-cdn.com/gitlab.svg" height="20"> Gitlab

Manage Git repositories, issues, merge requests, and CI/CD pipelines. Create, list, update, delete, archive, fork, and transfer projects. Browse repository trees, read and write files, compare branches, and manage branches and tags. Create and manage issues with labels, milestones, assignees, and time tracking. Create, review, approve, and merge merge requests. Trigger, monitor, retry, and cancel CI/CD pipelines and jobs, download artifacts, and manage pipeline schedules and variables. Manage groups, subgroups, and memberships with role-based access control. Handle container and package registries (npm, Maven, PyPI, etc.). Create releases with notes and assets, manage deployments and environments. Create and edit wiki pages and snippets. Search across code, issues, merge requests, commits, and wiki content. Manage users, SSH keys, and access tokens. Receive webhooks for push events, merge requests, pipeline status changes, deployments, issues, comments, and more.

## Tools

### Add Comment
Add a comment (note) to an issue or merge request. Supports Markdown formatting. Can also list existing comments on an issue or merge request.

### Browse Repository
Browse a project's repository tree, read file contents, or compare branches. Use "tree" to list directory contents, "file" to read a specific file, or "compare" to view the diff between two refs (branches, tags, or SHAs).

### Create Release
Create a new release for a project, or list existing releases. Releases are associated with a Git tag and can include release notes and milestone associations.

### Get Pipeline Jobs
List all jobs in a CI/CD pipeline, or get details and logs for a specific job. Use this to inspect job statuses, view build logs, retry failed jobs, or cancel running jobs.

### Get Project
Retrieve detailed information about a specific GitLab project by its ID or URL-encoded path (e.g. "my-group/my-project").

### List Groups
List GitLab groups accessible to the authenticated user. Filter by search term or ownership.

### List Issues
List GitLab issues filtered by project, state, labels, milestone, assignee, author, or search term. Can list issues globally or within a specific project. Supports pagination.

### List Merge Requests
List GitLab merge requests, optionally scoped to a project. Filter by state, labels, source/target branch, author, assignee, or reviewer. Supports pagination.

### List Pipelines
List CI/CD pipelines for a project. Filter by status, ref (branch/tag), SHA, or source. Useful for monitoring build and deployment status.

### List Projects
List GitLab projects accessible to the authenticated user. Filter by search term, ownership, membership, visibility, and archived status. Supports pagination for large result sets.

### Manage Branch
List, create, or delete branches in a project repository. Use "list" to search existing branches, "create" to create a new branch from a ref, or "delete" to remove a branch.

### Manage Repository File
Create, update, or delete a file in a GitLab repository. Each operation creates a commit. Provide file content and a commit message. For binary files, use base64 encoding.

### Manage Issue
Create, update, close, reopen, or delete a GitLab issue. Supports setting title, description, labels, assignees, milestone, due date, weight, and confidentiality. Use **stateEvent** to close or reopen an existing issue.

### Manage Merge Request
Create, update, or merge a GitLab merge request. Create MRs with source/target branches, reviewers, and labels. Update MR properties, close/reopen, or accept and merge. Use **action** "merge" to accept and merge the MR.

### Manage Pipeline
Trigger, retry, or cancel a CI/CD pipeline. Use "create" to trigger a new pipeline on a given ref (branch/tag). Use "retry" or "cancel" to manage an existing pipeline by its ID. Optionally pass CI/CD variables when triggering.

### Manage Project
Create, update, fork, or delete a GitLab project. Use the **action** field to specify the operation. For creating, provide a name and optional settings. For updating, provide the project ID and fields to change. For forking, provide the source project ID.

### Search
Search across GitLab for projects, issues, merge requests, milestones, code (blobs), commits, wiki content, and users. Can search globally, within a group, or within a specific project.

## License

This integration is licensed under the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0.html).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
