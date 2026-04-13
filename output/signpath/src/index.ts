import { Slate } from 'slates';
import { spec } from './spec';
import {
  submitSigningRequest,
  getSigningRequest,
  resubmitSigningRequest,
  approveDenySigningRequest,
  listProjects,
  getProject,
  listCertificates,
  getCertificate,
  getSigningPolicies,
  getAuditLog
} from './tools';
import { signingRequestStatusChange } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    submitSigningRequest,
    getSigningRequest,
    resubmitSigningRequest,
    approveDenySigningRequest,
    listProjects,
    getProject,
    listCertificates,
    getCertificate,
    getSigningPolicies,
    getAuditLog
  ],
  triggers: [
    signingRequestStatusChange
  ]
});
