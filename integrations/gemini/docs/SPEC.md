Now let me search for more specific features like file uploads, model tuning, image/video generation, and caching:Now I have enough information to write the specification. The "Gemini" in this context refers to the Google Gemini AI API (the generative AI platform), not the Gemini crypto exchange. Let me compile the specification.

# Slates Specification for Gemini

## Overview

Gemini is Google's generative AI platform providing API access to a family of multimodal AI models. It supports text generation, multimodal understanding (images, audio, video, documents), embeddings, image generation (via Imagen and native models), video generation (via Veo), code execution, and real-time streaming interactions via the Live API. The API is accessible through the Gemini Developer API (via Google AI Studio) or the Vertex AI Gemini API (via Google Cloud).

## Authentication

### API Key (Primary Method)

The easiest way to authenticate to the Gemini API is to configure an API key. To create an API key, go to the API Key page in Google AI Studio at `https://aistudio.google.com/apikey`, select "Create API Key", and choose whether to create the key in a new or existing Google Cloud project.

All requests to the Gemini API must include a `x-goog-api-key` header with your API key.

Example:

```
x-goog-api-key: YOUR_API_KEY
```

**Base URL:** `https://generativelanguage.googleapis.com`

### OAuth 2.0 (For Advanced Features)

If you need stricter access controls, you can use OAuth instead. OAuth is specifically needed for features like model tuning and semantic retrieval.

Steps:

1. Enable the Google Generative Language API in Google Cloud Console.
2. Configure an OAuth consent screen and create OAuth 2.0 Client ID credentials (Desktop application type).
3. Download the `client_secret.json` file.
4. Use `gcloud auth application-default login` with `--client-id-file=client_secret.json` and scopes like `https://www.googleapis.com/auth/cloud-platform` and `https://www.googleapis.com/auth/generative-language.retriever`.

### Service Account (For Server Environments via Vertex AI)

For accessing Gemini through the Vertex AI platform on Google Cloud:

1. Create a service account and key, download the provided JSON file, assign the "Vertex AI User" role to the service account, and set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the JSON file's absolute path.
2. You'll typically need to set `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` variables.

**Vertex AI Base URL:** `https://{LOCATION}-aiplatform.googleapis.com`

## Features

### Text Generation and Chat

The Gemini API provides access to Google's most advanced AI models with key capabilities including text generation (chat, completion, summarization). Supports single-turn and multi-turn conversations. Configurable parameters include temperature, max output tokens, top-p, top-k, stop sequences, and system instructions. Gemini 3 series models use dynamic thinking by default, controllable via a `thinking_level` parameter that adjusts reasoning depth.

- Supports both standard (full response) and streaming (server-sent events) output modes.
- Supports structured outputs via function calling (for intermediate steps connecting to external tools) or JSON schema enforcement (for final response formatting).

### Multimodal Understanding

Gemini models are considered multimodal because they're capable of processing and even generating multiple modalities, including text, code, PDFs, images, video, and audio. Can process up to 1000 pages of PDF files with full multimodal understanding.

- Accepts mixed inputs (text, images, audio, video, documents) in a single request.
- Video capabilities include describing, segmenting, and extracting information from videos, answering questions about video content, and referring to specific timestamps.
- Supports YouTube URL input directly, as well as uploaded files.

### File Management

Files can be uploaded via the Files API for use in prompts. Files over 20MB or any video must go through the File API. Files are stored for 48 hours and can be reused across requests. Supports listing, retrieving metadata, and deleting uploaded files.

### Image Generation

Supports state-of-the-art native image generation and editing. Available through specialized image models (Imagen, Nano Banana / Gemini 3 Pro Image) as well as natively within Gemini models. Supports text-to-image generation, image editing, and text rendering. Offers granular control over multimodal vision processing via a `media_resolution` parameter.

### Video Generation

Supports state-of-the-art cinematic video generation with advanced creative controls and natively synchronized audio via Veo models.

### Music Generation

Provides high-fidelity music generation with granular creative control over instruments, BPM, and complex compositions.

### Embeddings

The Gemini API offers embedding models to generate embeddings for text, images, video, and other content. These resulting embeddings can then be used for tasks such as semantic search, classification, and clustering. The latest model (`gemini-embedding-2-preview`) maps text, images, video, audio, and documents into a unified embedding space, enabling cross-modal search across over 100 languages.

### Function Calling

Function calling lets you connect models to external tools and APIs. Instead of generating text responses, the model determines when to call specific functions and provides the necessary parameters to execute real-world actions. Supports compositional/sequential function calling where Gemini can chain multiple function calls together to fulfill a complex request. The Gemini SDKs also have built-in support for the Model Context Protocol (MCP), an open standard for connecting AI applications with external tools and data.

### Built-in Tools

Gemini can connect to built-in tools like Google Search, URL Context, Google Maps, Code Execution, and Computer Use.

- **Google Search Grounding:** Provides grounded responses using real-time web information.
- **Code Execution:** Enables the model to generate and run Python code, learning iteratively from the code execution results until it arrives at a final output.
- **Computer Use:** A specialized capability that can "see" a digital screen and perform UI actions like clicking, typing, and navigating to automate complex browser tasks.
- **URL Context:** Allows the model to fetch and reason over web page content.

### Context Caching

Context caching allows you to save and reuse precomputed input tokens that you wish to use repeatedly, for example when asking different questions about the same media file. This can lead to cost and speed savings. Caches have configurable TTL (time-to-live) and can include text, files, system instructions, and tool configurations.

### Model Tuning (Fine-Tuning)

Developers can build and fine-tune models tailored to specific tasks, ensuring that the models can recognize and process unique data sets. Requires OAuth authentication. Allows customizing model behavior with your own training data.

### Live API (Real-time Streaming)

The Live API enables low-latency, real-time voice and video interactions with Gemini by processing continuous streams of audio, video, or text. Connects via WebSockets. Features include multilingual support in 70+ languages, barge-in (user interruption), tool use integration, audio transcriptions, proactive audio, and affective dialog that adapts tone to match user expression.

### Token Counting

Utility endpoint to count the number of tokens in a given content or prompt before sending a generation request.

## Events

The provider does not support events. The Gemini API is a request-response and streaming API without webhooks or event subscription mechanisms.
