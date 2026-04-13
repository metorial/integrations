import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';
    
export let spec = SlateSpecification.create({
  key: 'google-drive',
  name: 'Google Drive',
  description: undefined,
  metadata: {},
  config,
  auth
})
