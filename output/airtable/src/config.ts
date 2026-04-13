import { SlateConfig } from 'slates';
import { z } from 'zod';

export let config = SlateConfig.create(
  z.object({
    baseId: z.string().describe('The Airtable base ID (e.g. appXXXXXXXXXXXXXX). Found in the URL when viewing a base.'),
  })
);
