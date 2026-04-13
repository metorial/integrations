import { Slate } from 'slates';
import { spec } from './spec';
import {
  deployCollection,
  mintTokens,
  getToken,
  updateToken,
  createTokenTemplate,
  getTokenTemplate,
  listTokenTemplates,
  updateTokenTemplate,
  createUser,
  getUser,
  listUsers,
  getContractMetadata,
  updateContractMetadata,
  listContracts
} from './tools';
import { newContracts, newUsers, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    deployCollection,
    mintTokens,
    getToken,
    updateToken,
    createTokenTemplate,
    getTokenTemplate,
    listTokenTemplates,
    updateTokenTemplate,
    createUser,
    getUser,
    listUsers,
    getContractMetadata,
    updateContractMetadata,
    listContracts
  ],
  triggers: [inboundWebhook, newContracts, newUsers]
});
