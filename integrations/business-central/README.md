# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Business Central

Read Microsoft Dynamics 365 Business Central ERP data through the official API v2.0. This integration starts with a read-only surface for company discovery, customers, vendors, sales invoices, purchase invoices, sales invoice PDFs, items, chart of accounts, general ledger entries, journals, and document attachment metadata.

## Authentication

Business Central uses Microsoft Entra ID OAuth 2.0. Register an Entra web application with delegated Dynamics 365 Business Central permissions and request `https://api.businesscentral.dynamics.com/Financials.ReadWrite.All` plus `offline_access` so Slates can refresh access tokens.

The OAuth connection can target the `organizations`, `common`, or a specific tenant ID authority. API calls default to the `production` Business Central environment unless `environmentName` is configured or supplied on a tool call.

## Configuration

- `tenantId`: optional Microsoft Entra tenant ID used in Business Central API URLs.
- `environmentName`: optional default Business Central environment name. Defaults to `production`.
- `companyId`: optional default Business Central company GUID for company-scoped tools.
- `defaultLimit`: optional default page size for list tools. Defaults to 50.

## Tools

### List Companies

List Business Central companies accessible in the selected environment. Use the returned company `id` as `companyId` for company-scoped tools.

### List Customers

List customer master records by search text, update timestamp, blocked state, and OData filters.

### Get Customer

Retrieve one customer by Business Central customer GUID.

### List Vendors

List vendor master records by search text, update timestamp, blocked state, and OData filters.

### Get Vendor

Retrieve one vendor by Business Central vendor GUID.

### List Sales Invoices

List sales invoices by status, customer, invoice date, posting date, due date, update timestamp, and OData filters.

### Get Sales Invoice

Retrieve one sales invoice with optional navigation expansion for lines, customer, dimensions, PDF metadata, and attachments.

### Get Sales Invoice PDF

Download a sales invoice PDF through a Slate attachment. File bytes are not returned in JSON output.

### List Purchase Invoices

List purchase invoices by status, vendor, invoice date, posting date, due date, update timestamp, and OData filters.

### Get Purchase Invoice

Retrieve one purchase invoice with optional navigation expansion for lines, vendor, dimensions, and attachments.

### List Items

List items and catalog data by search text, category, type, update timestamp, and OData filters.

### List Accounts

List chart-of-accounts rows by account category, account type, number/name search, and OData filters.

### List General Ledger Entries

List posted general ledger entries by posting date range, account, document, and OData filters.

### List Journals

List journals by code/display name search, template display name, and OData filters.

### List Document Attachments

List document attachment metadata from supported parent records such as customers, vendors, items, invoices, and general ledger entries.

## Notes

Destructive workflows from the research plan, including customer/vendor creation, invoice drafts, posting, cancellation, and payment journal actions, are intentionally excluded from this first release. Business Central posting and correction workflows can create audit artifacts or irreversible accounting records, so they should be added only with tenant-specific live E2E setup and cleanup policy.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
