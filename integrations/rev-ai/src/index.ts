import { Slate } from 'slates';
import { spec } from './spec';
import {
  submitTranscriptionJob,
  getTranscriptionJob,
  getTranscript,
  listTranscriptionJobs,
  deleteJob,
  analyzeSentiment,
  extractTopics,
  identifyLanguage,
  manageCustomVocabulary,
  getCaptions,
  getAccount,
} from './tools';
import { jobCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    submitTranscriptionJob,
    getTranscriptionJob,
    getTranscript,
    listTranscriptionJobs,
    deleteJob,
    analyzeSentiment,
    extractTopics,
    identifyLanguage,
    manageCustomVocabulary,
    getCaptions,
    getAccount,
  ],
  triggers: [
    jobCompleted,
  ],
});
