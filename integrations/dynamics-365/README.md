# Dynamics 365 Dataverse

Generic Microsoft Dynamics 365 Dataverse connector for Dataverse-backed environments.
The integration keeps the backward-compatible `dynamics-365` provider key while
targeting the Dataverse Web API, not the full Dynamics 365 application suite.

It supports Dataverse row CRUD, list/OData queries, FetchXML, Dataverse Search,
relationship association/disassociation, related-row traversal, table and column
metadata discovery, action/function invocation, file/image column upload and
download, and Dataverse `$batch` requests.

This integration does not implement Dynamics 365 Finance and Operations,
Commerce/Retail Server, Business Central, native Dataverse webhook registration,
or product-specific tools beyond what is exposed through Dataverse tables and
operations.

## Tools

### Create Record

Create a Dataverse row in any table using the OData entity set name. Supports
duplicate detection and `@odata.bind` relationship values.

### Get Record

Retrieve one Dataverse row by GUID or alternate key, with optional `$select` and
`$expand`.

### Update Record

Update one Dataverse row by GUID or alternate key. Only supplied columns are
changed.

### Delete Record

Delete one Dataverse row by GUID or alternate key.

### List Records

List Dataverse rows with `$select`, `$filter`, `$orderby`, `$expand`, `$top`,
page-size hints, count support, and `nextLink` continuation metadata.

### FetchXML Query

Run a FetchXML query against a Dataverse entity set and return rows plus
pagination metadata.

### Search Records

Search Dataverse tables through the Dataverse Search API, including optional
table-specific selected/search columns.

### Associate Records

Create a single-valued or collection-valued relationship between Dataverse rows.

### Disassociate Records

Clear a single-valued lookup or remove a row from a collection-valued
relationship.

### Get Related Records

Retrieve rows through a Dataverse navigation property.

### List Entity Definitions

List Dataverse table definitions and stable entity-set metadata.

### Get Entity Attributes

Retrieve Dataverse column metadata, including type, required level, read,
create, and update support, lookup targets, and metadata IDs.

### Invoke Function

Invoke unbound, entity-bound, or collection-bound Dataverse functions.

### Invoke Action

Invoke unbound, entity-bound, or collection-bound Dataverse actions.

### Download File or Image Column

Download a Dataverse file/image column. File contents are returned only as a
Slate attachment; tool output contains metadata such as MIME type, size, and
attachment count.

### Upload File or Image Column

Upload base64 content to a Dataverse file/image column using Dataverse block
upload actions.

### Execute Batch Request

Submit multiple relative Dataverse Web API operations in one `$batch` request.

### Who Am I

Return the current Dataverse user, organization, and business unit IDs.

## Authentication

The connector supports Microsoft Entra OAuth and client credentials
server-to-server auth. OAuth first discovers the user-accessible Dataverse
environment and then exchanges for an environment-scoped token. Client
credentials auth requires the Dataverse environment URL and an application user
with appropriate Dataverse security roles.

## Triggers

The package includes a generic inbound webhook receiver and a polling
record-changed trigger for Dataverse rows. It does not register native Dataverse
plugin steps or Business Central webhook subscriptions.

## License

This integration is licensed under the
[FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).
