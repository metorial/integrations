import { Slate } from 'slates';
import { spec } from './spec';
import {
  deploySmartContract,
  interactSmartContract,
  listSmartContracts,
  importSmartContract,
  uploadToIpfs,
  listIpfsPins,
  manageWallets,
  manageWatchers,
  getTransactions,
  listTemplates,
} from './tools';
import { blockchainEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    deploySmartContract,
    interactSmartContract,
    listSmartContracts,
    importSmartContract,
    uploadToIpfs,
    listIpfsPins,
    manageWallets,
    manageWatchers,
    getTransactions,
    listTemplates,
  ],
  triggers: [
    blockchainEvent,
  ],
});
