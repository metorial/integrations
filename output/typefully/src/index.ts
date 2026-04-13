import { Slate } from 'slates';
import { spec } from './spec';
import { createDraft, listDrafts, getDraft, updateDraft, deleteDraft, listSocialSets, manageTags, uploadMedia } from './tools';
import { draftEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createDraft,
    listDrafts,
    getDraft,
    updateDraft,
    deleteDraft,
    listSocialSets,
    manageTags,
    uploadMedia,
  ],
  triggers: [
    draftEvents,
  ],
});
