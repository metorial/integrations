import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  createBypassCodes,
  listGroups,
  createGroup,
  deleteGroup,
  listPhones,
  createPhone,
  deletePhone,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  listIntegrations,
  getAuthenticationLogs,
  getAdminLogs,
  getTelephonyLogs,
  getAccountSummary,
} from './tools';
import {
  authenticationEvents,
  adminActionEvents,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    createBypassCodes,
    listGroups,
    createGroup,
    deleteGroup,
    listPhones,
    createPhone,
    deletePhone,
    listAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    listIntegrations,
    getAuthenticationLogs,
    getAdminLogs,
    getTelephonyLogs,
    getAccountSummary,
  ],
  triggers: [
    inboundWebhook,
    authenticationEvents,
    adminActionEvents,
  ],
});
