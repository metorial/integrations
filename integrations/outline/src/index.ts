import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchDocuments,
  getDocument,
  createDocument,
  updateDocument,
  manageDocument,
  listDocuments,
  listCollections,
  manageCollection,
  manageCollectionMembership,
  listUsers,
  listComments,
  manageComment,
  manageGroup
} from './tools';
import { documentEvents, collectionEvents, commentEvents, userEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchDocuments,
    getDocument,
    createDocument,
    updateDocument,
    manageDocument,
    listDocuments,
    listCollections,
    manageCollection,
    manageCollectionMembership,
    listUsers,
    listComments,
    manageComment,
    manageGroup
  ],
  triggers: [documentEvents, collectionEvents, commentEvents, userEvents]
});
