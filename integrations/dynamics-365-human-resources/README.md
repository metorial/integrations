# <img src="https://provider-logos.metorial-cdn.com/Dynamics%20365%20Icon.svg" height="20"> Dynamics 365 Human Resources

Read Microsoft Dynamics 365 Human Resources data through Finance and Operations OData APIs. This package focuses on practical HR workflows: workers, employees, positions, jobs, departments, leave balances, leave requests, compensation plans, and benefit enrollments.

## Authentication

Dynamics 365 Human Resources uses Microsoft Entra ID OAuth 2.0 or client credentials against a Finance and Operations environment URL such as `https://contoso.operations.dynamics.com`. OAuth requests `user_impersonation` for the selected environment plus `offline_access` so Slates can refresh access tokens.

## Configuration

- `baseUrl` or `environmentUrl`: optional Finance and Operations environment URL. Required when it is not stored in the auth connection.
- `defaultLegalEntity`: optional default legal entity / `dataAreaId` for company-scoped list tools.
- `defaultPageSize`: optional default list page size. Defaults to the recipe page size.
- `defaultMaxPages`: optional maximum pages to fetch for list tools.

## Tools

- List workers
- Get worker
- List employees
- Get employee
- List positions
- Get position
- List jobs
- Get job
- List departments
- Get department
- List leave balances
- Get leave balance
- List leave requests
- Get leave request
- List compensation plans
- Get compensation plan
- List benefit enrollments
- Get benefit enrollment

## Notes

Submitting, approving, canceling, or editing leave requests and HR master data is intentionally deferred because no sandbox-safe live E2E coverage was added in this work item. The initial package is read-only. F&O data entity public collection names can vary by version and customization, so each resource tool allows an `entitySetName` override.

Company-scoped list tools apply the selected `legalEntity` / `dataAreaId` as an OData filter and request `cross-company=true` when needed so the filter can match records outside the user's default company. Microsoft documents F&O public OData entities through the `/data` service root and `$metadata`, and documents Human Resources entity coverage in the Dataverse tables and integration mapping references.

## License

This integration is licensed under the [FSL-1.1](https://github.com/metorial/metorial-platform/blob/dev/LICENSE).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
