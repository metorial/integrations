import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchPlaces,
  getPlaceDetails,
  autocompletePlaces,
  matchPlace,
  getPlacePhotos,
  getPlaceTips,
  findNearbyPlaces,
  submitPlaceFeedback,
  getFeedbackStatus
} from './tools';
import { userCheckin, venueEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchPlaces,
    getPlaceDetails,
    autocompletePlaces,
    matchPlace,
    getPlacePhotos,
    getPlaceTips,
    findNearbyPlaces,
    submitPlaceFeedback,
    getFeedbackStatus
  ],
  triggers: [userCheckin, venueEvent]
});
