import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchProperties,
  getProperty,
  findSimilarProperties,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  listSavedSearches,
  getPricePerMeterEvolution,
  locationAutocomplete,
  getPointsOfInterest,
} from './tools';
import {
  propertyEvents,
  newPropertyMatch,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchProperties,
    getProperty,
    findSimilarProperties,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    listSavedSearches,
    getPricePerMeterEvolution,
    locationAutocomplete,
    getPointsOfInterest,
  ],
  triggers: [
    propertyEvents,
    newPropertyMatch,
  ],
});
