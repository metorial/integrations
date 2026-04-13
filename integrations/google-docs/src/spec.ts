import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'google-docs',
  name: 'Google Docs',
  description: undefined,
  metadata: {},
  config,
  auth
});
