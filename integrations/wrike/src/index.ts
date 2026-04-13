import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listFolders,
  createFolder,
  updateFolder,
  listComments,
  createComment,
  deleteComment,
  listTimelogs,
  createTimelog,
  updateTimelog,
  deleteTimelog,
  listContacts,
  listSpaces,
  listWorkflows,
  listCustomFields,
  createCustomField,
  listDependencies,
  createDependency,
  deleteDependency,
  listAttachments
} from './tools';
import { taskEvents, folderEvents, approvalEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTasks,
    createTask,
    updateTask,
    deleteTask,
    listFolders,
    createFolder,
    updateFolder,
    listComments,
    createComment,
    deleteComment,
    listTimelogs,
    createTimelog,
    updateTimelog,
    deleteTimelog,
    listContacts,
    listSpaces,
    listWorkflows,
    listCustomFields,
    createCustomField,
    listDependencies,
    createDependency,
    deleteDependency,
    listAttachments
  ],
  triggers: [taskEvents, folderEvents, approvalEvents]
});
