import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-sales',
  name: 'Dynamics 365 Sales',
  description:
    'Manage Dynamics 365 Sales accounts, contacts, leads, opportunities, activities, quotes, and orders through Microsoft Dataverse.',
  metadata: {},
  config,
  auth
});
