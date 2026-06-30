import { Slate } from 'slates';
import { spec } from './spec';
import {
  exportConversationTranscript,
  getContactCenterRecord,
  getRepresentativeAvailability,
  listContactCenterRecords
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listContactCenterRecords,
    getContactCenterRecord,
    exportConversationTranscript,
    getRepresentativeAvailability
  ],
  triggers: []
});
