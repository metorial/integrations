import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCredentialTemplates,
  createCredentialTemplate,
  issueCredential,
  getIssuanceSession,
  createVerificationRequest,
  getVerificationSession,
  revokeCredentials,
  managePresentationTemplate,
  listPresentationTemplates,
  manageDidcommConnection,
  listDidcommConnections,
  manageTrustedEntity,
  listTrustedEntities,
  listProjects,
  listIssuedCredentials,
  listDids
} from './tools';
import { credentialEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCredentialTemplates,
    createCredentialTemplate,
    issueCredential,
    getIssuanceSession,
    createVerificationRequest,
    getVerificationSession,
    revokeCredentials,
    managePresentationTemplate,
    listPresentationTemplates,
    manageDidcommConnection,
    listDidcommConnections,
    manageTrustedEntity,
    listTrustedEntities,
    listProjects,
    listIssuedCredentials,
    listDids
  ],
  triggers: [credentialEvent]
});
