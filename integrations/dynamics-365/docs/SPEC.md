# Slates Specification for Dynamics 365 Dataverse

## Overview

This package is the backward-compatible `dynamics-365` Slates integration for
Microsoft Dynamics 365 environments backed by Microsoft Dataverse. It exposes a
generic Dataverse Web API control surface for rows, metadata, search,
relationships, actions/functions, file/image columns, and `$batch` requests.

The package is not a full Dynamics 365 suite connector. It does not implement
Dynamics 365 Finance and Operations `/data` APIs, Commerce/Retail Server APIs,
Business Central APIs, product-specific modules, or native Dataverse webhook
registration.

## Authentication

Dynamics 365 Dataverse uses Microsoft Entra ID OAuth 2.0 for online Web API
access.

### Supported Flows

**Authorization Code Flow (Delegated):** The user signs in with Microsoft. The
integration first requests a discovery-scoped token for the global Dataverse
discovery service, resolves the first accessible environment URL, then exchanges
the refresh token for an environment-scoped Dataverse token.

**Client Credentials Flow (Server-to-Server):** The caller supplies tenant ID,
client ID, client secret, and Dataverse environment URL. The Microsoft Entra app
must have an application user in Dataverse with the required security roles.

### Scopes

- Delegated discovery: `https://globaldisco.crm.dynamics.com/user_impersonation`
- Refresh support: `offline_access`
- Environment token: `https://<environment>/.default`
- Client credentials: `https://<environment>/.default`

Stored auth output includes the access token, refresh token when available,
expiry, Dataverse instance URL, and tenant ID. Refresh preserves the previous
refresh token when Microsoft omits a rotated refresh token.

## Tool Surface

### Record Management

The integration supports generic Dataverse row create, get, update, delete, and
list operations. Record tools use OData entity set names such as `accounts` or
`contacts`. Read, update, and delete support GUIDs and alternate keys.

Create and update return the raw Dataverse record body for compatibility and add
stable metadata such as `entitySetName` and a best-effort `recordId` when it can
be inferred from the response.

### Querying and Pagination

List supports `$select`, `$filter`, `$orderby`, `$expand`, `$top`, page-size
hints, count requests, and `nextLink` continuation. FetchXML supports the
Dataverse `fetchXml` query parameter and returns continuation metadata.

### Dataverse Search

Search uses the Dataverse Search API. Inputs keep the previous `searchTerm` and
string `entities` fields and also support Dataverse Search entity descriptors
with selected and searched columns.

### Metadata Discovery

Metadata tools list table definitions and table attributes. Outputs expose
stable names and identifiers such as `logicalName`, `entitySetName`,
`primaryIdAttribute`, `primaryNameAttribute`, `metadataId`, attribute type,
required level, read/create/update flags, and lookup targets.

### Relationships

Relationship tools associate records, disassociate records, and retrieve related
records through navigation properties. Association and disassociation support
single-valued lookup properties and collection-valued relationships.

### Actions and Functions

Action/function tools invoke unbound, entity-bound, and collection-bound
Dataverse operations. Branching is modeled with a top-level object schema,
optional binding fields, and runtime validation, not top-level union schemas.

### File and Image Columns

File/image download returns binary content as Slate attachments only. Structured
tool output contains metadata such as file name, MIME type, byte size, and
attachment count. Upload uses Dataverse file block upload actions and returns
metadata plus the raw commit response when Dataverse sends one.

### Batch

The batch tool accepts relative Dataverse Web API operations and sends a
multipart `$batch` request. Write operations are grouped into a changeset by the
shared Dataverse recipe package.

## Triggers

The package includes:

- `inbound_webhook`: a generic Slates webhook receiver that parses posted JSON.
- `record_changed`: a polling trigger that queries Dataverse rows modified
  since the last poll.

The integration does not create or manage native Dataverse plugin registration
steps.

## Schema Requirements

All tool input schemas serialize to a top-level JSON Schema object. Variant
inputs use enum fields plus optional variant-specific fields, with invalid
combinations rejected at runtime through `ServiceError`.

## File Output Requirement

Tools that return file bytes use Slate attachments. The output schema must not
expose base64 or full file text fields.
