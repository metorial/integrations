import { Slate } from 'slates';
import { spec } from './spec';
import {
  listSuggestions,
  getSuggestion,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
  updateSuggestionStatus,
  listForums,
  manageForum,
  listUsers,
  listSupporters,
  manageSupporter,
  listStatuses,
  listLabels,
  listCategories,
  listComments,
  listFeatures,
  listNpsRatings,
  addNote,
  importExternalUsers,
} from './tools';
import {
  suggestionWebhook,
  newSuggestionsPolling,
  statusUpdatesPolling,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listSuggestions,
    getSuggestion,
    createSuggestion,
    updateSuggestion,
    deleteSuggestion,
    updateSuggestionStatus,
    listForums,
    manageForum,
    listUsers,
    listSupporters,
    manageSupporter,
    listStatuses,
    listLabels,
    listCategories,
    listComments,
    listFeatures,
    listNpsRatings,
    addNote,
    importExternalUsers,
  ],
  triggers: [
    suggestionWebhook,
    newSuggestionsPolling,
    statusUpdatesPolling,
  ],
});
