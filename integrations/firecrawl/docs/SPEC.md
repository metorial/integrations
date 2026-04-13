Now let me check the webhook event types page for complete details:# Slates Specification for Firecrawl

## Overview

Firecrawl is a web data extraction platform that converts websites into clean markdown, HTML, or structured data via API. It handles JavaScript rendering, anti-bot mechanisms, and proxy management to reliably scrape, crawl, search, and extract data from any website. It is open-source and also available as a hosted cloud service.

## Authentication

Firecrawl uses API key-based authentication via a Bearer token in the `Authorization` header. The header should contain `Bearer fc-123456789`, where `fc-123456789` represents your API key.

To obtain an API key:

1. Navigate to firecrawl.dev and sign up for an account.
2. Click on the dashboard button on the top navigation menu when logged in and you will find your API key in the main screen and under API Keys.

API keys follow the format `fc-1234567890abcdef...`. They can also be provided via the `FIRECRAWL_API_KEY` environment variable when using SDKs or the CLI.

The base URL for the API is `https://api.firecrawl.dev/v2/`.

No OAuth or other authentication methods are supported for the standard API. API keys are the primary authentication method, though Firecrawl may support additional options for enterprise customers.

## Features

### Scrape

Convert any single URL into clean content. Firecrawl can return content as markdown, HTML, screenshots, or structured data. Supports JavaScript-rendered pages and dynamic content.

- **Output formats**: markdown, HTML, rawHtml, screenshot, links, JSON (structured extraction via schema or prompt), branding (brand identity extraction), and summary.
- **Actions**: Perform interactions on a page before extracting data, such as clicking buttons, filling forms, scrolling, and waiting. This is useful for navigating dynamic content or accessing content that requires user interaction.
- **Change tracking**: Monitor website content changes over time.
- Supports custom headers, CSS selector includes/excludes, and configurable caching.

### Crawl

Crawl an entire website and get content from all pages. The crawl endpoint enables recursive exploration of entire websites, extracting data from all subpages.

- Configure a page limit to control the scope of the crawl.
- Supports filtering by URL patterns (include/exclude).
- Supports a sitemap-only crawl mode to exclusively use sitemap URLs without following links.
- Crawl jobs run asynchronously; results can be polled or received via webhooks.

### Search

Search the internet for pages matching your topic, then extract content from the most relevant results. Choose this approach when you need information but don't know which websites have it.

- Configurable result limit.
- Optionally scrape full page content from search results alongside standard search metadata (title, URL, description).
- Supports filtering by content categories.

### Map

The Map feature rapidly retrieves all URLs associated with a website, providing a clear overview of its architecture.

- Optionally filter URLs by a search term for relevance ordering.
- Supports up to 100k results.

### Extract

Firecrawl's extract endpoint leverages AI to transform unstructured web content into organized, ready-to-use data. It automates crawling, parsing, and structuring, reducing manual processing.

- Provide a natural language prompt and/or a JSON schema to define the desired output structure.
- Supports wildcard URLs (e.g., `example.com/*`) to extract data across an entire domain.
- `enableWebSearch` option allows extraction to follow links outside the specified domain.
- Extract is still in beta; results may vary on very large sites or complex temporal queries.

### Agent

Firecrawl /agent is an API that searches, navigates, and gathers data from even the most complex websites. Describe what data you want and the agent handles the rest.

- Provide a natural language prompt describing the data you need.
- Three model options: Spark 1 Fast for instant retrieval, Spark 1 Mini for complex research queries, and Spark 1 Pro for advanced extraction tasks.
- Supports parallel execution for running many agent queries simultaneously.

### Batch Scrape

Scrape multiple URLs simultaneously with the Batch Scrape endpoint.

- Submit an array of URLs and receive results asynchronously.
- Supports the same format and configuration options as single scrape.

### Browser Sandbox

Firecrawl Browser Sandbox gives agents a secure browser environment to interact with the web. Fill out forms, click buttons, authenticate, and more. No local setup or Chromium installs needed.

- Returns a CDP (Chrome DevTools Protocol) URL for programmatic browser control.
- Provides a live view URL for visual monitoring.

## Events

Firecrawl supports webhooks for asynchronous job notifications. You can pass a webhook parameter to endpoints, which will send a POST request to the URL you specify when the job is started, updated and completed. By default, you receive all events. To subscribe to specific events only, use the `events` array in your webhook config. Webhooks support signature verification for security.

### Crawl Events

Lifecycle events for crawl jobs: `crawl.started`, `crawl.page` (fired for each page scraped with its content), and `crawl.completed`. A `crawl.failed` event is sent if the crawl fails.

### Batch Scrape Events

Lifecycle events for batch scrape jobs: `batch_scrape.started`, `batch_scrape.page` (fired for each URL scraped with its content), and `batch_scrape.completed`.

### Extract Events

Lifecycle events for extract jobs: `extract.started`, `extract.completed` (includes the extracted structured data), and `extract.failed`.

### Agent Events

Lifecycle events for agent jobs: `agent.started`, `agent.action` (fired after each tool execution the agent performs), `agent.completed` (includes extracted data), `agent.failed`, and `agent.cancelled`.
