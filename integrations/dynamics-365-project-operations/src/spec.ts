import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-project-operations',
  name: 'Dynamics 365 Project Operations',
  description:
    'Read and maintain Dynamics 365 Project Operations data in Dataverse, run Project schedule API OperationSets, and track Finance and Operations Data Management handoff packages.',
  metadata: {},
  config,
  auth
});
