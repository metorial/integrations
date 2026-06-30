# Slates Specification for Dynamics 365 Customer Service

## Overview

Dynamics 365 Customer Service stores cases, queues, knowledge content, and notes in Microsoft Dataverse. This package is a product-specific adapter over `@slates/microsoft-dataverse-recipes`, which owns Dataverse HTTP behavior, OData construction, pagination, file attachment helpers, action invocation, and ServiceError normalization.

## Authentication

The integration supports Microsoft Entra delegated OAuth and client credentials. Delegated OAuth requests Dataverse user impersonation and refresh-token access. Client credentials use the Dataverse environment `/.default` scope and require a configured Dataverse application user.

## Tools

- `list_customer_service_records`
- `get_customer_service_record`
- `create_customer_service_record`
- `update_customer_service_record`
- `manage_case_workflow`
- `manage_queue_item_workflow`
- `download_note_attachment`

## Notes

Case workflow inputs intentionally use a top-level object with `workflowAction` and optional action-specific fields so the generated tool schema remains MCP-compatible. Private live E2E coverage should be added before broad destructive or SLA/entitlement workflows are introduced.
Queue item workflow inputs follow the same top-level object pattern with `queueAction` and optional action-specific fields. The tool wraps Dataverse queue actions for add, pick, release, remove, and route while keeping generic record CRUD available for tenant-specific tables.
