# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Supply Chain Management

Read Microsoft Dynamics 365 Supply Chain Management data through Finance and Operations OData APIs. This first package focuses on practical supply chain workflows: products, released products, inventory on-hand, warehouses, purchase orders and lines, sales orders and lines, shipments, and receipts.

## Authentication

Dynamics 365 Supply Chain Management uses Microsoft Entra ID OAuth 2.0 or client credentials against a Finance and Operations environment URL such as `https://contoso.operations.dynamics.com`. OAuth requests `user_impersonation` for the selected environment plus `offline_access` so Slates can refresh access tokens.

## Configuration

- `baseUrl` or `environmentUrl`: optional Finance and Operations environment URL. Required when it is not stored in the auth connection.
- `defaultLegalEntity`: optional default legal entity / `dataAreaId` for company-scoped list tools.
- `defaultPageSize`: optional default list page size. Defaults to the recipe page size.
- `defaultMaxPages`: optional maximum pages to fetch for list tools.

## Tools

- List products
- List released products
- Get released product
- List inventory on hand
- List warehouses
- List purchase orders
- List purchase order lines
- Get purchase order
- List sales orders
- List sales order lines
- Get sales order
- List shipments
- List receipts

## Notes

Posting, inventory adjustments, shipment confirmation, product receipt posting, order cancellation, and other irreversible supply chain workflows are intentionally deferred. This initial package is read-only. F&O data entity public collection names can vary by version and customization, so each resource tool allows an `entitySetName` override.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
