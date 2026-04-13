import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getCodingSummaries,
  getCodingStats,
  getDurations,
  getHeartbeats,
  createHeartbeat,
  deleteHeartbeat,
  listProjects,
  getProjectCommits,
  getGoals,
  createExternalDuration,
  getLeaderboard,
  getPrivateLeaderboards,
  getUserProfile,
  getAllTime,
  getInsights,
  getOrganizations,
  getMachines,
  manageDataExports
} from './tools';
import {
  codingActivityTrigger,
  goalProgressTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getCodingSummaries,
    getCodingStats,
    getDurations,
    getHeartbeats,
    createHeartbeat,
    deleteHeartbeat,
    listProjects,
    getProjectCommits,
    getGoals,
    createExternalDuration,
    getLeaderboard,
    getPrivateLeaderboards,
    getUserProfile,
    getAllTime,
    getInsights,
    getOrganizations,
    getMachines,
    manageDataExports
  ],
  triggers: [
    inboundWebhook,
    codingActivityTrigger,
    goalProgressTrigger
  ]
});
