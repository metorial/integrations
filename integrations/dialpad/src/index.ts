import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsersTool,
  getUserTool,
  manageUserTool,
  listContactsTool,
  manageContactTool,
  sendSmsTool,
  initiateCallTool,
  listCallsTool,
  manageCallTool,
  listCallCentersTool,
  manageCallCenterTool,
  managePhoneNumberTool,
  listOfficesTool,
  manageBlockedNumberTool,
  getCompanyTool
} from './tools';
import { callEventTrigger, smsEventTrigger, contactEventTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsersTool,
    getUserTool,
    manageUserTool,
    listContactsTool,
    manageContactTool,
    sendSmsTool,
    initiateCallTool,
    listCallsTool,
    manageCallTool,
    listCallCentersTool,
    manageCallCenterTool,
    managePhoneNumberTool,
    listOfficesTool,
    manageBlockedNumberTool,
    getCompanyTool
  ],
  triggers: [callEventTrigger, smsEventTrigger, contactEventTrigger]
});
