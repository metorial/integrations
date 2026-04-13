import { Slate } from 'slates';
import { spec } from './spec';
import {
  createFlipbook,
  listFlipbooks,
  getFlipbook,
  deleteFlipbook,
  updateSocialMetadata,
  managePasswordProtection,
  manageAccessList,
  manageBookshelf,
  getOembed,
} from './tools';
import { leadCollected } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createFlipbook,
    listFlipbooks,
    getFlipbook,
    deleteFlipbook,
    updateSocialMetadata,
    managePasswordProtection,
    manageAccessList,
    manageBookshelf,
    getOembed,
  ],
  triggers: [
    leadCollected,
  ],
});
