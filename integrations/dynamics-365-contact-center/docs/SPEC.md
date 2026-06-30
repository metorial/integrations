# Slates Specification for Dynamics 365 Contact Center

## Overview

Dynamics 365 Contact Center and Omnichannel records are exposed through Dataverse tables and supported unbound actions in tenant environments. This package provides a read-only product adapter over `@slates/microsoft-dataverse-recipes` for conversation, session, transcript, agent, queue, routing, linked-case inspection, transcript file export, and representative availability checks.

## Authentication

The integration supports Microsoft Entra delegated OAuth and client credentials. Delegated OAuth requests Dataverse user impersonation and refresh-token access. Client credentials use the Dataverse environment `/.default` scope and require a configured Dataverse application user.

## Tools

- `list_contact_center_records`
- `get_contact_center_record`
- `export_conversation_transcript`
- `get_representative_availability`

## Notes

Contact Center table names can vary by installed Dynamics apps and tenant version, so the record read tools expose entity-set overrides. Transcript export uses Dataverse file-column download because transcript file columns such as `msdyn_voicetranscript_formatted` store the content, while regular row retrieval only returns file identifiers. Writes are intentionally omitted from this release. `get_representative_availability` wraps the Microsoft-supported `CCaaS_GetRepresentativeAvailabilityForConversation` and `CCaaS_GetRepresentativeAvailabilityBeforeConversation` unbound actions.
