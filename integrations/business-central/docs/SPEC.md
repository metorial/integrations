# Slates Specification for Business Central

## Overview

Microsoft Dynamics 365 Business Central is a cloud ERP for finance, sales, purchasing, inventory, and operations workflows. This Slates integration targets the official Business Central API v2.0 at `https://api.businesscentral.dynamics.com/v2.0`.

The initial package implements read-only tools for company discovery and high-value ERP lookup workflows:

- companies
- customers and vendors
- sales and purchase invoices
- sales invoice PDF download
- items
- chart of accounts
- general ledger entries
- journals
- document attachment metadata

## Authentication

Authentication uses Microsoft Entra ID OAuth 2.0 authorization code flow.

- Authorization endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize`
- Token endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- Business Central delegated scope: `https://api.businesscentral.dynamics.com/Financials.ReadWrite.All`
- Refresh scope: `offline_access`
- Identity scopes: `openid`, `profile`, `email`

The OAuth input can optionally specify a tenant authority. When omitted, the integration uses `organizations`. The access token is decoded for stable profile metadata and tenant hints; API calls still use the explicit config/tool `tenantId` when provided.

## Configuration

- `tenantId`: optional Microsoft Entra tenant ID segment for Business Central API URLs.
- `environmentName`: optional Business Central environment name. Defaults to `production`.
- `companyId`: optional default company GUID for company-scoped tools.
- `defaultLimit`: optional default list page size. Defaults to 50 and is capped at 1000.

API base URL construction:

- Without tenant: `https://api.businesscentral.dynamics.com/v2.0/{environmentName}/api/v2.0`
- With tenant: `https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environmentName}/api/v2.0`

## OData Behavior

List tools support bounded `$top`/`$skip` pagination, `$select`, `$expand`, structured filters, and an advanced `odataFilter` string. Structured filters are joined with `and`. The raw upstream `@odata.nextLink` is preserved when returned, and `nextSkip` is derived from it when possible.

Company-scoped tools use explicit `companies({companyId})/...` paths. A tool-level `companyId` overrides configured `companyId`.

## Implemented Tools

- `list_companies`
- `list_customers`
- `get_customer`
- `list_vendors`
- `get_vendor`
- `list_sales_invoices`
- `get_sales_invoice`
- `get_sales_invoice_pdf`
- `list_purchase_invoices`
- `get_purchase_invoice`
- `list_items`
- `list_accounts`
- `list_general_ledger_entries`
- `list_journals`
- `list_document_attachments`

## Error Handling

Validation and upstream failures throw Slates `ServiceError` values through shared `createApiServiceError` and `buildApiServiceError` helpers. OData error envelopes preserve message, code, target, detail, and upstream status where available.

The client retries 408, 429, 503, transient network failures, and similar timeout/reset failures with bounded backoff. It honors `Retry-After` when present.

## File Outputs

`get_sales_invoice_pdf` returns file content only through a Slate attachment. JSON output is limited to metadata such as company id, invoice id, filename, MIME type, byte size, and attachment count.

## Deferred Scope

The research plan identifies P2 write workflows such as customer/vendor creation, invoice draft creation, and invoice posting. Those are intentionally deferred. Business Central posting and cancellation can be irreversible or create accounting audit artifacts, so write tools need tenant-specific sandbox fixtures, cleanup policy, and explicit confirmation semantics before exposure.

## Primary References

- API v2.0 overview: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/
- Connect apps/auth: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-develop-connect-apps
- Endpoint structure: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/webservices/api-endpoint-structure
- Filtering: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-connect-apps-filtering
- Operational limits: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/operational-limits-online
- Customers: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_customer
- Vendors: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_vendor
- Sales invoices: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_salesinvoice
- Purchase invoices: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_purchaseinvoice
- Items: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_item
- Accounts: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_account
- General ledger entries: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_generalledgerentry
- Journals: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/resources/dynamics_journal
