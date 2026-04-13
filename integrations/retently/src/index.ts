import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageCustomers,
  getCustomers,
  sendSurvey,
  getFeedback,
  annotateFeedback,
  getScore,
  getCampaigns,
  getCompanies,
  getReports,
  getTrends,
  getOutbox,
  manageSuppressions,
  unsubscribeCustomers
} from './tools';
import {
  surveyWebhook,
  newFeedback
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageCustomers,
    getCustomers,
    sendSurvey,
    getFeedback,
    annotateFeedback,
    getScore,
    getCampaigns,
    getCompanies,
    getReports,
    getTrends,
    getOutbox,
    manageSuppressions,
    unsubscribeCustomers
  ],
  triggers: [
    surveyWebhook,
    newFeedback
  ]
});
