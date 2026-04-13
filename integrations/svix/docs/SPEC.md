Let me get more details on the operational webhook event types and the API regions.Now I have enough information. Let me compile the specification.

# Slates Specification for Svix

## Overview

Svix is a webhooks-as-a-service platform that enables developers to send webhooks to their customers reliably. It makes sending webhooks easy and reliable by offering webhook sending as a service, ensuring robust deliverability and a great developer experience. Svix acts as webhook sending infrastructure, handling retries, scaling, security, and observability via a single API call.

## Authentication

Svix authenticates API requests using API keys. If you don't include your key when making an API request, or use an incorrect or outdated one, Svix returns an error.

- **Type:** Bearer token (API key)
- **Header:** `Authorization: Bearer {AUTH_TOKEN}`
- Get your authentication token (AuthToken) from the Svix dashboard. You can create one on the "API Access" page in the Svix dashboard.
- API keys are per environment. Every organization starts with a development environment with a corresponding API key, which should only be used for development or internal testing.

**Server URL / Region:**

The Svix libraries automatically infer the correct server URL from the authentication token, so setting a server URL is not necessary unless you are self-hosting. The base URLs are region-specific:

- US: `https://api.us.svix.com`
- EU: `https://api.eu.svix.com`

**Application Portal Access:**

App portal access is based on short-lived sessions using special magic links. Your customers don't need a Svix account. To give users access to the App Portal, use the app portal access endpoint, which returns a short-lived URL and token scoped to a specific application.

## Features

### Application (Consumer) Management

When sending messages using the Svix API, you send them to a specific application (consumer), which distributes them to the associated endpoints. In most cases, you create one application for each of your customers. Applications can be assigned custom UIDs (e.g., your internal customer ID) enabling completely stateless usage without storing Svix identifiers in your own database.

### Message Sending

Send webhook messages to applications with a single API call. Each message includes:

- **eventType**: an identifier denoting the type of the event (e.g., `invoice.paid`). **eventId**: an optional unique ID for the event (unique per app).
- **payload**: arbitrary JSON content delivered as the webhook body.
- You can optionally include an application property when sending a message; if the application does not exist yet, it will be created automatically.

### Endpoint Management

Endpoints represent a target URL for messages sent to an application. You can have multiple endpoints per application, and every message is sent to all of them. Endpoints can have filters, most commonly by event type, where an endpoint can choose to only subscribe to a limited set of events.

- Endpoints support custom UIDs, descriptions, and secret keys for signature verification.
- Channels provide an additional filtering dimension orthogonal to event types, allowing messages to be tagged with channels (e.g., projects) and endpoints to subscribe to specific channels.

### Event Type Registry

Each message has an associated event type identifier. Event types are the primary way for webhook consumers to configure what events they are interested in receiving.

- Event type schemas allow users to anticipate the shape of the message body. Schemas can be created using a visual editor or by providing a JSONSchema (Draft 7) spec.
- If you already have an OpenAPI specification, you can upload it to Svix, which will automatically create event types based on the webhooks section.
- Event types support feature flags for gradual rollout to specific users.

### Consumer Application Portal

Svix comes with a consumer application portal for your users that you can use out of the box. Your users can use it to add endpoints, debug delivery, and inspect and replay past webhooks. This is the easiest way to get started, but you can alternatively use the API to build your own.

- The portal is white-labeled and embeddable as an iframe or via React components.
- Access is granted through short-lived magic-link URLs generated via the API.

### Message Delivery and Retries

If a message delivery fails, it will be attempted multiple times until either it succeeds or its attempts have been exhausted.

- If all attempts to a specific endpoint fail for a period of 5 days, the endpoint will be disabled and an operational webhook will be sent.
- Users can manually retry individual messages or bulk-recover all failed messages from a given date.

### Message Signing and Security

To ensure the security and integrity of messages, Svix signs all webhook messages prior to sending. Svix supports two types of signature schemes: symmetric (pre-shared key) and asymmetric (public key).

### Transformations

Transform the payload directly from within Svix, changing the schema and content. This allows modifying webhook payloads before delivery using custom JavaScript logic.

### Svix Ingest (Webhook Receiving)

Svix Ingest is a way to receive webhooks from external services. It ensures you never lose a webhook, handles traffic spikes, and provides full visibility into webhook traffic.

- Svix Ingest offers fanout allowing you to route incoming webhooks to multiple endpoints. You can also transform payloads and dynamically control delivery using JavaScript.
- Works with any service that sends webhooks, including Stripe, GitHub, Shopify, Slack, HubSpot, and more.

### Environments

Environments are completely isolated Svix environments that have their own API keys, data, and settings. You can think of them as completely separate accounts. You can create as many as needed — most people create one for Production, Staging, and Development.

## Events

In addition to enabling you to send webhooks to your customers, Svix also sends you webhooks about events in your Svix environment, called "Operational webhooks." These let you build powerful workflows and automations over events in your account.

Operational webhooks are configured through the Operational Webhooks section of the Svix dashboard.

### Endpoint Events

Notifications about changes to endpoint status.

- `endpoint.disabled` triggers when an endpoint has been automatically disabled after multiple days of failing.

### Message Attempt Events

Notifications about the outcome of message delivery attempts.

- `message.attempt.exhausted` is sent after all retry attempts for a message to an endpoint have been exhausted and the message is marked as failed.
