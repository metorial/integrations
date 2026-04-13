import { Slate } from 'slates';
import { spec } from './spec';
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  publishRecord,
  listModels,
  manageModel,
  manageField,
  listUploads,
  manageUpload,
  manageEnvironment,
  manageBuildTrigger,
  searchSite,
  getSiteInfo,
} from './tools';
import {
  recordEvents,
  modelEvents,
  uploadEvents,
  buildEvents,
  environmentEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    publishRecord,
    listModels,
    manageModel,
    manageField,
    listUploads,
    manageUpload,
    manageEnvironment,
    manageBuildTrigger,
    searchSite,
    getSiteInfo,
  ],
  triggers: [
    recordEvents,
    modelEvents,
    uploadEvents,
    buildEvents,
    environmentEvents,
  ],
});
