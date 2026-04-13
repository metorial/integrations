import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageProject,
  manageExperiment,
  manageAudience,
  manageFeatureFlag,
  manageCmpTask,
  manageCmpCampaign,
  manageCmpAsset,
  manageCmsContent,
  manageMailing,
  manageRecipientList,
  manageCustomer,
  sendOdpEvent
} from './tools';
import {
  cmpWebhook,
  campaignEmailWebhook,
  experimentationWebhook,
  graphWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageProject,
    manageExperiment,
    manageAudience,
    manageFeatureFlag,
    manageCmpTask,
    manageCmpCampaign,
    manageCmpAsset,
    manageCmsContent,
    manageMailing,
    manageRecipientList,
    manageCustomer,
    sendOdpEvent
  ],
  triggers: [cmpWebhook, campaignEmailWebhook, experimentationWebhook, graphWebhook]
});
