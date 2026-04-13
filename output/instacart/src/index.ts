import { Slate } from 'slates';
import { spec } from './spec';
import {
  createRecipePage,
  createShoppingListPage,
  getNearbyRetailers,
  findStores,
  previewServiceOptions,
  listCartServiceOptions,
  reserveServiceOption,
  createUser,
  createOrder,
  getOrder,
  cancelOrder,
  sandboxAdvanceOrder,
} from './tools';
import {
  orderEvents,
  itemEvents,
  deliveryEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createRecipePage,
    createShoppingListPage,
    getNearbyRetailers,
    findStores,
    previewServiceOptions,
    listCartServiceOptions,
    reserveServiceOption,
    createUser,
    createOrder,
    getOrder,
    cancelOrder,
    sandboxAdvanceOrder,
  ],
  triggers: [
    orderEvents,
    itemEvents,
    deliveryEvents,
  ],
});
