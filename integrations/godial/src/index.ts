import { Slate } from 'slates';
import { spec } from './spec';
import {
  listLists,
  listContacts,
  addContact,
  addMember,
  listAccounts,
  removeAccount,
  listTeams
} from './tools';
import { callCompleted, contactUpdated } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listLists,
    listContacts,
    addContact,
    addMember,
    listAccounts,
    removeAccount,
    listTeams
  ],
  triggers: [callCompleted, contactUpdated]
});
