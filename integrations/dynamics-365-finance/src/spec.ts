import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-finance',
  name: 'Dynamics 365 Finance',
  description:
    'Read Dynamics 365 Finance legal entities, chart of accounts, ledger entries, journals, customers, vendors, vendor invoices, and Data Management package status through Finance and Operations APIs.',
  metadata: {},
  config,
  auth
});
