import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dataforseo',
  name: 'DataForSEO',
  description:
    'SEO, SEM, and digital marketing data platform providing SERP data, keyword research, backlink analysis, on-page audits, domain analytics, content analysis, and more.',
  metadata: {},
  config,
  auth
});
