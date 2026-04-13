# <img src="https://provider-logos.metorial-cdn.com/confluence-logo.png" height="20"> Confluence

Create, read, update, and delete pages, blog posts, comments, and attachments in Confluence spaces. Manage spaces, permissions, labels, and content restrictions. Search content using Confluence Query Language (CQL). Upload and download file attachments with versioning. Manage users, groups, and group memberships. Create and manage whiteboards, databases, folders, and templates. View and update inline tasks. Access audit logs. Listen for webhooks on page, blog, comment, attachment, space, label, and user events.

## Tools

### Create Page

Create a new Confluence page in a specified space. The body should be in Confluence storage format (XHTML-based). Optionally set a parent page to create hierarchical content.

### Delete Page

Delete a Confluence page by ID. The page is moved to trash and can be restored later.

### Get Attachments

List file attachments on a Confluence page. Returns attachment metadata including file name, media type, and size.

### Get Content Versions

Retrieve the version history of a Confluence page or blog post. Shows who made changes, when, and their version messages.

### Get Page Children

Retrieve the direct child pages of a Confluence page. Useful for navigating the page hierarchy.

### Get Page

Retrieve a Confluence page by its ID, with optional body content. Returns page metadata including title, space, version, and status. Use **includeBody** to fetch the full storage-format content.

### List Pages

List Confluence pages, optionally filtered by space, title, or status. Returns page metadata for each result. Supports pagination via cursor.

### List Spaces

List Confluence spaces with optional filtering by space key, type, or status. Returns space metadata including name, key, and type.

### List Blog Posts

List Confluence blog posts, optionally filtered by space or title. Returns blog post metadata for each result.

### Get Comments

Retrieve footer comments on a Confluence page. Returns comment metadata and body content.

### Get Labels

Get all labels on a Confluence content item (page, blog post, or attachment).

### Get Page Properties

Retrieve all content properties (key-value metadata) for a Confluence page.

### Get Content Restrictions

Get read and update restrictions on a Confluence content item. Shows which users and groups have restricted access.

### Get Current User

Retrieve the currently authenticated Confluence user's profile information.

### Search Content

Search Confluence content using CQL (Confluence Query Language). CQL supports filtering by type, space, label, creator, date, title, text content, and more. **Example CQL queries:** - \

### Update Page

Update an existing Confluence page's title, body, or status. Requires the current version number to prevent conflicts. If you don't know the current version, use **Get Page** first to retrieve it.

## License

This integration is licensed under the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0.html).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
