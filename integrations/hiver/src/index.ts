import { Slate } from 'slates';
import { spec } from './spec';
import {
  listInboxes,
  getInbox,
  listConversations,
  getConversation,
  updateConversation,
  searchUsers,
  searchTags
} from './tools';
import {
  conversationUpdated,
  newEmail,
  newConversation,
  noteCreated,
  csatReceived
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listInboxes.build(),
    getInbox.build(),
    listConversations.build(),
    getConversation.build(),
    updateConversation.build(),
    searchUsers.build(),
    searchTags.build()
  ],
  triggers: [
    conversationUpdated.build(),
    newEmail.build(),
    newConversation.build(),
    noteCreated.build(),
    csatReceived.build()
  ]
});
