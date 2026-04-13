import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEmailLists,
  manageEmailList,
  listSubscribers,
  manageSubscriber,
  manageSubscriberTags,
  listCampaigns,
  manageCampaign,
  sendCampaign,
  getCampaignAnalytics,
  manageTemplate,
  sendTransactionalEmail,
  manageTag,
  manageSegment,
  manageSuppression,
  importSubscribers,
} from './tools';
import { mailcoachEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listEmailLists.build(),
    manageEmailList.build(),
    listSubscribers.build(),
    manageSubscriber.build(),
    manageSubscriberTags.build(),
    listCampaigns.build(),
    manageCampaign.build(),
    sendCampaign.build(),
    getCampaignAnalytics.build(),
    manageTemplate.build(),
    sendTransactionalEmail.build(),
    manageTag.build(),
    manageSegment.build(),
    manageSuppression.build(),
    importSubscribers.build(),
  ],
  triggers: [
    mailcoachEvents.build(),
  ],
});
