import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchApisAndDomains,
  getApiDefinition,
  saveApiDefinition,
  deleteApi,
  updateApiSettings,
  getDomainDefinition,
  saveDomainDefinition,
  deleteDomain,
  getComments,
  manageIntegrations,
  manageProjects,
  runStandardization,
  getCollaboration,
} from './tools';
import { apiVersionEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchApisAndDomains,
    getApiDefinition,
    saveApiDefinition,
    deleteApi,
    updateApiSettings,
    getDomainDefinition,
    saveDomainDefinition,
    deleteDomain,
    getComments,
    manageIntegrations,
    manageProjects,
    runStandardization,
    getCollaboration,
  ],
  triggers: [
    apiVersionEvent,
  ],
});
