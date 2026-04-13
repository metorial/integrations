import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  startTranscriptionJob,
  getTranscriptionJob,
  listTranscriptionJobs,
  deleteTranscriptionJob,
  startCallAnalyticsJob,
  getCallAnalyticsJob,
  startMedicalTranscriptionJob,
  manageVocabulary,
  manageVocabularyFilter,
  listLanguageModels,
} from './tools';
import {
  transcriptionJobStateChange,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    startTranscriptionJob.build(),
    getTranscriptionJob.build(),
    listTranscriptionJobs.build(),
    deleteTranscriptionJob.build(),
    startCallAnalyticsJob.build(),
    getCallAnalyticsJob.build(),
    startMedicalTranscriptionJob.build(),
    manageVocabulary.build(),
    manageVocabularyFilter.build(),
    listLanguageModels.build(),
  ],
  triggers: [
    inboundWebhook,
    transcriptionJobStateChange.build(),
  ],
});
