import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-project-operations',
  name: 'Dynamics 365 Project Operations',
  description:
    'Read and maintain draft Dynamics 365 Project Operations project data in Dataverse, with Finance and Operations Data Management handoff support.',
  metadata: {},
  config,
  auth
});
