import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'firecrawl',
  name: 'Firecrawl',
  description:
    'Web data extraction platform that converts websites into clean markdown, HTML, or structured data. Handles JavaScript rendering, anti-bot mechanisms, and proxy management.',
  metadata: {},
  config,
  auth
});
