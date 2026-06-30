import { Slate } from 'slates';
import { spec } from './spec';
import {
  createJournalDraftRecord,
  getCustomer,
  getJournal,
  getVendor,
  getVendorInvoice,
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
    getJournal,
    createJournalDraftRecord,
    listCustomers,
    getCustomer,
    listVendors,
    getVendor,
    listVendorInvoices,
    getVendorInvoice,
    runDataManagementPackageOperation
  ],
  triggers: []
});
