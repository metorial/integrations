import { Slate } from 'slates';
import { spec } from './spec';
import {
  createCredential,
  getCredential,
  updateCredential,
  deleteCredential,
  issueCredential,
  searchCredentials,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  listGroups,
  listDesigns,
  getDesign,
  listCredentialInteractions,
  createCredentialInteraction
} from './tools';
import { credentialEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createCredential,
    getCredential,
    updateCredential,
    deleteCredential,
    issueCredential,
    searchCredentials,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    listGroups,
    listDesigns,
    getDesign,
    listCredentialInteractions,
    createCredentialInteraction
  ],
  triggers: [credentialEvent]
});
