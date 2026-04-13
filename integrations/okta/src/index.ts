import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsersTool,
  getUserTool,
  createUserTool,
  updateUserTool,
  userLifecycleTool,
  listGroupsTool,
  manageGroupTool,
  manageGroupMembershipTool,
  listApplicationsTool,
  manageAppAssignmentTool,
  querySystemLogTool,
  listPoliciesTool,
  manageUserFactorsTool
} from './tools';
import { eventHookTrigger, systemLogPollTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsersTool,
    getUserTool,
    createUserTool,
    updateUserTool,
    userLifecycleTool,
    listGroupsTool,
    manageGroupTool,
    manageGroupMembershipTool,
    listApplicationsTool,
    manageAppAssignmentTool,
    querySystemLogTool,
    listPoliciesTool,
    manageUserFactorsTool
  ],
  triggers: [eventHookTrigger, systemLogPollTrigger]
});
