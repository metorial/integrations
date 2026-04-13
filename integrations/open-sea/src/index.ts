import { Slate } from 'slates';
import { spec } from './spec';
import {
  getNft,
  listNfts,
  getCollection,
  listCollections,
  getEvents,
  getListings,
  getOffers,
  getAccount,
  refreshNftMetadata
} from './tools';
import { collectionEvents, accountEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getNft,
    listNfts,
    getCollection,
    listCollections,
    getEvents,
    getListings,
    getOffers,
    getAccount,
    refreshNftMetadata
  ],
  triggers: [inboundWebhook, collectionEvents, accountEvents]
});
