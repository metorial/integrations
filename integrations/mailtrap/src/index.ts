import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendTransactionalEmail,
  sendBulkEmail,
  manageContact,
  manageContactList,
  listSandboxMessages,
  getSandboxMessage,
  listSandboxProjects,
  manageSendingDomain,
  manageSuppressions,
  getEmailStats,
  listEmailLogs,
  getEmailLog,
  listAccounts
} from './tools';
import { emailEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendTransactionalEmail,
    sendBulkEmail,
    manageContact,
    manageContactList,
    listSandboxMessages,
    getSandboxMessage,
    listSandboxProjects,
    manageSendingDomain,
    manageSuppressions,
    getEmailStats,
    listEmailLogs,
    getEmailLog,
    listAccounts
  ],
  triggers: [emailEvent]
});
