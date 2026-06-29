import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-human-resources',
  name: 'Dynamics 365 Human Resources',
  description:
    'Read Dynamics 365 Human Resources workers, employees, positions, jobs, departments, leave balances, leave requests, compensation, and benefits through Finance and Operations APIs.',
  metadata: {},
  config,
  auth
});
