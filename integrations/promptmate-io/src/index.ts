import { Slate } from 'slates';
import { spec } from './spec';
import { listApps, getApp, runJob, getJob, getAppResults, listTemplates, useTemplate, listReferenceData, listProjects, getUserInfo } from './tools';
import { jobCompleted, rowCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listApps, getApp, runJob, getJob, getAppResults, listTemplates, useTemplate, listReferenceData, listProjects, getUserInfo],
  triggers: [jobCompleted, rowCompleted],
});
