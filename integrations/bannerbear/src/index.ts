import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  generateVideo,
  generateCollection,
  generateAnimatedGif,
  composeMovie,
  captureScreenshot,
  manageTemplate,
  listTemplates,
  getTemplate,
  createEditorSession,
  createSignedUrl,
  joinPdfs,
  rasterizePdf,
  diagnoseImage,
  getAccount
} from './tools';
import { templateEvent, mediaEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    generateVideo,
    generateCollection,
    generateAnimatedGif,
    composeMovie,
    captureScreenshot,
    manageTemplate,
    listTemplates,
    getTemplate,
    createEditorSession,
    createSignedUrl,
    joinPdfs,
    rasterizePdf,
    diagnoseImage,
    getAccount
  ],
  triggers: [templateEvent, mediaEvent]
});
