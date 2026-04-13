import { Slate } from 'slates';
import { spec } from './spec';
import {
  listServices,
  createService,
  updateService,
  deleteService,
  manageServiceUsers,
  manageServiceQuestions,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listDatabases,
  createDatabase,
  updateDatabase,
  deleteDatabase,
  searchDatabaseValues,
  manageDatabaseValues,
  retrieveScans,
  deleteScans,
  listQuestions,
  createQuestion,
  deleteQuestion,
  manageQuestionAnswers,
  listDevices,
  updateDevice,
  generateBarcode
} from './tools';
import { newScans, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listServices,
    createService,
    updateService,
    deleteService,
    manageServiceUsers,
    manageServiceQuestions,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    listDatabases,
    createDatabase,
    updateDatabase,
    deleteDatabase,
    searchDatabaseValues,
    manageDatabaseValues,
    retrieveScans,
    deleteScans,
    listQuestions,
    createQuestion,
    deleteQuestion,
    manageQuestionAnswers,
    listDevices,
    updateDevice,
    generateBarcode
  ],
  triggers: [inboundWebhook, newScans]
});
