import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPhantoms,
  getPhantom,
  savePhantom,
  deletePhantom,
  launchPhantom,
  stopPhantom,
  getPhantomOutput,
  getExecution,
  listExecutions,
  manageLeads,
  manageLists,
  getWorkspace
} from './tools';
import { phantomExecutionCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPhantoms,
    getPhantom,
    savePhantom,
    deletePhantom,
    launchPhantom,
    stopPhantom,
    getPhantomOutput,
    getExecution,
    listExecutions,
    manageLeads,
    manageLists,
    getWorkspace
  ],
  triggers: [phantomExecutionCompleted]
});
