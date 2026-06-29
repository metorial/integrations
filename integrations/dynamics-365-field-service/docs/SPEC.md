# Slates Specification for Dynamics 365 Field Service

## Overview

Dynamics 365 Field Service stores work orders, resource bookings, assets, resources, incident types, products, and services in Microsoft Dataverse. This package is a product-specific adapter over `@slates/microsoft-dataverse-recipes`, which owns Dataverse client behavior, OData construction, pagination, action helpers, and ServiceError normalization.

## Authentication

The integration supports Microsoft Entra delegated OAuth and client credentials. Delegated OAuth requests Dataverse user impersonation and refresh-token access. Client credentials use the Dataverse environment `/.default` scope and require a configured Dataverse application user.

## Tools

- `list_field_service_records`
- `get_field_service_record`
- `create_field_service_record`
- `update_field_service_record`
- `schedule_booking`
- `update_booking`
- `manage_work_order_lifecycle`

## Notes

Booking relationship field names are tenant-sensitive in Field Service customizations, so the typed booking tools expose navigation-property overrides while defaulting to common Dataverse names. Posting, invoicing, and destructive work-order transitions are intentionally deferred until live E2E coverage exists.
