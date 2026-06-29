import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-commerce',
  name: 'Dynamics 365 Commerce',
  description:
    'Read and manage Microsoft Dynamics 365 Commerce Retail Server channels, stores, catalogs, products, prices, promotions, inventory availability, customers, carts, and orders.',
  metadata: {},
  config,
  auth
});
