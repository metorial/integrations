import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchCertificates,
  listMonitoredDomains,
  manageMonitoredDomain,
  authorizeCertificate,
  authorizePublicKey,
} from './tools';
import { certificateEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchCertificates,
    listMonitoredDomains,
    manageMonitoredDomain,
    authorizeCertificate,
    authorizePublicKey,
  ],
  triggers: [
    certificateEvents,
  ],
});
