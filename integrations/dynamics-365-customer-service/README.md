# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Customer Service

Manage Dynamics 365 Customer Service records through Microsoft Dataverse. The initial surface covers cases, queues, queue item routing workflows, knowledge articles, notes, attachments, note attachment downloads, and typed case workflows.

## Authentication

Dynamics 365 Customer Service uses Microsoft Entra ID OAuth 2.0 or client credentials against a Dataverse environment. OAuth can discover the first accessible Dataverse environment or use a configured instance URL. Client credentials require an application user with the needed Dataverse security roles.

## Configuration

- `instanceUrl`: optional Dataverse environment URL. Auth output is used when omitted.
- `apiVersion`: optional Dataverse Web API version. Defaults to `v9.2`.

## Tools

### List Customer Service Records

List cases, queues, queue items, knowledge articles, notes, and attachment metadata with Dataverse OData query options.

### Get Customer Service Record

Retrieve one Customer Service record by GUID.

### Create Customer Service Record

Create a Customer Service record in supported Dataverse tables.

### Update Customer Service Record

Patch selected Customer Service record columns.

### Manage Case Workflow

Resolve, reopen, cancel, or assign a case with typed action-specific inputs.

### Manage Queue Item Workflow

Add records to queues, pick queue items for a user, release picked items, remove queue items, or route queue items to a queue, user, or team.

### Download Note Attachment

Download a note attachment from an annotation through a Slate attachment. File bytes are not returned in JSON output.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
