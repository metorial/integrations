# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Sales

Manage Dynamics 365 Sales records through Microsoft Dataverse. The initial surface covers accounts, contacts, leads, opportunities, tasks, phone calls, appointments, emails, quotes, and orders, plus typed workflows for lead qualification and closing opportunities as won or lost.

## Authentication

Dynamics 365 Sales uses Microsoft Entra ID OAuth 2.0 or client credentials against a Dataverse environment. OAuth can discover the first accessible Dataverse environment or use a configured instance URL. Client credentials require an application user with the needed Dataverse security roles.

## Configuration

- `instanceUrl`: optional Dataverse environment URL. Auth output is used when omitted.
- `apiVersion`: optional Dataverse Web API version. Defaults to `v9.2`.

## Tools

### List Sales Records

List sales records with OData filters, ordering, column selection, expansion, count, page size, and next-link pagination.

### Get Sales Record

Retrieve one sales record by GUID with optional column selection and relationship expansion.

### Create Sales Record

Create a sales record for supported Sales table types, including custom columns through `recordData`.

### Update Sales Record

Patch a supported Sales record by GUID and return the updated representation by default.

### Qualify Lead

Invoke the Dataverse `QualifyLead` action with typed create-account/contact/opportunity controls and optional additional action parameters.

### Close Opportunity

Invoke `WinOpportunity` or `LoseOpportunity` with a typed opportunity close payload and required status reason.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
