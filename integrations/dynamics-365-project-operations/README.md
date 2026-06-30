# <img src="logo.svg" height="20"> Dynamics 365 Project Operations

Read and maintain Microsoft Dynamics 365 Project Operations data in Dataverse, including projects, tasks, resource assignments, time entries, expenses, project contracts, actuals, and invoices. Project scheduling changes use Microsoft Project schedule APIs and OperationSets. Finance handoff uses Dynamics 365 Finance and Operations Data Management recipes for package export/import status and related links.

## Authentication

Use Microsoft Entra OAuth or client credentials. OAuth can discover the first accessible Dataverse environment or use a configured Dataverse URL. Project schedule API actions require delegated OAuth for a user with a Microsoft Project license; Microsoft does not support application/client-credentials users for those actions. Finance handoff tools need a Finance and Operations URL during authentication so a Finance and Operations access token can be issued for that resource.

## Configuration

- `dataverseInstanceUrl`: optional Dataverse environment URL. Auth output is used when omitted.
- `dataverseApiVersion`: optional Dataverse Web API version. Defaults to `v9.2`.
- `finOpsBaseUrl`: optional Finance and Operations environment URL for finance handoff tools. Auth output is used when omitted.
- `defaultLegalEntity`: optional Finance and Operations legal entity / `dataAreaId` for finance handoff tools.
- `defaultPageSize`: optional default page size for list tools.

## Tools

### Manage Projects

List, get, create, and update draft project records in Dataverse. Create and update actions accept common project fields plus `additionalFields` for tenant-specific Project Operations columns.

### Manage Project Tasks

List and get project task records. Create, update, and delete project tasks with `manage_project_schedule` so Microsoft Project schedule APIs and OperationSets maintain the schedule engine state.

### Manage Resource Assignments

List and get resource assignment records for project work planning. Create assignments and update assignment contours with `manage_project_schedule` so Microsoft Project schedule APIs and OperationSets maintain the schedule engine state.

### Manage Time Entries

List, get, create, and update draft time entry records. Submit, approve, recall, and post workflows are intentionally not exposed in this initial package.

### Manage Expenses

List, get, create, and update draft project expense records. Submit, approve, invoice, and reimbursement posting workflows are intentionally not exposed.

### Manage Project Contracts

Read project contract records, typically backed by Dataverse sales order/project contract tables in Project Operations environments.

### Manage Project Actuals

Read project actual records for cost, billing, and revenue reconciliation. Actuals are read-only because they are system-generated accounting facts.

### Manage Project Invoices

Read project invoice records from Dataverse invoice tables. Invoice creation, confirmation, and posting are deferred to avoid irreversible finance side effects.

### Manage Project Schedule

Run Microsoft Project schedule APIs for scheduling entities such as project tasks, dependencies, resource assignments, buckets, team members, sprints, labels, and OperationSets. Scheduling mutations require delegated Work Only OAuth for a user with a Microsoft Project license; Microsoft does not support application/client-credentials users for these APIs.

### Manage Finance Handoff

Start and inspect Finance and Operations Data Management export/import package executions. Import is explicit and defaults to staging without execution.

## Limitations

Project Operations table availability, lookup navigation property names, and required fields vary by tenant, solution version, and customization. Dataverse read/write tools expose an `entitySetName` override and `additionalFields` escape hatch for environments whose metadata differs from the defaults. Schedule API actions require Project Operations scheduling privileges, delegated Work Only OAuth, and a Microsoft Project license.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
