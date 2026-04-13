import { Slate } from 'slates';
import { spec } from './spec';
import {
  textToSpeechTool,
  speechToTextTool,
  listVoicesTool,
  getVoiceTool,
  editVoiceTool,
  deleteVoiceTool,
  designVoiceTool,
  generateSoundEffectTool,
  createDubbingTool,
  getDubbingTool,
  isolateAudioTool,
  listModelsTool,
  listHistoryTool,
  getUserTool,
  listPronunciationDictionariesTool,
} from './tools';
import {
  conversationEventsTrigger,
  voiceEventsTrigger,
  transcriptionCompletedTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    textToSpeechTool,
    speechToTextTool,
    listVoicesTool,
    getVoiceTool,
    editVoiceTool,
    deleteVoiceTool,
    designVoiceTool,
    generateSoundEffectTool,
    createDubbingTool,
    getDubbingTool,
    isolateAudioTool,
    listModelsTool,
    listHistoryTool,
    getUserTool,
    listPronunciationDictionariesTool,
  ],
  triggers: [
    conversationEventsTrigger,
    voiceEventsTrigger,
    transcriptionCompletedTrigger,
  ],
});
