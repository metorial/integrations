import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContainers,
  manageContainer,
  getContainerProperties,
  setContainerMetadata,
  listBlobs,
  uploadBlob,
  downloadBlob,
  deleteBlob,
  getBlobProperties,
  updateBlobProperties,
  copyBlob,
  setBlobTier,
  createSnapshot,
  manageLease,
  appendToBlob,
} from './tools';
import { blobEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContainers,
    manageContainer,
    getContainerProperties,
    setContainerMetadata,
    listBlobs,
    uploadBlob,
    downloadBlob,
    deleteBlob,
    getBlobProperties,
    updateBlobProperties,
    copyBlob,
    setBlobTier,
    createSnapshot,
    manageLease,
    appendToBlob,
  ],
  triggers: [
    blobEvents,
  ],
});
