import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryDocuments,
  getDocument,
  mutateDocuments,
  listProjects,
  manageDatasets,
  manageWebhooks,
  uploadAsset,
} from './tools';
import { documentChange } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    queryDocuments,
    getDocument,
    mutateDocuments,
    listProjects,
    manageDatasets,
    manageWebhooks,
    uploadAsset,
  ],
  triggers: [
    documentChange,
  ],
});
