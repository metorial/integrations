import { Slate } from 'slates';
import { spec } from './spec';
import {
  listExperiences,
  getExperience,
  publishExperience,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  trackUserEvent,
  getUserEvents,
  getGroupProfile,
  updateGroupProfile,
  listSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  manageSegmentMembers,
  listTags,
  getJobStatus,
  exportEvents
} from './tools';
import { experienceEvent, workflowEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listExperiences,
    getExperience,
    publishExperience,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    trackUserEvent,
    getUserEvents,
    getGroupProfile,
    updateGroupProfile,
    listSegments,
    createSegment,
    updateSegment,
    deleteSegment,
    manageSegmentMembers,
    listTags,
    getJobStatus,
    exportEvents
  ],
  triggers: [experienceEvent, workflowEvent]
});
