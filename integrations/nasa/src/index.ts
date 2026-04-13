import { Slate } from 'slates';
import { spec } from './spec';
import {
  getApod,
  searchAsteroids,
  getMarsRoverPhotos,
  getMarsRoverManifest,
  getEpicImages,
  getNaturalEvents,
  getSpaceWeather,
  getEarthImagery,
  searchNasaMedia,
  getNasaMediaAssets,
  searchTle,
  getTechPortProject,
  queryExoplanets,
  getCloseApproaches,
  getFireballs,
  lookupSmallBody,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getApod,
    searchAsteroids,
    getMarsRoverPhotos,
    getMarsRoverManifest,
    getEpicImages,
    getNaturalEvents,
    getSpaceWeather,
    getEarthImagery,
    searchNasaMedia,
    getNasaMediaAssets,
    searchTle,
    getTechPortProject,
    queryExoplanets,
    getCloseApproaches,
    getFireballs,
    lookupSmallBody,
  ],
  triggers: [
    inboundWebhook,
  ],
});
