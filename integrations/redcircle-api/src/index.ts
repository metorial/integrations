import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchProducts,
  getProductDetails,
  getReviews,
  browseCategories,
  checkStoreStock,
  manageZipcodes,
  manageCollections,
  getCollectionResults,
  manageDestinations,
  getAccount,
} from './tools';
import { collectionCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchProducts,
    getProductDetails,
    getReviews,
    browseCategories,
    checkStoreStock,
    manageZipcodes,
    manageCollections,
    getCollectionResults,
    manageDestinations,
    getAccount,
  ],
  triggers: [
    collectionCompleted,
  ],
});
