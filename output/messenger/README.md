# <img src="https://provider-logos.metorial-cdn.com/meta.jpg" height="20"> Messenger

Send and receive messages between Facebook Pages and users through Messenger. Create rich message templates including carousels, buttons, receipts, and media. Manage Messenger profile settings such as greeting text, persistent menus, get started buttons, and ice breakers. Retrieve user profile information. Display typing indicators and read receipts. Handle conversation handover between bots and live agents. Link Messenger users to external accounts. Subscribe to real-time webhook events for messages, postbacks, referrals, reactions, deliveries, and read receipts. Supports a 24-hour messaging window with message tags for follow-up communications.

## Tools

### Get User Profile
Retrieve profile information for a Messenger user who has interacted with your Page. Returns available fields such as name, profile picture, locale, timezone, and gender.

### Manage Thread Handover
Control conversation thread ownership between apps using the Handover Protocol. **Pass** thread control to another app (e.g., hand off to a live agent), **take** thread control back (primary receiver only), or **request** thread control from the current owner.

### Manage Messenger Profile
Configure the Messenger experience for your Page. Set or update the **Get Started** button, **greeting text**, **persistent menu**, **ice breakers**, and **whitelisted domains**. Provide only the fields you want to update — unspecified fields remain unchanged. Use the **delete** action to remove specific profile settings.

### Send Message
Send a text message or media attachment to a Messenger user. Supports plain text with optional quick reply buttons, and media attachments (images, videos, audio, files) via URL. Use **messagingType** and **tag** to send messages outside the 24-hour messaging window.

### Send Template
Send a structured message template to a Messenger user. Supports **Generic** (carousel), **Button**, **Media**, and **Receipt** templates. Choose the appropriate templateType and provide the corresponding fields.

### Send Sender Action
Display a typing indicator or mark a message as read in a Messenger conversation. Use **typing_on** to show a typing bubble, **typing_off** to hide it, and **mark_seen** to show a read receipt.

## License

This integration is licensed under the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0.html).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
