# Slates Specification for Dynamics 365 Sales

## Overview

Dynamics 365 Sales stores its core CRM records in Microsoft Dataverse. This package is a product-specific adapter over the shared Dataverse recipe package. It exposes Sales-oriented table choices, names, documentation, and workflows while delegating Dataverse URL construction, pagination, Web API calls, action invocation, and error normalization to `@slates/microsoft-dataverse-recipes`.

## Authentication

The integration supports Microsoft Entra delegated OAuth and client credentials. Delegated OAuth requests Dataverse user impersonation and refresh-token access. Client credentials use the Dataverse environment `/.default` scope and require a configured Dataverse application user.

## Tools

- `list_sales_records`
- `get_sales_record`
- `create_sales_record`
- `update_sales_record`
- `delete_sales_record`
- `qualify_lead`
- `close_opportunity`

## Notes

The first release focuses on practical Sales P0 workflows. Quote/order fulfillment transitions and custom sales-process automation are intentionally excluded until product-specific live E2E coverage is available.
