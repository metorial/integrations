# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Contact Center

Read Dynamics 365 Contact Center and Omnichannel records through Microsoft Dataverse. The initial surface covers conversations, sessions, transcripts, agents, queues, routing state, linked cases, and transcript export as a Slate attachment.

## Authentication

Dynamics 365 Contact Center uses Microsoft Entra ID OAuth 2.0 or client credentials against a Dataverse environment. OAuth can discover the first accessible Dataverse environment or use a configured instance URL. Client credentials require an application user with the needed Dataverse security roles.

## Configuration

- `instanceUrl`: optional Dataverse environment URL. Auth output is used when omitted.
- `apiVersion`: optional Dataverse Web API version. Defaults to `v9.2`.

## Tools

### List Contact Center Records

List conversations, sessions, transcripts, agents, queues, routing state records, and linked cases with Dataverse OData query options.

### Get Contact Center Record

Retrieve one Contact Center record by GUID.

### Export Conversation Transcript

Read a transcript record column and return the transcript as a Slate text attachment. Transcript text is not returned inline in JSON output.

## Notes

This package is intentionally read-only. Contact Center write workflows are deferred until stable supported Microsoft documentation and live E2E coverage are available for those operations.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
