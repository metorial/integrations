import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'slack_user',
  name: 'Slack (User)',
  description: undefined,
  metadata: {},
  config,
  auth
});
