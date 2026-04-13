import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  manageUserAliases,
  listGroups,
  manageGroup,
  manageGroupMembers,
  manageOrgUnits,
  manageRoles,
  manageChromeOsDevices,
  manageMobileDevices,
  manageDomains,
  getActivityReports,
  getUsageReports,
  manageAlerts,
  manageCalendarResources,
  manageLicenses,
  transferData,
  getCustomerInfo
} from './tools';
import {
  userChanges,
  activityEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    manageUserAliases,
    listGroups,
    manageGroup,
    manageGroupMembers,
    manageOrgUnits,
    manageRoles,
    manageChromeOsDevices,
    manageMobileDevices,
    manageDomains,
    getActivityReports,
    getUsageReports,
    manageAlerts,
    manageCalendarResources,
    manageLicenses,
    transferData,
    getCustomerInfo
  ],
  triggers: [
    userChanges,
    activityEvents
  ]
});
