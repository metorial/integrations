import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-contact-center',
  name: 'Dynamics 365 Contact Center',
  description:
    'Read Dynamics 365 Contact Center conversations, sessions, transcripts, agents, queues, routing state, and linked cases through Microsoft Dataverse.',
  metadata: {},
  config,
  auth
});
