import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchUsersTool,
  getUserTool,
  createUserTool,
  updateUserTool,
  deleteUserTool,
  manageUserRolesTool,
  manageRolesTool,
  manageConnectionsTool,
  manageApplicationsTool,
  manageOrganizationsTool,
  manageOrganizationMembersTool,
  getLogsTool,
  manageResourceServersTool,
  manageActionsTool,
  manageClientGrantsTool
} from './tools';
import { logEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchUsersTool,
    getUserTool,
    createUserTool,
    updateUserTool,
    deleteUserTool,
    manageUserRolesTool,
    manageRolesTool,
    manageConnectionsTool,
    manageApplicationsTool,
    manageOrganizationsTool,
    manageOrganizationMembersTool,
    getLogsTool,
    manageResourceServersTool,
    manageActionsTool,
    manageClientGrantsTool
  ],
  triggers: [logEventsTrigger]
});
