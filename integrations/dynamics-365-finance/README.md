# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Finance

Read Microsoft Dynamics 365 Finance data through Finance and Operations OData and Data Management APIs. This first package focuses on practical finance workflows: legal entities, chart of accounts, ledger entries, journals, customers, vendors, vendor invoices, and Data Management package export/import status.

## Authentication

Dynamics 365 Finance uses Microsoft Entra ID OAuth 2.0 or client credentials against a Finance and Operations environment URL such as `https://contoso.operations.dynamics.com`. OAuth requests `user_impersonation` for the selected environment plus `offline_access` so Slates can refresh access tokens.

## Configuration

- `baseUrl` or `environmentUrl`: optional Finance and Operations environment URL. Required when it is not stored in the auth connection.
- `defaultLegalEntity`: optional default legal entity / `dataAreaId` for company-scoped list tools.
- `defaultPageSize`: optional default list page size. Defaults to the recipe page size.
- `defaultMaxPages`: optional maximum pages to fetch for list tools.

For company-scoped list tools, a supplied `legalEntity` / `dataAreaId` or configured
`defaultLegalEntity` is sent with `cross-company=true` by default so Finance and
Operations can return that company even when it is not the user's default company.

## Tools

- List legal entities
- List chart of accounts
- List ledger entries
- List journals
- Get journal
- Create journal draft record
- List customers
- Get customer
- List vendors
- Get vendor
- List vendor invoices
- Get vendor invoice
- Run Data Management package operation

## Notes

Posting, settlement, payment, deletion, and other irreversible accounting workflows are intentionally deferred. The initial write surface is limited to creating draft journal data entity records and starting documented Data Management import/export workflows. Data Management imports require `confirmImport=true` and default to staging with `execute=false`. F&O data entity public collection names can vary by version and customization, so each resource tool allows an `entitySetName` override. Data Management execution summary page URLs are not exposed because they are not part of Microsoft's documented package API surface.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
