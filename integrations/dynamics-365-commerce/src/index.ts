import { Slate } from 'slates';
import { spec } from './spec';
import {
  downloadRetailServerMetadata,
  lookupCatalogs,
  lookupChannelsStores,
  lookupProductsPricesInventory,
  manageCarts,
  manageCustomers,
  manageOrders
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    lookupChannelsStores,
    lookupCatalogs,
    lookupProductsPricesInventory,
    manageCustomers,
    manageCarts,
    manageOrders,
    downloadRetailServerMetadata
  ],
  triggers: []
});
