import { Slate } from 'slates';
import { spec } from './spec';
import {
  getFormAnswers,
  updateFormAnswer,
  listLocations,
  createLocation,
  updateLocation,
  getListElements,
  createListElement,
  updateListElement,
  createList,
  bulkUpdateListElements,
  assignTask,
  getNotifications,
  getGeneratedFiles,
} from './tools';
import { formSubmission } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getFormAnswers,
    updateFormAnswer,
    listLocations,
    createLocation,
    updateLocation,
    getListElements,
    createListElement,
    updateListElement,
    createList,
    bulkUpdateListElements,
    assignTask,
    getNotifications,
    getGeneratedFiles,
  ],
  triggers: [
    formSubmission,
  ],
});
