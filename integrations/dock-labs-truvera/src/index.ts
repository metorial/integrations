import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageDid,
  issueCredential,
  getCredentials,
  deleteCredential,
  verifyCredential,
  manageSchema,
  manageRegistry,
  manageAnchor,
  createProofRequest,
  getProofRequests,
  createPresentation,
  manageProfile,
  sendMessage,
  getJobStatus
} from './tools';
import {
  credentialEvents,
  didEvents,
  registryEvents,
  schemaEvents,
  proofEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageDid,
    issueCredential,
    getCredentials,
    deleteCredential,
    verifyCredential,
    manageSchema,
    manageRegistry,
    manageAnchor,
    createProofRequest,
    getProofRequests,
    createPresentation,
    manageProfile,
    sendMessage,
    getJobStatus
  ],
  triggers: [credentialEvents, didEvents, registryEvents, schemaEvents, proofEvents]
});
