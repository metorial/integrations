import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'mailchimp',
  name: 'Mailchimp',
  description:
    'Email marketing and marketing automation platform for managing audiences, campaigns, automations, and e-commerce integrations.',
  metadata: {},
  config,
  auth
});
