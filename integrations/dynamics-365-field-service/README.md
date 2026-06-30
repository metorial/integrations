# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Field Service

Manage Dynamics 365 Field Service records through Microsoft Dataverse. The initial surface covers work orders, work-order incidents, work-order products, work-order services, service tasks, resource requirements, bookings, booking statuses, bookable resources, customer assets, service accounts, incident types, products, services, typed booking scheduling, booking updates, and work-order lifecycle status changes.

## Authentication

Dynamics 365 Field Service uses Microsoft Entra ID OAuth 2.0 or client credentials against a Dataverse environment. OAuth can discover the first accessible Dataverse environment or use a configured instance URL. Client credentials require an application user with the needed Dataverse security roles.

## Configuration

- `instanceUrl`: optional Dataverse environment URL. Auth output is used when omitted.
- `apiVersion`: optional Dataverse Web API version. Defaults to `v9.2`.

## Tools

### List Field Service Records

List Field Service records with OData filters, ordering, column selection, expansion, count, page size, and next-link pagination.
Use Dataverse `@odata.nextLink` values unchanged for subsequent pages, and do not combine `top` with `pageSize`.

### Get Field Service Record

Retrieve one Field Service record by GUID.

### Create Field Service Record

Create a Field Service Dataverse record with support for custom columns.

### Update Field Service Record

Patch selected Field Service record columns.
Updates are sent as existing-record updates, not Dataverse upserts.

### Schedule Booking

Create a bookable resource booking for a work order with typed resource, booking status, duration, start, end, and relationship fields.

### Update Booking

Update booking time, resource, booking status, or custom booking fields.
Updates are sent as existing booking updates, not Dataverse upserts.

### Manage Work Order Lifecycle

Set Field Service work-order system status and optional Dataverse state/status fields.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
