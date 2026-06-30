# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Commerce

Read and manage Microsoft Dynamics 365 Commerce Retail Server data through Commerce APIs. This integration covers channels and stores, catalogs, product discovery, prices, promotions, inventory availability, customers, carts, and sales orders.

## Authentication

Dynamics 365 Commerce Retail Server external access uses Microsoft Entra ID application authentication. Configure a Commerce app registration for Retail Server access, then connect with:

- `tenantId`: Microsoft Entra tenant ID.
- `clientId`: Application client ID.
- `clientSecret`: Application client secret.
- `serverResourceId`: Retail Server application ID URI or resource ID used to request an access token.
- `retailServerUrl`: Commerce Scale Unit Retail Server URL.
- `operatingUnitNumber`: optional default operating unit number sent as the Retail Server `OUN` header.

For sandbox diagnostics, the integration also accepts an existing bearer access token with a Retail Server URL.

## Configuration

- `retailServerUrl`: optional Retail Server URL override.
- `operatingUnitNumber`: optional default operating unit number.
- `locale`: optional default locale for Retail Server requests.
- `channelId`: optional default Commerce channel id.
- `catalogId`: optional default catalog id for catalog/product/cart tools.
- `defaultPageSize`: optional default page size, capped by `maxPageSize`.
- `maxPageSize`: optional maximum page size. Defaults to the recipe cap.

## Tools

### Lookup Commerce Channels And Stores

List channels, get channel configuration, retrieve a store, or search stores by text/location.

### Lookup Commerce Catalogs

List Commerce catalogs for a channel or retrieve a specific catalog from the documented
`GetCatalogs` response page.

### Lookup Commerce Products, Prices, Promotions, And Inventory

Search products, get products by id, retrieve active prices, inspect product promotions, and check availability through Retail Server product APIs.
Paged product, price, and availability actions send Retail Server `QueryResultSettings`.

### Manage Commerce Customers

Search customers, get customers by account number, get customer order history, create customers, or update customer records. Create and update actions require `confirmWrite: true`.
Getting customers by account number requires the Commerce `searchLocationValue` enum value.

### Manage Commerce Carts

Create carts, get carts, add/update/remove cart lines, apply/remove discount codes, get cart promotions, and checkout carts. Any cart mutation or checkout requires `confirmWrite: true`.
Line updates and checkout accept optional Commerce `cartVersion`; checkout also accepts `receiptNumberSequence`.

### Manage Commerce Orders

Search orders, get orders by transaction id or sales id, and create sales orders. Creating a sales order requires `confirmWrite: true`.
Getting an order by transaction id requires the Commerce `searchLocationValue` enum value.

### Download Retail Server Metadata

Download the Retail Server `$metadata` document as a Slate attachment. Metadata XML is not returned inline in JSON output.

## Notes

Cart checkout and sales-order creation can create transactional records in Commerce. The tools expose these workflows only behind explicit confirmation input, and package-local tests do not perform private live E2E writes.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
