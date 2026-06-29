import { SlateSpecification } from 'slates';
import { auth } from './auth';
import { config } from './config';

export let spec = SlateSpecification.create({
  key: 'dynamics-365-supply-chain-management',
  name: 'Dynamics 365 Supply Chain Management',
  description:
    'Read Dynamics 365 Supply Chain Management products, released products, inventory on-hand, warehouses, purchase orders, sales orders, shipments, and receipts through Finance and Operations APIs.',
  metadata: {},
  config,
  auth
});
