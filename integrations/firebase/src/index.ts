import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageFirestoreDocument,
  queryFirestore,
  manageRealtimeData,
  manageUser,
  listUsers,
  lookupUser,
  sendFcmMessage,
  manageTopicSubscriptions,
  getRemoteConfig,
  updateRemoteConfig,
  manageStorage
} from './tools';
import {
  firestoreDocumentChanges,
  realtimeDbChanges,
  userChanges,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageFirestoreDocument,
    queryFirestore,
    manageRealtimeData,
    manageUser,
    listUsers,
    lookupUser,
    sendFcmMessage,
    manageTopicSubscriptions,
    getRemoteConfig,
    updateRemoteConfig,
    manageStorage
  ],
  triggers: [inboundWebhook, firestoreDocumentChanges, realtimeDbChanges, userChanges]
});
