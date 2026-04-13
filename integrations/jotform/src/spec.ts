import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'jotform',
  name: 'JotForm',
  description:
    'Online form builder for creating, managing, and collecting data through customizable web forms.',
  metadata: {},
  config,
  auth
});
