import { Slate } from 'slates';
import { spec } from './spec';
import {
  createAndScheduleScan,
  manageScan,
  getScanIteration,
  listInspectionResults,
  manageDataBreach,
  manageEmployee,
  manageDepartment,
  manageHeadquarter,
  manageDomain,
  manageDashboardUser,
  manageProcessingActivity,
  manageDpia,
  manageRecipient,
  manageAsset,
  manageLegalDocument,
  manageInfotypeCategory,
  exportInventory,
  getResourceStatistics,
  downloadReport,
  getCloudAccount
} from './tools';
import { scanCompleted, dataBreachUpdated, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createAndScheduleScan,
    manageScan,
    getScanIteration,
    listInspectionResults,
    manageDataBreach,
    manageEmployee,
    manageDepartment,
    manageHeadquarter,
    manageDomain,
    manageDashboardUser,
    manageProcessingActivity,
    manageDpia,
    manageRecipient,
    manageAsset,
    manageLegalDocument,
    manageInfotypeCategory,
    exportInventory,
    getResourceStatistics,
    downloadReport,
    getCloudAccount
  ],
  triggers: [inboundWebhook, scanCompleted, dataBreachUpdated]
});
