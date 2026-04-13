import { Slate } from 'slates';
import { spec } from './spec';
import {
  orderCertificate,
  listOrders,
  getOrder,
  revokeCertificate,
  reissueCertificate,
  downloadCertificate,
  cancelOrder,
  listDomains,
  manageDomain,
  listOrganizations,
  manageOrganization,
  manageRequest,
  listProducts
} from './tools';
import { certcentralEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    orderCertificate,
    listOrders,
    getOrder,
    revokeCertificate,
    reissueCertificate,
    downloadCertificate,
    cancelOrder,
    listDomains,
    manageDomain,
    listOrganizations,
    manageOrganization,
    manageRequest,
    listProducts
  ],
  triggers: [certcentralEvents]
});
