import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  listRoster,
  manageRoster,
  manageInvitations,
  listCoursework,
  createCoursework,
  manageSubmissions,
  manageAnnouncements,
  manageTopics,
  manageCourseworkMaterials,
  manageGuardians,
  getUserProfile,
  manageRubrics,
} from './tools';
import {
  courseRosterChanges,
  courseworkChanges,
  announcementChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    listRoster,
    manageRoster,
    manageInvitations,
    listCoursework,
    createCoursework,
    manageSubmissions,
    manageAnnouncements,
    manageTopics,
    manageCourseworkMaterials,
    manageGuardians,
    getUserProfile,
    manageRubrics,
  ],
  triggers: [
    inboundWebhook,
    courseRosterChanges,
    courseworkChanges,
    announcementChanges,
  ],
});
