import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'gitlab-ci',
  name: 'GitLab CI',
  description: 'Manage CI/CD pipelines, jobs, runners, environments, variables, schedules, and artifacts within GitLab projects.',
  metadata: {},
  config,
  auth
});
