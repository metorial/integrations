import { Slate } from 'slates';
import { spec } from './spec';
import {
  listMaps,
  getMap,
  createLocation,
  updateLocation,
  deleteLocation,
  findLocations,
  searchNearby,
  addTravelBoundary,
  lookupTerritory
} from './tools';
import { newLocation, newMap, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listMaps,
    getMap,
    createLocation,
    updateLocation,
    deleteLocation,
    findLocations,
    searchNearby,
    addTravelBoundary,
    lookupTerritory
  ],
  triggers: [inboundWebhook, newLocation, newMap]
});
