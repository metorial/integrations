import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getAthleteProfile,
  updateAthlete,
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  getActivityStreams,
  exploreSegments,
  getSegment,
  starSegment,
  getSegmentEfforts,
  getRoute,
  listRoutes,
  getClub,
  listClubs,
  getGear
} from './tools';
import { activityEvent,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAthleteProfile,
    updateAthlete,
    listActivities,
    getActivity,
    createActivity,
    updateActivity,
    getActivityStreams,
    exploreSegments,
    getSegment,
    starSegment,
    getSegmentEfforts,
    getRoute,
    listRoutes,
    getClub,
    listClubs,
    getGear
  ],
  triggers: [
    inboundWebhook,
    activityEvent
  ]
});
