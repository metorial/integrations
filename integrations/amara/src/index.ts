import { Slate } from 'slates';
import { spec } from './spec';
import {
  listVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  listSubtitleLanguages,
  getSubtitles,
  uploadSubtitles,
  deleteSubtitles,
  subtitleActions,
  subtitleNotes,
  listTeams,
  manageTeam,
  listTeamMembers,
  manageTeamMember,
  listProjects,
  manageProject,
  manageApplication,
  teamLanguages,
  listSubtitleRequests,
  manageSubtitleRequest,
  getActivity,
  getUser,
  sendMessage,
  listLanguages
} from './tools';
import { teamActivity, teamNotifications, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listVideos,
    getVideo,
    createVideo,
    updateVideo,
    deleteVideo,
    listSubtitleLanguages,
    getSubtitles,
    uploadSubtitles,
    deleteSubtitles,
    subtitleActions,
    subtitleNotes,
    listTeams,
    manageTeam,
    listTeamMembers,
    manageTeamMember,
    listProjects,
    manageProject,
    manageApplication,
    teamLanguages,
    listSubtitleRequests,
    manageSubtitleRequest,
    getActivity,
    getUser,
    sendMessage,
    listLanguages
  ],
  triggers: [inboundWebhook, teamActivity, teamNotifications]
});
