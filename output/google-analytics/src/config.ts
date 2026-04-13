import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    propertyId: z.string().describe('The GA4 property ID (e.g., "properties/123456789"). Required for Data API and Admin API operations.'),
  })
);
