# Slates Specification for Dataforseo

## Overview

DataForSEO is an API-first platform that provides SEO, SEM, and digital marketing data. It aggregates data from search engines, marketplaces, review platforms, and billions of other websites across the web. Its API suite covers SERP data, keyword research, backlink analysis, on-page audits, domain analytics, business data, ecommerce/merchant data, app store data, content analysis, and AI optimization.

## Authentication

DataForSEO uses Basic Authentication.

Your unique API token should be passed in the `Authorization` header within the request in the following format: `Authorization: Basic login:password`. Instead of "login" and "password", use your API credentials encoded in Base64.

Your API login is the same as the email address you use to create an account with DataForSEO. The API password is generated automatically by DataForSEO and is different from your account password. You can find your API login and password in the API Access section of the Dashboard.

Basic authentication is the only way to access DataForSEO API; credentials should always be passed in the header of the request.

**Base URL:** `https://api.dataforseo.com/`

**Example header:**

```
Authorization: Basic bG9naW46cGFzc3dvcmQ=
```

Where `bG9naW46cGFzc3dvcmQ=` is the Base64-encoded string of `login:password`.

## Features

### SERP Data

Retrieve search engine results pages for any keyword, location, and language. All major search engines are supported: Google, Bing, YouTube, Yahoo, Baidu, Naver, and Seznam. Covers organic results, local packs, maps, news, images, jobs, shopping, autocomplete, ads, and more. Results can be filtered by device type (desktop/mobile) and OS.

### Keyword Data

Obtain keyword metrics including search volume, CPC, competition, and keyword suggestions. The Keywords For Site endpoint relies on Google Ads data and DataForSEO's proprietary SERP database to provide keywords that are highly relevant to the target domain. Supports keyword research across Google, Bing, and Amazon.

### DataForSEO Labs (Keyword & Domain Intelligence)

DataForSEO Labs API provides data on keywords, SERPs, and domains based on in-house databases. Includes competitor domain analysis, domain intersection (shared keywords between domains), historical rank overviews, keyword suggestions, related keywords, and app store optimization metrics for Google Play and App Store.

### Backlinks

Backlinks API provides real-time structured backlink data on virtually any domain, subdomain, or page on the web, including all relevant link, referring page and domain properties. Features include backlink summaries, anchor analysis, historical backlink data (back to 2019), referring domains/networks, and link intersection (gap analysis) to find domains linking to competitors.

### On-Page (Site Audit)

Customizable website crawler with JavaScript rendering support, designed for running technical audits at scale and powering on-page SEO tools. Crawl websites to identify technical SEO issues, analyze page resources, and extract on-page data.

### Domain Analytics

Domain Analytics Whois API offers Whois data enriched with backlink stats, and ranking and traffic info from organic and paid search results. Domain Analytics Technologies API identifies all possible technologies used for building websites, allowing reviewing stats by domain and by technology name, category or group.

### Business Data

This API is based on business reviews and business information publicly shared on platforms including Google Business Profile and Google Hotels. Business Data API also encompasses Social Media endpoints providing data on social media interactions associated with a certain page, supporting Facebook, Pinterest, and Reddit.

### Merchant (Ecommerce)

Merchant API provides essential data and metrics for conducting comprehensive competitor analysis, price monitoring, and market niche research. Covers Google Shopping product catalog and data about prices and sellers on Amazon. Includes product listings, seller data, reviews, and Amazon ASINs.

### App Data

With App Data API you can get data on millions of apps published on Google Play or App Store platforms. Review endpoints help collect feedback data on any application, including review ratings, reviewer's profile information, publication dates, and other relevant data. Also supports discovering apps ranking for specific keywords.

### Content Analysis

Content Analysis API ensures brand monitoring solutions can quickly search for brand mentions and keyword citations across the web and get all the related data in real-time. It provides a sophisticated sentiment analysis algorithm and includes citation statistics, trends by category, and rating distributions.

### AI Optimization

AI Optimization API provides data for keyword discovery, conversational optimization, and real-time LLM benchmarking. Enables generating structured responses from leading LLMs (ChatGPT, Claude, Gemini, Perplexity) and retrieving AI-specific keyword search volume data.

### Data Retrieval Methods

DataForSEO has two main methods to deliver results: Standard and Live. The Live method delivers instant results, unlike the Standard method which requires making separate POST and GET requests. The Standard method is more affordable; the Live method is suited for real-time needs.

## Events

DataForSEO supports task completion notifications via two callback mechanisms: pingbacks and postbacks.

### Task Completion Pingback

The pingback function is a notification sent to your server upon the completion of a task. When setting a task, you specify a `pingback_url` parameter. Upon completion, DataForSEO sends a GET request to that URL with the task ID substituted into the URL. You can then use the task ID to retrieve results via the Task GET endpoint.

- Configurable parameters: `pingback_url` (with `$id` and `$tag` variable placeholders).

### Task Completion Postback (Webhook)

Postback is referred to as a webhook or HTTP push. The postback function actually sends the results to your server. When setting a task, you specify a `postback_url` parameter, and DataForSEO delivers the full task results directly to your server upon completion.

- Configurable parameters: `postback_url`, the data retrieval function (e.g., `advanced` or `html`).
- Tasks set with the `postback_url` parameter will not be provided in the list of completed tasks by the Tasks Ready endpoint.
- In case of delivery issues, you can resend webhooks using the Webhook Resend endpoint for up to 100 task IDs.
