import { Slate } from 'slates';
import { spec } from './spec';
import {
  createJournalDraftRecord,
  getCustomer,
  getVendor,
  listChartOfAccounts,
  listCustomers,
  listJournals,
  listLedgerEntries,
  listLegalEntities,
  listVendorInvoices,
  listVendors,
  runDataManagementPackageOperation
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listLegalEntities,
    listChartOfAccounts,
    listLedgerEntries,
    listJournals,
    createJournalDraftRecord,
    listCustomers,
    getCustomer,
    listVendors,
    getVendor,
    listVendorInvoices,
    runDataManagementPackageOperation
  ],
  triggers: []
});
