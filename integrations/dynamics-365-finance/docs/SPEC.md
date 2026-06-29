# Slates Specification for Dynamics 365 Finance

## Overview

Microsoft Dynamics 365 Finance is an ERP product for accounting, treasury, tax, budgeting, and financial operations. This Slates package targets Finance and Operations `/data` OData endpoints and Data Management package actions through `@slates/dynamics-finops-recipes`.

The initial package implements:

- legal entities
- chart of accounts
- general ledger entries
- journals
- draft journal record creation
- customers
- vendors
- vendor invoices
- Data Management export/import/status workflows

## Authentication

Authentication uses Microsoft Entra ID:

- Authorization endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize`
- Token endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- Delegated F&O scope: `{environmentUrl}/user_impersonation`
- Refresh scope: `offline_access`
- Client credentials scope: `{environmentUrl}/.default`

The OAuth input asks for the F&O environment URL so the integration can request an audience-specific token. Client credentials are supported for server-to-server deployments that have been granted the required application permissions.

## Configuration

- `baseUrl` / `environmentUrl`: Finance and Operations environment URL. Auth output can also provide this value.
- `defaultLegalEntity`: default company / `dataAreaId` for company-scoped list tools.
- `defaultPageSize`: default page size for list tools.
- `defaultMaxPages`: maximum page count for bounded pagination.

## OData Behavior

List tools call recipe-backed bounded pagination with `$select`, `$filter`, `$orderby`, `$expand`, `$skip`, `$top`, `$count`, `cross-company`, and legal-entity filtering. Tools expose a stable summarized record shape plus the raw OData record for custom fields. Each tool provides a default public collection name and accepts `entitySetName` when a tenant uses a different public data entity name.

## Implemented Tools

- `list_legal_entities`
- `list_chart_of_accounts`
- `list_ledger_entries`
- `list_journals`
- `create_journal_draft_record`
- `list_customers`
- `get_customer`
- `list_vendors`
- `get_vendor`
- `list_vendor_invoices`
- `run_data_management_package_operation`

## Error Handling

Validation and upstream failures are normalized to `ServiceError` through shared helpers and the F&O recipe package. Tool schemas are top-level `z.object` values. Data Management branching uses an enum `action` field and runtime validation.

## File Outputs

This package does not download Data Management package bytes. Export/import tools return execution identifiers, status values, and package/status URLs only. Any future package download tool must return file bytes through Slate attachments rather than JSON output fields.

## Deferred Scope

Posting journals, payment proposal execution, vendor invoice posting, settlement, deletion, and irreversible corrections are deferred until live sandbox E2E fixtures and cleanup policy exist.

## Primary References

- F&O OData: https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/odata
- F&O Data Management API: https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/data-management-api
- Microsoft identity platform OAuth: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
