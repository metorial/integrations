import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageProject,
  listProjects,
  getProject,
  manageTask,
  listTasks,
  getTask,
  manageTaskList,
  manageTimeEntry,
  listTimeEntries,
  manageMilestone,
  listPeople,
  manageMessage,
  manageComment,
  manageNotebook,
  manageProjectPeople,
  getActivity
} from './tools';
import {
  taskEvents,
  projectEvents,
  milestoneEvents,
  timeEntryEvents,
  commentEvents,
  messageEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageProject,
    listProjects,
    getProject,
    manageTask,
    listTasks,
    getTask,
    manageTaskList,
    manageTimeEntry,
    listTimeEntries,
    manageMilestone,
    listPeople,
    manageMessage,
    manageComment,
    manageNotebook,
    manageProjectPeople,
    getActivity
  ],
  triggers: [
    taskEvents,
    projectEvents,
    milestoneEvents,
    timeEntryEvents,
    commentEvents,
    messageEvents
  ]
});
