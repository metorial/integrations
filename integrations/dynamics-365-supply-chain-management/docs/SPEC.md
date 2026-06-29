# Slates Specification for Dynamics 365 Supply Chain Management

## Overview

Microsoft Dynamics 365 Supply Chain Management is an ERP product for product information management, inventory, warehousing, procurement, sales order fulfillment, and logistics operations. This Slates package targets Finance and Operations `/data` OData endpoints through `@slates/dynamics-finops-recipes`.

The initial package implements:

- products
- released products
- inventory on-hand
- warehouses
- purchase orders
- sales orders
- shipments
- receipts

## Authentication

Authentication uses Microsoft Entra ID:

- Authorization endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize`
- Token endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- Delegated F&O scope: `{environmentUrl}/user_impersonation`
- Refresh scope: `offline_access`
- Client credentials scope: `{environmentUrl}/.default`

The OAuth input asks for the F&O environment URL so the integration can request an audience-specific token. Client credentials are supported for server-to-server deployments that have been granted the required application permissions.

## Configuration

- `baseUrl` / `environmentUrl`: Finance and Operations environment URL. Auth output can also provide this value.
- `defaultLegalEntity`: default company / `dataAreaId` for company-scoped list tools.
- `defaultPageSize`: default page size for list tools.
- `defaultMaxPages`: maximum page count for bounded pagination.

## OData Behavior

List tools call recipe-backed bounded pagination with `$select`, `$filter`, `$orderby`, `$expand`, `$skip`, `$top`, `$count`, `cross-company`, and legal-entity filtering. Tools expose a stable summarized record shape plus the raw OData record for custom fields. Each tool provides a default public collection name and accepts `entitySetName` when a tenant uses a different public data entity name.

## Implemented Tools

- `list_products`
- `list_released_products`
- `get_released_product`
- `list_inventory_on_hand`
- `list_warehouses`
- `list_purchase_orders`
- `get_purchase_order`
- `list_sales_orders`
- `get_sales_order`
- `list_shipments`
- `list_receipts`

## Error Handling

Validation and upstream failures are normalized to `ServiceError` through shared helpers and the F&O recipe package. Tool schemas are top-level `z.object` values.

## File Outputs

This package does not download or export files. Any future package download, report, label, or document output tool must return file bytes through Slate attachments rather than JSON output fields.

## Deferred Scope

Shipment confirmation, product receipt posting, picking/packing updates, inventory adjustments, order cancellation, deletion, and other irreversible supply chain mutations are deferred until live sandbox E2E fixtures and cleanup policy exist.

## Primary References

- F&O OData: https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/odata
- Microsoft identity platform OAuth: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
