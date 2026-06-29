import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365',
  name: 'Dynamics 365 Dataverse',
  description:
    'Generic Microsoft Dynamics 365 Dataverse connector for Dataverse Web API records, metadata, search, relationships, actions/functions, file columns, and batch requests.',
  metadata: {
    product: 'Microsoft Dynamics 365 Dataverse',
    api: 'Dataverse Web API'
  },
  config,
  auth
});
