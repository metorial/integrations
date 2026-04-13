import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    projectId: z.string().describe('Google Cloud project ID'),
    region: z.string().default('us-central1').describe('Google Cloud region for Speech-to-Text v2 API (e.g. us-central1, europe-west1). Defaults to us-central1.'),
  })
);
