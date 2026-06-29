# Slates Specification for Dynamics 365 Contact Center

## Overview

Dynamics 365 Contact Center and Omnichannel records are exposed through Dataverse tables in tenant environments. This package provides a read-only product adapter over `@slates/microsoft-dataverse-recipes` for conversation, session, transcript, agent, queue, routing, and linked-case inspection.

## Authentication

The integration supports Microsoft Entra delegated OAuth and client credentials. Delegated OAuth requests Dataverse user impersonation and refresh-token access. Client credentials use the Dataverse environment `/.default` scope and require a configured Dataverse application user.

## Tools

- `list_contact_center_records`
- `get_contact_center_record`
- `export_conversation_transcript`

## Notes

Contact Center table names can vary by installed Dynamics apps and tenant version, so the read tools expose entity-set overrides. Writes are intentionally omitted from this release.
