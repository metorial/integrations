import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    host: z.string().default('https://gitlab.com').describe('GitLab host URL (e.g. https://gitlab.com or https://gitlab.example.com)'),
    projectId: z.string().optional().describe('Default project ID or URL-encoded path (e.g. "12345" or "my-group/my-project")')
  })
);
