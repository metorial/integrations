# Slates Specification for Dynamics 365 Customer Insights

## Overview

Dynamics 365 Customer Insights data can be surfaced in Dataverse-backed environments for downstream CRM use. This package provides a conservative product adapter over `@slates/microsoft-dataverse-recipes` for Customer Insights table discovery, customer profile, alternate key, segment, measure, activity, enrichment, prediction, segment membership, and segment-member export workflows.

## Authentication

The integration supports Microsoft Entra delegated OAuth and client credentials. Delegated OAuth requests Dataverse user impersonation and refresh-token access. Client credentials use the Dataverse environment `/.default` scope and require a configured Dataverse application user.

## Tools

- `list_customer_insights_tables`
- `list_customer_insights_records`
- `get_customer_insights_record`
- `export_segment_members`

## Notes

Customer Insights environments can differ in table names and segment-member materialization. The metadata tool exposes Dataverse entity-set names and readable columns. The export tool uses the documented `msdynci_segments` segment-name filter by default and still accepts tenant-specific segment lookup filters when the caller provides the lookup column. Export content is returned only through Slate attachments.
