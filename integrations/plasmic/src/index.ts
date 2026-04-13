import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryCmsItems,
  countCmsItems,
  createCmsItem,
  updateCmsItem,
  deleteCmsItem,
  publishCmsItem,
  renderComponent,
  getProjectModel,
  updateProject
} from './tools';
import { projectPublish, cmsPublish } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    queryCmsItems,
    countCmsItems,
    createCmsItem,
    updateCmsItem,
    deleteCmsItem,
    publishCmsItem,
    renderComponent,
    getProjectModel,
    updateProject
  ],
  triggers: [projectPublish, cmsPublish]
});
