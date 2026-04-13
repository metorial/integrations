import { Slate } from 'slates';
import { spec } from './spec';
import {
  createAvatarVideo,
  getVideoStatus,
  listAvatars,
  listVoices,
  listVideos,
  deleteVideo,
  createVideoFromPrompt,
  generateFromTemplate,
  listTemplates,
  getTemplate,
  translateVideo,
  getTranslationStatus,
  generateSpeech,
  createStreamingToken,
  listAssets,
  uploadAsset,
  deleteAsset,
  getRemainingQuota,
  listTalkingPhotos
} from './tools';
import { videoEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createAvatarVideo,
    getVideoStatus,
    listAvatars,
    listVoices,
    listVideos,
    deleteVideo,
    createVideoFromPrompt,
    generateFromTemplate,
    listTemplates,
    getTemplate,
    translateVideo,
    getTranslationStatus,
    generateSpeech,
    createStreamingToken,
    listAssets,
    uploadAsset,
    deleteAsset,
    getRemainingQuota,
    listTalkingPhotos
  ],
  triggers: [videoEvents]
});
