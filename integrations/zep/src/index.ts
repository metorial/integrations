import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageUser,
  manageThread,
  addMessages,
  getContext,
  searchGraph,
  addFact,
  exploreGraph,
  manageOntology,
  deleteEpisode,
  cloneGraph,
  setUserSummaryInstructions,
  getUserThreads
} from './tools';
import { graphEvent, byomEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageUser,
    manageThread,
    addMessages,
    getContext,
    searchGraph,
    addFact,
    exploreGraph,
    manageOntology,
    deleteEpisode,
    cloneGraph,
    setUserSummaryInstructions,
    getUserThreads
  ],
  triggers: [graphEvent, byomEvent]
});
