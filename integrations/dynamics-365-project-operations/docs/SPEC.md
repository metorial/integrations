# Slates Specification for Dynamics 365 Project Operations

## Overview

Dynamics 365 Project Operations combines project sales, planning, resourcing, time and expense capture, delivery tracking, actuals, invoicing, and finance integration. This package is a product-focused adapter over shared Microsoft Dataverse and Dynamics 365 Finance and Operations recipe packages.

Dataverse is the source of truth for project operational data in this integration. Finance and Operations access is limited to Data Management handoff workflows for package export/import execution and status tracking.

## Authentication

The integration supports Microsoft Entra OAuth and client credentials.

- Dataverse tools require a Dataverse token and environment URL. OAuth can discover the first accessible Dataverse environment when `dataverseInstanceUrl` is omitted.
- Finance handoff tools require a Finance and Operations environment URL during authentication so a resource-specific token can be issued.
- OAuth stores refresh tokens when Microsoft returns them and refreshes both Dataverse and Finance and Operations tokens when configured.

## Dataverse Tool Model

The Dataverse tools use Project Operations table defaults and allow `entitySetName` overrides. Inputs remain one top-level JSON object. Branching uses an `action` enum and runtime validation with `ServiceError`.

Supported Dataverse resources:

- Projects: default entity set `msdyn_projects`
- Project tasks: default entity set `msdyn_projecttasks`
- Resource assignments: default entity set `msdyn_resourceassignments`
- Time entries: default entity set `msdyn_timeentries`
- Expenses: default entity set `msdyn_expenses`
- Project contracts: default entity set `salesorders`
- Project actuals: default entity set `msdyn_actuals`
- Project invoices: default entity set `invoices`

Write actions are limited to `create_draft` and `update_draft` on projects, tasks, assignments, time entries, and expenses. Contracts, actuals, and invoices are read-only.

## Finance Handoff

`manage_finance_handoff` delegates Finance and Operations Data Management behavior to `@slates/dynamics-finops-recipes`.

Supported actions:

- `export_to_package`
- `import_from_package`
- `get_execution_summary_status`
- `get_execution_summary_page_url`
- `get_exported_package_url`
- `get_import_staging_error_file_url`

Import defaults to `execute: false` and requires `confirmImport: true`.

## Deferred Work

- Live E2E coverage is deferred until a Project Operations sandbox and Finance and Operations environment are available.
- Posting, approval, invoice confirmation, and destructive delete workflows are intentionally deferred.
- Tenant-specific metadata validation can be added once representative Project Operations metadata is available.
