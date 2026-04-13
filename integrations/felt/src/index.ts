import { Slate } from 'slates';
import { spec } from './spec';
import {
  createMap,
  getMap,
  updateMap,
  deleteMap,
  moveMap,
  duplicateMap,
  listLayers,
  manageLayer,
  importLayer,
  exportLayer,
  listElements,
  manageElements,
  manageComments,
  listProjects,
  manageProject,
  listSources,
  manageSource,
  createEmbedToken,
  getCurrentUser
} from './tools';
import { mapUpdated } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createMap,
    getMap,
    updateMap,
    deleteMap,
    moveMap,
    duplicateMap,
    listLayers,
    manageLayer,
    importLayer,
    exportLayer,
    listElements,
    manageElements,
    manageComments,
    listProjects,
    manageProject,
    listSources,
    manageSource,
    createEmbedToken,
    getCurrentUser
  ],
  triggers: [mapUpdated]
});
