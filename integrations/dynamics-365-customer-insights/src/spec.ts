import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-customer-insights',
  name: 'Dynamics 365 Customer Insights',
  description:
    'Read Dynamics 365 Customer Insights customer profiles, segments, measures, activities, and segment members through Microsoft Dataverse.',
  metadata: {},
  config,
  auth
});
