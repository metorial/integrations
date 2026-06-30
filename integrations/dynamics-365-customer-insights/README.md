# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Customer Insights

Read Dynamics 365 Customer Insights records through Microsoft Dataverse. The initial surface covers table metadata discovery, customer profiles, alternate keys, segments, measures, activities, enrichments, predictions, segment memberships, and segment-member exports as Slate text attachments.

## Authentication

Dynamics 365 Customer Insights uses Microsoft Entra ID OAuth 2.0 or client credentials against a Dataverse environment. OAuth can discover the first accessible Dataverse environment or use a configured instance URL. Client credentials require an application user with the needed Dataverse security roles.

## Configuration

- `instanceUrl`: optional Dataverse environment URL. Auth output is used when omitted.
- `apiVersion`: optional Dataverse Web API version. Defaults to `v9.2`.

## Tools

### List Customer Insights Tables

Discover Customer Insights Dataverse table metadata, entity set names, primary columns, and optional readable attributes.

### List Customer Insights Records

List customer profiles, alternate keys, segments, measures, activities, enrichments, predictions, and segment memberships with Dataverse OData query options. Use `top` for a single limited page, or `pageSize` with returned `nextLink` values for Dataverse paging.

### Get Customer Insights Record

Retrieve one Customer Insights record by GUID.

### Export Segment Members

Export rows from the Customer Insights segment membership Dataverse table as CSV or JSON through a Slate attachment. The documented table filters segment names through `msdynci_segments`; tenant-specific segment lookup IDs require an explicit lookup column. Member rows are not returned inline in JSON output.

## Notes

Customer Insights table names can vary by environment and installed capabilities. Use table discovery to confirm entity-set names and readable columns, then pass entity-set overrides for tenant-specific Dataverse names when needed.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
