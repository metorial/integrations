import { Slate } from 'slates';
import { spec } from './spec';
import {
  getAccountsTool,
  getBalancesTool,
  syncTransactionsTool,
  getTransactionsTool,
  getAuthTool,
  getIdentityTool,
  getHoldingsTool,
  getInvestmentTransactionsTool,
  getLiabilitiesTool,
  searchInstitutionsTool,
  getInstitutionTool,
  createLinkTokenTool,
  exchangePublicTokenTool,
  getItemTool,
  removeItemTool,
  createTransferTool,
  getTransferTool,
  listTransfersTool,
  evaluateSignalTool,
  enrichTransactionsTool,
  createAssetReportTool,
  getAssetReportTool
} from './tools';
import {
  itemWebhookTrigger,
  transactionsWebhookTrigger,
  transferWebhookTrigger,
  holdingsWebhookTrigger,
  assetsWebhookTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAccountsTool,
    getBalancesTool,
    syncTransactionsTool,
    getTransactionsTool,
    getAuthTool,
    getIdentityTool,
    getHoldingsTool,
    getInvestmentTransactionsTool,
    getLiabilitiesTool,
    searchInstitutionsTool,
    getInstitutionTool,
    createLinkTokenTool,
    exchangePublicTokenTool,
    getItemTool,
    removeItemTool,
    createTransferTool,
    getTransferTool,
    listTransfersTool,
    evaluateSignalTool,
    enrichTransactionsTool,
    createAssetReportTool,
    getAssetReportTool
  ],
  triggers: [
    itemWebhookTrigger,
    transactionsWebhookTrigger,
    transferWebhookTrigger,
    holdingsWebhookTrigger,
    assetsWebhookTrigger
  ]
});
