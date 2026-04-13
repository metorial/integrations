import { anyOf } from 'slates';

export let googleCloudSpeechScopes = {
  cloudPlatform: 'https://www.googleapis.com/auth/cloud-platform'
} as const;

let speechAccess = anyOf(googleCloudSpeechScopes.cloudPlatform);

export let googleCloudSpeechActionScopes = {
  transcribeAudio: speechAccess,
  batchTranscribeAudio: speechAccess,
  getOperation: speechAccess,
  createRecognizer: speechAccess,
  getRecognizer: speechAccess,
  listRecognizers: speechAccess,
  updateRecognizer: speechAccess,
  deleteRecognizer: speechAccess,
  synthesizeSpeech: speechAccess,
  listVoices: speechAccess
} as const;
