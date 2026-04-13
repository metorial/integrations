import { Slate } from 'slates';
import { spec } from './spec';
import {
  runActor,
  getRun,
  listActors,
  manageActor,
  listRuns,
  abortRun,
  manageTask,
  getDatasetItems,
  pushDatasetItems,
  manageKeyValueStore,
  manageSchedule,
  buildActor,
  manageWebhook,
} from './tools';
import {
  actorRunEvent,
  actorBuildEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    runActor,
    getRun,
    listActors,
    manageActor,
    listRuns,
    abortRun,
    manageTask,
    getDatasetItems,
    pushDatasetItems,
    manageKeyValueStore,
    manageSchedule,
    buildActor,
    manageWebhook,
  ],
  triggers: [
    actorRunEvent,
    actorBuildEvent,
  ],
});
