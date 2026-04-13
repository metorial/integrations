export { sendEmail } from './send-email';
export { subscribeEmail } from './subscribe-email';
export { validateEmail } from './validate-email';
export { upsertTemplate, getTemplate, listTemplates, deleteTemplate } from './manage-template';
export {
  addSuppression,
  getSuppression,
  listSuppressions,
  deleteSuppression
} from './manage-suppression';
export {
  getDomainDnsRecords,
  validateDomain,
  listDomains,
  deleteDomain
} from './manage-domain';
export { listTags, deleteTag } from './manage-tags';
export { getSystemInfo } from './get-system-info';
export {
  createEventDump,
  getEventDump,
  listEventDumps,
  deleteEventDump
} from './manage-event-dump';
export { createProject, updateProject, listProjects, deleteProject } from './manage-project';
