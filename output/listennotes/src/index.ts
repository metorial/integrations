import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchPodcasts,
  getPodcast,
  getEpisode,
  batchFetch,
  bestPodcasts,
  getRecommendations,
  curatedLists,
  typeaheadSearch,
  getPlaylists,
  submitPodcast,
  deletePodcast,
  getGenresAndRegions,
  randomEpisode,
} from './tools';
import { podcastSubmission } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchPodcasts,
    getPodcast,
    getEpisode,
    batchFetch,
    bestPodcasts,
    getRecommendations,
    curatedLists,
    typeaheadSearch,
    getPlaylists,
    submitPodcast,
    deletePodcast,
    getGenresAndRegions,
    randomEpisode,
  ],
  triggers: [
    podcastSubmission,
  ],
});
