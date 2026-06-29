import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-field-service',
  name: 'Dynamics 365 Field Service',
  description:
    'Manage Dynamics 365 Field Service work orders, bookings, resources, customer assets, service accounts, incident types, products, and services through Microsoft Dataverse.',
  metadata: {},
  config,
  auth
});
