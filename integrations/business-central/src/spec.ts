import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'business-central',
  name: 'Business Central',
  description:
    'Read Microsoft Dynamics 365 Business Central ERP companies, customers, vendors, invoices, items, chart of accounts, general ledger entries, journals, document attachments, and sales invoice PDFs through the official API v2.0.',
  metadata: {},
  config,
  auth
});
