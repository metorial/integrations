import { Slate } from 'slates';
import { spec } from './spec';
import {
  listMembers,
  getMember,
  inviteMember,
  updateMember,
  removeMember,
  reinviteMember,
  revokeRestoreMember,
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  listCollections,
  updateCollection,
  deleteCollection,
  listPolicies,
  updatePolicy,
  queryEvents,
  importOrganization
} from './tools';
import { organizationEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listMembers,
    getMember,
    inviteMember,
    updateMember,
    removeMember,
    reinviteMember,
    revokeRestoreMember,
    listGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    listCollections,
    updateCollection,
    deleteCollection,
    listPolicies,
    updatePolicy,
    queryEvents,
    importOrganization
  ],
  triggers: [inboundWebhook, organizationEvents]
});
