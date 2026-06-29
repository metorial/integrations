# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Customer Insights

Read Dynamics 365 Customer Insights records through Microsoft Dataverse. The initial surface covers customer profiles, segments, measures, activities, and segment-member exports as Slate text attachments.

## Authentication

Dynamics 365 Customer Insights uses Microsoft Entra ID OAuth 2.0 or client credentials against a Dataverse environment. OAuth can discover the first accessible Dataverse environment or use a configured instance URL. Client credentials require an application user with the needed Dataverse security roles.

## Configuration

- `instanceUrl`: optional Dataverse environment URL. Auth output is used when omitted.
- `apiVersion`: optional Dataverse Web API version. Defaults to `v9.2`.

## Tools

### List Customer Insights Records

List customer profiles, segments, measures, and activities with Dataverse OData query options.

### Get Customer Insights Record

Retrieve one Customer Insights record by GUID.

### Export Segment Members

Export rows from a segment-member Dataverse table as CSV or JSON through a Slate attachment. Member rows are not returned inline in JSON output.

## Notes

Customer Insights table names can vary by environment and installed capabilities. The tools provide conservative defaults and entity-set overrides for tenant-specific Dataverse names.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
