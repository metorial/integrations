import {
  Slate } from 'slates';
import { spec } from './spec';
import { createRelationship, searchRelationships, addNote, getUser } from './tools';
import { newRelationship,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [createRelationship, searchRelationships, addNote, getUser],
  triggers: [
    inboundWebhook,newRelationship],
});
