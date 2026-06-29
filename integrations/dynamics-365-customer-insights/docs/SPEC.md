# Slates Specification for Dynamics 365 Customer Insights

## Overview

Dynamics 365 Customer Insights data can be surfaced in Dataverse-backed environments for downstream CRM use. This package provides a conservative product adapter over `@slates/microsoft-dataverse-recipes` for customer profile, segment, measure, activity, and segment-member export workflows.

## Authentication

The integration supports Microsoft Entra delegated OAuth and client credentials. Delegated OAuth requests Dataverse user impersonation and refresh-token access. Client credentials use the Dataverse environment `/.default` scope and require a configured Dataverse application user.

## Tools

- `list_customer_insights_records`
- `get_customer_insights_record`
- `export_segment_members`

## Notes

Customer Insights environments can differ in table names and segment-member materialization. The export tool includes entity-set, filter-column, and custom-filter inputs so tenants can adapt it without changing the public tool contract. Export content is returned only through Slate attachments.
