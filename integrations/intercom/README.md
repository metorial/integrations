# <img src="https://provider-logos.metorial-cdn.com/intercom.svg" height="20"> Intercom

Manage customer support conversations, tickets, and contacts on the Intercom platform. Create, update, search, and archive contacts (users and leads) and companies. Send and reply to conversations as admins or on behalf of contacts, assign conversations to teammates or teams, snooze, close, and tag conversations. Create and manage support tickets with configurable types and state transitions. Build and maintain help center articles and collections for self-service knowledge bases. Submit and retrieve custom data events for contact activity tracking. Manage tags, segments, custom data attributes, and custom objects. Send outbound messages via in-app and email channels. Manage AI content sources for the Fin AI agent. Retrieve call data with transcriptions and recordings. Create and manage news items and newsfeeds. Export workspace data and reporting datasets. Manage admin away status and access activity logs. Subscribe to webhooks for real-time notifications on conversation, contact, company, ticket, and content engagement events.

## Tools

### Create Note

Add an internal note to a contact's profile. Notes are visible only to teammates, not to the contact. Useful for recording internal context about a customer.

### Get Company

Retrieve a single company by its Intercom ID. Returns full company details including plan, custom attributes, and user count.

### Get Contact

Retrieve a single contact by their Intercom ID or external ID. Returns full contact details including custom attributes, tags, companies, and segments.

### Get Conversation

Retrieve a single conversation with full details including the source message and all conversation parts (replies, notes, assignments, etc.). Limited to 500 parts.

### List Admins

List all admins (teammates) in the Intercom workspace. Useful for finding admin IDs needed for other operations like assigning conversations or sending messages.

### List Companies

List or search companies in Intercom. Supports both listing all companies with pagination and searching with Intercom's query syntax.

### Manage Articles

Create, update, or delete help center articles in Intercom. Articles power the help center and provide content for the Fin AI agent. Supports multilingual content through translated content fields.

### Manage Companies

Create, update, or delete companies in Intercom. Also supports attaching or detaching contacts from companies. The create and update operations use the same endpoint — if a company with the given companyId already exists, it will be updated.

### Manage Contacts

Create, update, archive, unarchive, merge, or delete contacts (users and leads) in Intercom. Use **action** to specify the operation. Supports custom attributes and contact ownership assignment. For merging, provide both a lead ID and a user ID — the lead will be merged into the user.

### Manage Conversations

Perform actions on Intercom conversations: create new conversations, reply, assign to teammates/teams, add notes, close, open, or snooze. Combines multiple conversation management operations into a single tool.

### Manage Data Events

Submit or list custom data events for contacts. Data events track user activity and can trigger automations or be used for segmentation. Use "submit" to track a new event, or "list" to retrieve events for a contact.

### Manage Tags

Create, update, delete tags, and apply or remove tags from contacts and conversations. Tags can be used to organize contacts, companies, and conversations for filtering and automation.

### Manage Tickets

Create, update, or reply to Intercom tickets. Supports state transitions, assignment, and custom ticket attributes. Use the "list_ticket_types" action to discover available ticket types before creating tickets.

### Search Articles

Search help center articles by phrase or list all articles with pagination. Search results include highlighted matching snippets.

### Search Contacts

Search for contacts using Intercom's query language. Supports filtering by any contact field including custom attributes. Use nested AND/OR operators for complex queries. Returns paginated results with cursor-based pagination.

### Search Conversations

Search and list conversations using Intercom's query language or list recent conversations with pagination. Supports filtering by fields like source.author.id, state, read, priority, assignee, and more.

### Send Message

Send an outbound message from an admin to a contact. Supports in-app and email messages. The message will initiate a new conversation with the target contact.

## License

This integration is licensed under the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0.html).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
