import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createPresentation,
  getPresentation,
  manageSlides,
  editText,
  replaceText,
  addImage,
  addShape,
  manageSpeakerNotes,
  embedSheetsChart,
  batchUpdate,
  deleteElement
} from './tools';
import { presentationChanged,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPresentation,
    getPresentation,
    manageSlides,
    editText,
    replaceText,
    addImage,
    addShape,
    manageSpeakerNotes,
    embedSheetsChart,
    batchUpdate,
    deleteElement
  ],
  triggers: [
    inboundWebhook,
    presentationChanged
  ]
});
