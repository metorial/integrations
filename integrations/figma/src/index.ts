import { Slate } from 'slates';
import { spec } from './spec';
import {
  getFile,
  exportImages,
  getImageFills,
  listComments,
  postComment,
  deleteComment,
  getFileVersions,
  listTeamProjects,
  listProjectFiles,
  getComponents,
  getStyles,
  getUser,
  getVariables,
  updateVariables,
  getDevResources,
  createDevResource,
  deleteDevResource
} from './tools';
import { fileEvents, commentEvents, libraryPublish, devModeStatusEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getFile,
    exportImages,
    getImageFills,
    listComments,
    postComment,
    deleteComment,
    getFileVersions,
    listTeamProjects,
    listProjectFiles,
    getComponents,
    getStyles,
    getUser,
    getVariables,
    updateVariables,
    getDevResources,
    createDevResource,
    deleteDevResource
  ],
  triggers: [fileEvents, commentEvents, libraryPublish, devModeStatusEvents]
});
