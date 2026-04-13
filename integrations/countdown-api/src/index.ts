import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchProducts,
  getProduct,
  getReviews,
  getSellerProfile,
  getSellerFeedback,
  getAutocomplete,
  manageCollection,
  listCollections,
  getCollectionResults,
  getAccount,
} from './tools';
import { collectionCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchProducts,
    getProduct,
    getReviews,
    getSellerProfile,
    getSellerFeedback,
    getAutocomplete,
    manageCollection,
    listCollections,
    getCollectionResults,
    getAccount,
  ],
  triggers: [
    collectionCompleted,
  ],
});
