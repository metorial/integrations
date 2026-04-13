import { Slate } from 'slates';
import { spec } from './spec';
import {
  listVaults,
  listItems,
  searchItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  generatePassword,
  getFileContent,
  getServerHealth
} from './tools';
import {
  auditEventsTrigger,
  itemUsageEventsTrigger,
  signInAttemptEventsTrigger,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listVaults,
    listItems,
    searchItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    generatePassword,
    getFileContent,
    getServerHealth
  ],
  triggers: [
    inboundWebhook,
    auditEventsTrigger,
    itemUsageEventsTrigger,
    signInAttemptEventsTrigger
  ]
});
