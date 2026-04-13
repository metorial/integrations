Now let me get the full list of webhook events:Now I have all the information I need. Let me compile the specification.

# Slates Specification for Tableau

## Overview

Tableau is a data visualization and business intelligence platform (available as Tableau Cloud and Tableau Server) that enables users to create, publish, and share interactive dashboards, workbooks, and data sources. It provides a REST API and Metadata API (GraphQL) for programmatic management of server resources including workbooks, data sources, users, projects, flows, and sites.

## Authentication

Tableau's REST API uses a session-based authentication model. You first make a Sign In request to obtain a **credentials token**, which must then be included as the `X-Tableau-Auth` header in all subsequent API calls. The token is valid for 240 minutes by default.

There are three methods to obtain a credentials token:

### 1. Personal Access Token (PAT)
- **Recommended method**, especially required for Tableau Cloud when MFA is enabled.
- Generate a PAT from your Tableau user settings (My Account Settings → Personal Access Tokens).
- Sign in by sending the PAT name and PAT secret to `POST {server}/api/{api-version}/auth/signin`.
- PATs can be revoked individually without disabling the user account.

### 2. Username and Password
- Sign in by sending your username, password, and site content URL to `POST {server}/api/{api-version}/auth/signin`.
- Simpler for quick testing but less secure for automation.
- Administrators can impersonate other users using this method.

### 3. JSON Web Token (JWT) via Connected Apps or Unified Access Tokens
- For application-level integration and automation at scale.
- Requires a **Connected App** to be configured by a Tableau site admin (via direct trust or OAuth 2.0 trust), or a **Unified Access Token** (Tableau Cloud only) configured through Tableau Cloud Manager.
- The external application generates a JWT signed with the connected app's secret, including the connected app's client ID, secret ID, the user to impersonate (`sub` claim), and access **scopes** (`scp` claim).
- Scopes control which API methods the JWT can access. Common scopes include:
  - `tableau:content:read` — read access to content (workbooks, data sources, views, projects, etc.)
  - `tableau:workbooks:create`, `tableau:datasources:create` — create content
  - `tableau:permissions:update`, `tableau:permissions:delete` — manage permissions
  - `tableau:users:read`, `tableau:groups:read` — read user/group info
  - Individual scopes exist for most API method categories.
- The JWT is passed in the Sign In request body, and a credentials token is returned.

### Required Inputs
- **Server URL**: The Tableau Server or Tableau Cloud instance URL (e.g., `https://10ay.online.tableau.com`).
- **Site Content URL**: The subpath identifying the site (e.g., `my-site`). Required for all authentication methods.
- **API Version**: The REST API version number (e.g., `3.27`).

## Features

### Workbook Management
Publish, download, update, query, and delete workbooks. Export workbook views as images, PDFs, or CSV. Manage workbook connections, tags, and revisions. Supports updating workbook owner and moving workbooks between projects.

### Data Source Management
Publish, download, update, query, and delete data sources. Update data source connections and credentials. Trigger extract refreshes for data sources.

### View and Custom View Management
Query views within workbooks and across a site. Export views as images, PDFs, or CSV data. Create, update, delete, and share custom views (user-saved configurations of workbook views).

### User and Group Management
Create, update, query, and remove users from sites. Create and manage groups, including adding/removing users. Import users from Active Directory. Manage user site roles and authentication settings.

### Project Management
Create, update, query, and delete projects. Projects serve as containers for organizing workbooks, data sources, and other content. Supports nested project hierarchies.

### Permissions Management
Set, query, and update permissions for workbooks, data sources, projects, views, and other content. Permissions can be configured for individual users or groups with granular capability-level control.

### Extract and Refresh Management
Create, run, and manage extract refresh tasks for workbooks and data sources. Schedule refreshes to run at specified intervals. Monitor refresh job status (running, completed, failed). Supports both full and incremental extract refreshes.

### Flow Management
Publish, download, query, update, and delete Tableau Prep flows. Schedule and run flow tasks. Monitor flow run status and history.

### Jobs and Schedules
Query and monitor background jobs (extract refreshes, flow runs, subscriptions). Create and manage server schedules for recurring tasks. Cancel running jobs.

### Favorites
Add or remove workbooks, views, data sources, projects, and flows from a user's favorites list.

### Site Administration
Create, update, query, and delete sites (Tableau Server). Configure site settings including storage quotas, authentication configurations, and extension settings.

### Metadata and Data Quality
Query metadata about content and external assets (databases, tables, columns) via both the REST API and the Metadata API (GraphQL). Add data quality warnings and certifications (labels) to assets. Track data lineage — the relationships between data sources, workbooks, tables, and databases. Requires Data Management license for full functionality.

### Collections
Create and manage collections, which are curated groups of content items (workbooks, views, data sources) for organizational purposes.

### Tableau Pulse (Metrics)
Manage metric definitions, individual metrics, and insights. Subscribe users to metrics for automated monitoring. Generate insight bundles for anomaly detection and trend analysis.

### Notifications and Data-Driven Alerts
Create and manage data-driven alerts that trigger when data in a view meets specified conditions. Add or remove users from alert recipient lists. Configure user notification preferences.

### Analytics Extensions
Configure connections to external analytics extensions (e.g., Python, R) for advanced calculations within Tableau workbooks.

### Connected App Management
Create, list, update, and delete connected apps and their associated secrets for JWT-based authentication and embedding workflows.

## Events

Tableau supports webhooks that send HTTP POST notifications to a configured HTTPS URL when specific events occur on a site. Webhooks are managed via the REST API and require site administrator permissions to create.

### Datasource Events
Notifications when data sources are created, updated, or deleted. Also covers extract refresh lifecycle: started, succeeded, or failed.
- Event names: `DatasourceCreated`, `DatasourceUpdated`, `DatasourceDeleted`, `DatasourceRefreshStarted`, `DatasourceRefreshSucceeded`, `DatasourceRefreshFailed`

### Workbook Events
Notifications when workbooks are created, updated, or deleted. Also covers workbook extract refresh lifecycle: started, succeeded, or failed.
- Event names: `WorkbookCreated`, `WorkbookUpdated`, `WorkbookDeleted`, `WorkbookRefreshStarted`, `WorkbookRefreshSucceeded`, `WorkbookRefreshFailed`

### User Events
Notifications when a user is promoted to or demoted from a Site Administrator role, or when a user is deleted.
- Event names: `AdminPromoted`, `AdminDemoted`, `UserDeleted`

### Label Events
Notifications when labels (such as data quality warnings or certifications) are created, updated, or deleted on data sources or workbooks. Tableau Cloud only.
- Event names: `LabelCreated`, `LabelUpdated`, `LabelDeleted`

### Site Events
Notifications when sites are created, updated, or deleted.
- Event names: `SiteCreated`, `SiteUpdated`, `SiteDeleted`

### View Events
Notifications when views are deleted.
- Event names: `ViewDeleted`

**Configuration:** Each webhook subscribes to a single event type and delivers a JSON payload containing the resource type, event type, resource name, site LUID, resource LUID, and timestamp. The destination URL must use HTTPS with a valid certificate.