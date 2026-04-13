import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'twitterx',
  name: 'Twitter/X',
  description:
    'Social media platform for public microblogging, direct messaging, and real-time public conversation.',
  metadata: {},
  config,
  auth
});
