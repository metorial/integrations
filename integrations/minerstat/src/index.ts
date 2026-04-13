import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getCoinsTool,
  getHardwareTool,
  getPoolsTool,
  listWorkersTool,
  getWorkerHistoryTool,
  getMiningStatisticsTool,
  manageWorkerTool,
  executeWorkerCommandTool,
  manageTagsTool,
  manageCustomersTool,
  manageClockTuneTool
} from './tools';
import {
  workerStatusChangeTrigger,
  workerTemperatureAlertTrigger,
  workerHashrateDropTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getCoinsTool,
    getHardwareTool,
    getPoolsTool,
    listWorkersTool,
    getWorkerHistoryTool,
    getMiningStatisticsTool,
    manageWorkerTool,
    executeWorkerCommandTool,
    manageTagsTool,
    manageCustomersTool,
    manageClockTuneTool
  ],
  triggers: [
    inboundWebhook,
    workerStatusChangeTrigger,
    workerTemperatureAlertTrigger,
    workerHashrateDropTrigger
  ]
});
