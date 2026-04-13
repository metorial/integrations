import { Slate } from 'slates';
import { spec } from './spec';
import {
  textToSpeech,
  speechToText,
  listVoices,
  getVoice,
  deleteVoice,
  editVoiceSettings,
  generateSoundEffect,
  composeMusic,
  createDubbing,
  getDubbing,
  isolateAudio,
  listModels,
  listHistory,
  getAccount
} from './tools';
import { voiceAgentCall, speechToTextCompletion, voiceRemoval } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    textToSpeech,
    speechToText,
    listVoices,
    getVoice,
    deleteVoice,
    editVoiceSettings,
    generateSoundEffect,
    composeMusic,
    createDubbing,
    getDubbing,
    isolateAudio,
    listModels,
    listHistory,
    getAccount
  ],
  triggers: [voiceAgentCall, speechToTextCompletion, voiceRemoval]
});
