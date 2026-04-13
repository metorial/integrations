import { Slate } from 'slates';
import { spec } from './spec';
import {
  listLibraries,
  manageLibrary,
  listLibraryElements,
  removeBackground,
  editPsd,
  generateImage,
  generativeFill,
  generativeExpand,
  searchStock,
  licenseStock,
  manageLightroomCatalog,
  applyLightroomEdits,
  manageUsers,
  indesignDataMerge,
  checkJobStatus
} from './tools';
import {
  assetEvents,
  libraryEvents,
  cloudDocumentEvents,
  photoshopJobEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listLibraries,
    manageLibrary,
    listLibraryElements,
    removeBackground,
    editPsd,
    generateImage,
    generativeFill,
    generativeExpand,
    searchStock,
    licenseStock,
    manageLightroomCatalog,
    applyLightroomEdits,
    manageUsers,
    indesignDataMerge,
    checkJobStatus
  ],
  triggers: [assetEvents, libraryEvents, cloudDocumentEvents, photoshopJobEvents]
});
