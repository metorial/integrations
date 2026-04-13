import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConnections,
  listInteractions,
  listProductLines,
  listKnowledgeBaseQuestions,
  listAuthorizationRequests,
  getAuthorizationRequest,
  ignoreAuthorizationRequest,
  listAuthorizations,
  grantAuthorization,
  updateAuthorization,
  listAccessGroups,
  listFolders,
  createFolder,
  deleteFolder,
  listDocuments,
  updateDocument,
  deleteDocument,
  listQuestionnaires,
  submitQuestionnaire,
  createQuestionnaireRequest,
  updateQuestionnaireRequest,
  askQuestion
} from './tools';
import { accessRequested } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listConnections,
    listInteractions,
    listProductLines,
    listKnowledgeBaseQuestions,
    listAuthorizationRequests,
    getAuthorizationRequest,
    ignoreAuthorizationRequest,
    listAuthorizations,
    grantAuthorization,
    updateAuthorization,
    listAccessGroups,
    listFolders,
    createFolder,
    deleteFolder,
    listDocuments,
    updateDocument,
    deleteDocument,
    listQuestionnaires,
    submitQuestionnaire,
    createQuestionnaireRequest,
    updateQuestionnaireRequest,
    askQuestion
  ],
  triggers: [accessRequested]
});
