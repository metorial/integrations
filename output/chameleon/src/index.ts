import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchProfiles,
  getProfile,
  deleteProfile,
  listCompanies,
  deleteCompany,
  listTours,
  updateTour,
  listMicrosurveys,
  updateMicrosurvey,
  listSurveyResponses,
  listSegments,
  listTourInteractions,
  manageDeliveries,
  listExperiences,
  updateExperience,
  manageDomains,
  manageEnvironments,
  manageWebhooks,
  listTags,
} from './tools';
import {
  tourEvents,
  microsurveyEvents,
  helpbarEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchProfiles,
    getProfile,
    deleteProfile,
    listCompanies,
    deleteCompany,
    listTours,
    updateTour,
    listMicrosurveys,
    updateMicrosurvey,
    listSurveyResponses,
    listSegments,
    listTourInteractions,
    manageDeliveries,
    listExperiences,
    updateExperience,
    manageDomains,
    manageEnvironments,
    manageWebhooks,
    listTags,
  ],
  triggers: [
    tourEvents,
    microsurveyEvents,
    helpbarEvents,
  ],
});
