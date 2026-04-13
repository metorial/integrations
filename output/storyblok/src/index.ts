import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageStory,
  listStories,
  getStory,
  manageComponent,
  listComponents,
  manageAsset,
  listAssets,
  manageDatasource,
  manageDatasourceEntry,
  manageCollaborator,
  manageRelease,
  getSpaceInfo,
  listActivities,
} from './tools';
import {
  storyEvents,
  assetEvents,
  userEvents,
  releaseEvents,
  workflowEvents,
  datasourceEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageStory,
    listStories,
    getStory,
    manageComponent,
    listComponents,
    manageAsset,
    listAssets,
    manageDatasource,
    manageDatasourceEntry,
    manageCollaborator,
    manageRelease,
    getSpaceInfo,
    listActivities,
  ],
  triggers: [
    storyEvents,
    assetEvents,
    userEvents,
    releaseEvents,
    workflowEvents,
    datasourceEvents,
  ],
});
