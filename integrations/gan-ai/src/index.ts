import { Slate } from 'slates';
import { spec } from './spec';
import {
  listVoices,
  generateSpeech,
  getTtsHistory,
  createAvatar,
  listAvatars,
  generateAvatarVideo,
  getAvatarInference,
  deleteAvatars,
  manageConsent,
  createPhotoAvatar,
  listPhotoAvatars,
  generatePhotoAvatarVideo,
  getPhotoAvatarInferences,
  createLipsync,
  listLipsyncs,
  deleteLipsyncs,
  generateSoundEffect,
  getSfxHistory,
  listWorkspaces,
  listProjects,
  createPersonalizedVideos,
  getVideoStatus
} from './tools';
import { playgroundWebhook, studioVideoWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listVoices,
    generateSpeech,
    getTtsHistory,
    createAvatar,
    listAvatars,
    generateAvatarVideo,
    getAvatarInference,
    deleteAvatars,
    manageConsent,
    createPhotoAvatar,
    listPhotoAvatars,
    generatePhotoAvatarVideo,
    getPhotoAvatarInferences,
    createLipsync,
    listLipsyncs,
    deleteLipsyncs,
    generateSoundEffect,
    getSfxHistory,
    listWorkspaces,
    listProjects,
    createPersonalizedVideos,
    getVideoStatus
  ],
  triggers: [playgroundWebhook, studioVideoWebhook]
});
