import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-customer-service',
  name: 'Dynamics 365 Customer Service',
  description:
    'Manage Dynamics 365 Customer Service cases, queues, queue items, knowledge articles, notes, and attachments through Microsoft Dataverse.',
  metadata: {},
  config,
  auth
});
