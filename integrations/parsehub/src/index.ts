import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  runProject,
  getRun,
  getRunData,
  cancelRun,
  deleteRun
} from './tools';
import { runStatusChanged } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listProjects, getProject, runProject, getRun, getRunData, cancelRun, deleteRun],
  triggers: [runStatusChanged]
});
