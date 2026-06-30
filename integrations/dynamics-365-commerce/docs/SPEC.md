# Slates Specification for Dynamics 365 Commerce

## Overview

Microsoft Dynamics 365 Commerce exposes Commerce Scale Unit Retail Server APIs for channel, store, catalog, product, pricing, promotion, inventory, customer, cart, and order workflows. This package is a product integration for `dynamics-365-commerce`; reusable Retail Server request construction, pagination, attachment, validation, and upstream error normalization live in `@slates/dynamics-commerce-recipes`.

## Authentication

The primary auth method is Microsoft Entra client credentials for Retail Server external applications.

- Token endpoint: `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token`
- Grant type: `client_credentials`
- Scope: `{serverResourceId}/.default`
- Required auth input: `tenantId`, `clientId`, `clientSecret`, `serverResourceId`, and `retailServerUrl`
- Optional auth input: `operatingUnitNumber`, `locale`, and `channelId`

The package also includes a bearer-token auth method for sandbox and diagnostic use when the caller already has a valid Retail Server access token. Both auth methods persist the Retail Server URL so tools can build Commerce API requests without requiring package config.

## Configuration

- `retailServerUrl`: optional Retail Server URL override. Auth output is used when omitted.
- `operatingUnitNumber`: optional default `OUN` header value.
- `locale`: optional default `Accept-Language` value.
- `channelId`: optional default Commerce channel id.
- `catalogId`: optional default catalog id.
- `defaultPageSize`: optional default page size.
- `maxPageSize`: optional page-size cap.

## Implemented Tools

- `lookup_channels_stores`
- `lookup_catalogs`
- `lookup_products_prices_inventory`
- `manage_customers`
- `manage_carts`
- `manage_orders`
- `download_retail_server_metadata`

## Retail Server Coverage

The tools consume `@slates/dynamics-commerce-recipes` methods for:

- Channels and stores: list channels, get channel configuration, get store, search stores.
- Catalogs: list catalogs and get a catalog by selecting from the documented
  `Catalogs/GetCatalogs` response page. Public Microsoft Commerce consumer API
  docs do not document a separate `Catalogs/GetCatalog` action.
- Products, prices, promotions, and inventory: product search, product get by id, product get by ids, active prices, product promotions, product availability, and estimated availability.
- Customers: create, update, search, get by account numbers, and order history.
- Carts: create, get, add/update/remove lines, add/remove discount codes, checkout, and promotions.
- Orders: search, get by transaction id, get by sales id, and create sales order.
- Metadata: Retail Server `$metadata` download as an attachment.

## API Fidelity Notes

- Product `GetByIds`, `GetActivePrices`, and `GetProductAvailabilities` send
  `QueryResultSettings` because Microsoft documents those actions as returning
  paged results.
- Product `GetById` sends only `recordId` and `channelId`; `catalogId` is not a
  documented parameter for that action.
- Product `GetActivePrices` maps the user-facing `customerAccountNumber` input
  to the documented `customerId` parameter.
- Customer `GetByAccountNumbers` requires `searchLocationValue` and sends
  `QueryResultSettings`; customer `GetOrderHistory` sends `accountNumber` plus
  `QueryResultSettings`.
- Cart line update actions pass optional `cartVersion`; cart checkout passes
  optional `receiptNumberSequence` and `cartVersion`.
- Order detail lookups call `SalesOrders/GetSalesOrderDetailsByTransactionId`
  and `SalesOrders/GetSalesOrderDetailsBySalesId`, matching the Microsoft
  sales-order controller names.

## Write Safety

Customer create/update, cart mutations, cart checkout, and sales-order creation require `confirmWrite: true` at runtime. The tools throw Slates `ServiceError` values when confirmation is missing or when incompatible action-specific fields are omitted.

Cart checkout and order creation are transactional Commerce operations. They are exposed for controlled use, but private live E2E write scenarios are intentionally out of scope for this package task.

## Schema Compatibility

Every public tool input is a top-level `z.object`. Branching tools use an `action` enum plus optional action-specific fields, with runtime ServiceError validation supplied by the recipe and package adapter helpers.

## File Outputs

`download_retail_server_metadata` returns XML only through a Slate attachment. JSON output includes metadata such as MIME type and attachment count, not the XML contents.

## Error Handling

Package auth and tool validation failures throw `ServiceError` through shared Slates helpers or recipe helpers. Retail Server upstream failures are normalized by `@slates/dynamics-commerce-recipes`.

## Primary References

- Commerce Retail Server API consumption: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/consume-retail-server-api
- Commerce Scale Unit customer and consumer APIs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-customer-consumer-api
- Microsoft identity platform client credentials flow: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
