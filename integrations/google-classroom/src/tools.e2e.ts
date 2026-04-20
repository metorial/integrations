import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { z } from 'zod';
import { provider } from './index';
import { ClassroomClient } from './lib/client';

type GoogleClassroomFixtures = {
  studentUserId?: string;
};

type GoogleClassroomHelpers = {
  getClient(): ClassroomClient;
};

let wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let hasStudentFixture = (ctx: { fixtures: GoogleClassroomFixtures }) =>
  typeof ctx.fixtures.studentUserId === 'string' && ctx.fixtures.studentUserId.length > 0;

let logStudentFixtureSkip = (scenarioName: string) => {
  console.log(
    `[google-classroom e2e] Skipping ${scenarioName}: requires ` +
      'SLATES_E2E_FIXTURES with studentUserId.'
  );
};

let isRubricLicenseError = (error: unknown) => {
  let message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('@UserIneligibleToModifyRubrics') ||
    message.includes('license requirements') ||
    message.includes('Request failed with status code 403') ||
    message.includes('Internal server error')
  );
};

let logRubricLicenseSkip = () => {
  console.log(
    '[google-classroom e2e] Skipping manage_rubrics: rubrics require eligible ' +
      'Google Workspace for Education Plus licenses for both the requester and ' +
      'the course owner.'
  );
};

let isCourseDeleteCapabilityError = (error: unknown) => {
  let message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('@CourseStateDenied') ||
    message.includes('Precondition check failed') ||
    message.includes('Internal server error') ||
    message.includes('Request failed with status code 403') ||
    message.includes('Request failed with status code 400')
  );
};

let logDeleteCourseSkip = () => {
  console.log(
    '[google-classroom e2e] Skipping delete_course: this account cannot delete ' +
      'suite-created Classroom courses through the API.'
  );
};

let isNotFoundError = (error: unknown) => {
  let message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Requested entity was not found.') ||
    message.includes('NOT_FOUND')
  );
};

let isForbiddenError = (error: unknown) => {
  let message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('status code 403') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('Forbidden')
  );
};

let expectSome = (
  items: Array<Record<string, any>> | undefined,
  predicate: (item: Record<string, any>) => boolean,
  message: string
) => {
  if (!items?.some(predicate)) {
    throw new Error(message);
  }
};

let createFixtureEmail = (runId: string, prefix: string) => {
  let normalized = runId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(-32);

  return `${prefix}.${normalized || 'e2e'}@example.com`;
};

let createRubricCriteria = (runId: string, label: string) => [
  {
    title: `${runId} ${label} criterion`,
    description: `Rubric ${label} criteria for ${runId}`,
    levels: [
      {
        title: `${label} excellent`,
        description: 'Exceeds expectations',
        points: 4
      },
      {
        title: `${label} sufficient`,
        description: 'Meets expectations',
        points: 2
      }
    ]
  }
];

export let googleClassroomToolE2E = defineSlateToolE2EIntegration<
  GoogleClassroomFixtures,
  GoogleClassroomHelpers
>({
  fixturesSchema: z.object({
    studentUserId: z.string().optional()
  }),
  createHelpers: ctx => ({
    getClient: () => new ClassroomClient({ token: String(ctx.auth.token) })
  }),
  resources: {
    student: {
      fromFixture: ctx => ({
        studentId: ctx.fixtures.studentUserId,
        userId: ctx.fixtures.studentUserId,
        __missingStudentFixture: !hasStudentFixture(ctx)
      })
    },
    course: {
      create: async ctx => {
        let input = {
          name: ctx.namespaced('course'),
          section: 'E2E',
          description: `Created by ${ctx.runId}`,
          courseState: 'PROVISIONED' as const
        };
        let result = await ctx.invokeTool('create_course', input);
        return {
          ...result.output,
          description: input.description
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.courseId === 'string') {
            try {
              await ctx.helpers.getClient().deleteCourse(value.courseId);
            } catch (error) {
              if (
                !isNotFoundError(error) &&
                !isForbiddenError(error) &&
                !isCourseDeleteCapabilityError(error)
              ) {
                throw error;
              }
            }
          }
        }
      }
    },
    student_membership: {
      use: ['course', 'student'],
      create: async ctx => {
        let student = ctx.resource('student');
        if (student.__missingStudentFixture) {
          return {
            __missingStudentFixture: true
          };
        }

        let courseId = String(ctx.resource('course').courseId);
        let userId = String(student.studentId);
        let result = await ctx.invokeTool('manage_roster', {
          courseId,
          action: 'add_student',
          userId
        });

        return {
          courseId,
          userId,
          studentId: userId,
          ...(result.output.member ?? {})
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (value.courseId && value.userId) {
            await ctx.helpers.getClient().removeStudent(
              String(value.courseId),
              String(value.userId)
            );
          }
        }
      }
    },
    invitation: {
      use: ['course', 'student'],
      create: async ctx => {
        let student = ctx.resource('student');
        if (student.__missingStudentFixture) {
          return {
            __missingStudentFixture: true
          };
        }

        let courseId = String(ctx.resource('course').courseId);
        let userId = String(student.studentId);
        let result = await ctx.invokeTool('manage_invitations', {
          action: 'create',
          courseId,
          userId,
          role: 'STUDENT'
        });
        let invitation = result.output.invitation;
        if (!invitation?.invitationId) {
          throw new Error('manage_invitations create did not return an invitationId.');
        }

        return {
          ...invitation,
          courseId,
          userId,
          invitationId: String(invitation.invitationId)
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.invitationId === 'string') {
            await ctx.helpers.getClient().deleteInvitation(value.invitationId);
          }
        }
      }
    },
    course_work: {
      use: ['course'],
      create: async ctx => {
        let courseId = String(ctx.resource('course').courseId);
        let result = await ctx.invokeTool('create_coursework', {
          courseId,
          title: ctx.namespaced('assignment'),
          description: `Created by ${ctx.runId}`,
          workType: 'ASSIGNMENT',
          state: 'PUBLISHED',
          maxPoints: 100
        });
        if (!result.output.courseWorkId) {
          throw new Error('create_coursework did not return a courseWorkId.');
        }

        return {
          ...result.output,
          courseId
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (value.courseId && value.courseWorkId) {
            try {
              await ctx.helpers.getClient().deleteCourseWork(
                String(value.courseId),
                String(value.courseWorkId)
              );
            } catch (error) {
              if (!isNotFoundError(error)) {
                throw error;
              }
            }
          }
        }
      }
    },
    announcement: {
      use: ['course'],
      create: async ctx => {
        let courseId = String(ctx.resource('course').courseId);
        let text = ctx.namespaced('announcement');
        let result = await ctx.invokeTool('manage_announcements', {
          courseId,
          action: 'create',
          text,
          state: 'PUBLISHED'
        });
        let announcement = result.output.announcement;
        if (!announcement?.announcementId) {
          throw new Error('manage_announcements create did not return an announcementId.');
        }

        return {
          ...announcement,
          courseId,
          text
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (value.courseId && value.announcementId) {
            await ctx.helpers.getClient().deleteAnnouncement(
              String(value.courseId),
              String(value.announcementId)
            );
          }
        }
      }
    },
    topic: {
      use: ['course'],
      create: async ctx => {
        let courseId = String(ctx.resource('course').courseId);
        let result = await ctx.invokeTool('manage_topics', {
          courseId,
          action: 'create',
          name: ctx.namespaced('topic')
        });
        let topic = result.output.topic;
        if (!topic?.topicId) {
          throw new Error('manage_topics create did not return a topicId.');
        }

        return {
          ...topic,
          courseId
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (value.courseId && value.topicId) {
            await ctx.helpers.getClient().deleteTopic(
              String(value.courseId),
              String(value.topicId)
            );
          }
        }
      }
    },
    material: {
      use: ['course'],
      create: async ctx => {
        let courseId = String(ctx.resource('course').courseId);
        let result = await ctx.invokeTool('manage_coursework_materials', {
          courseId,
          action: 'create',
          title: ctx.namespaced('material'),
          description: `Created by ${ctx.runId}`,
          state: 'PUBLISHED',
          materials: [
            {
              link: {
                url: 'https://example.com/slates-e2e',
                title: 'Slates E2E'
              }
            }
          ]
        });
        let material = result.output.material;
        if (!material?.courseWorkMaterialId) {
          throw new Error(
            'manage_coursework_materials create did not return a courseWorkMaterialId.'
          );
        }

        return {
          ...material,
          courseId
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (value.courseId && value.courseWorkMaterialId) {
            await ctx.helpers.getClient().deleteCourseWorkMaterial(
              String(value.courseId),
              String(value.courseWorkMaterialId)
            );
          }
        }
      }
    },
    guardian_invitation: {
      use: ['student'],
      create: async ctx => {
        let student = ctx.resource('student');
        if (student.__missingStudentFixture) {
          return {
            __missingStudentFixture: true
          };
        }

        let studentId = String(student.studentId);
        let invitedEmailAddress = createFixtureEmail(ctx.runId, 'guardian');
        let result = await ctx.invokeTool('manage_guardians', {
          studentId,
          action: 'invite',
          invitedEmailAddress
        });
        let invitation = result.output.invitation;
        if (!invitation?.invitationId) {
          throw new Error('manage_guardians invite did not return an invitationId.');
        }

        return {
          ...invitation,
          studentId,
          invitedEmailAddress,
          invitationId: String(invitation.invitationId)
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (value.studentId && value.invitationId) {
            await ctx.helpers.getClient().patchGuardianInvitation(
              String(value.studentId),
              String(value.invitationId),
              'COMPLETE'
            );
          }
        }
      }
    },
    rubric: {
      use: ['course_work'],
      create: async ctx => {
        let courseWork = ctx.resource('course_work');
        let result = await ctx.invokeTool('manage_rubrics', {
          courseId: String(courseWork.courseId),
          courseWorkId: String(courseWork.courseWorkId),
          action: 'create',
          criteria: createRubricCriteria(ctx.runId, 'initial')
        });
        let rubric = result.output.rubric;
        if (!rubric?.rubricId) {
          throw new Error('manage_rubrics create did not return a rubricId.');
        }

        return {
          ...rubric,
          courseId: String(courseWork.courseId),
          courseWorkId: String(courseWork.courseWorkId),
          rubricId: String(rubric.rubricId)
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (value.courseId && value.courseWorkId && value.rubricId) {
            await ctx.helpers.getClient().deleteRubric(
              String(value.courseId),
              String(value.courseWorkId),
              String(value.rubricId)
            );
          }
        }
      }
    }
  },
  scenarioOverrides: {
    create_course: {
      name: 'create_course creates a live course',
      use: ['course'],
      run: async () => {}
    },
    delete_course: {
      name: 'delete_course',
      use: ['course'],
      run: async ctx => {
        let courseId = String(ctx.resource('course').courseId);
        try {
          await ctx.invokeTool('delete_course', {
            courseId
          });
          ctx.deleteResource('course');
        } catch (error) {
          if (isCourseDeleteCapabilityError(error)) {
            logDeleteCourseSkip();
            return;
          }
          throw error;
        }
      }
    },
    list_roster: {
      name: 'list_roster returns the tracked student membership',
      use: ['course', 'student_membership'],
      run: async ctx => {
        if (!hasStudentFixture(ctx)) {
          logStudentFixtureSkip('list_roster');
          return;
        }

        let courseId = String(ctx.resource('course').courseId);
        let studentId = String(ctx.resource('student_membership').userId);
        let result = await ctx.invokeTool('list_roster', {
          courseId,
          role: 'both'
        });

        expectSome(
          result.output.students,
          candidate => candidate.userId === studentId,
          `list_roster did not include student ${studentId}.`
        );
      }
    },
    manage_roster: {
      name: 'manage_roster removes, re-adds, and removes the tracked student',
      use: ['course', 'student', 'student_membership'],
      run: async ctx => {
        if (!hasStudentFixture(ctx)) {
          logStudentFixtureSkip('manage_roster');
          return;
        }

        let courseId = String(ctx.resource('course').courseId);
        let userId = String(ctx.resource('student').studentId);

        await ctx.invokeTool('manage_roster', {
          courseId,
          action: 'remove_student',
          userId
        });

        let add = await ctx.invokeTool('manage_roster', {
          courseId,
          action: 'add_student',
          userId
        });
        if (!add.output.success) {
          throw new Error('manage_roster add_student did not report success.');
        }

        await ctx.invokeTool('manage_roster', {
          courseId,
          action: 'remove_student',
          userId
        });
        ctx.deleteResource('student_membership');
      }
    },
    manage_invitations: {
      name: 'manage_invitations lists and deletes the tracked invitation',
      use: ['invitation'],
      run: async ctx => {
        if (!hasStudentFixture(ctx)) {
          logStudentFixtureSkip('manage_invitations');
          return;
        }

        let invitation = ctx.resource('invitation');
        let courseId = String(invitation.courseId);
        let userId = String(invitation.userId);
        let invitationId = String(invitation.invitationId);

        let list = await ctx.invokeTool('manage_invitations', {
          action: 'list',
          courseId,
          userId
        });

        expectSome(
          list.output.invitations,
          candidate => candidate.invitationId === invitationId,
          `manage_invitations did not include invitation ${invitationId}.`
        );

        await ctx.invokeTool('manage_invitations', {
          action: 'delete',
          invitationId
        });
        ctx.deleteResource('invitation');
      }
    },
    list_coursework: {
      name: 'list_coursework returns the tracked coursework item',
      use: ['course', 'course_work'],
      run: async ctx => {
        let course = ctx.resource('course');
        let courseWork = ctx.resource('course_work');
        let result = await ctx.invokeTool('list_coursework', {
          courseId: String(course.courseId)
        });

        expectSome(
          result.output.courseWork,
          candidate => candidate.courseWorkId === String(courseWork.courseWorkId),
          `list_coursework did not include coursework ${String(courseWork.courseWorkId)}.`
        );
      }
    },
    create_coursework: {
      name: 'create_coursework creates published coursework',
      use: ['course_work'],
      run: async () => {}
    },
    manage_submissions: {
      name: 'manage_submissions lists and grades the tracked student submission',
      use: ['student_membership', 'course_work'],
      run: async ctx => {
        if (!hasStudentFixture(ctx)) {
          logStudentFixtureSkip('manage_submissions');
          return;
        }

        let courseWork = ctx.resource('course_work');
        let courseId = String(courseWork.courseId);
        let courseWorkId = String(courseWork.courseWorkId);
        let studentId = String(ctx.resource('student_membership').userId);

        let submission: Record<string, any> | undefined;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          let list = await ctx.invokeTool('manage_submissions', {
            courseId,
            courseWorkId,
            action: 'list',
            userId: studentId
          });
          submission = list.output.submissions?.find(
            (candidate: Record<string, any>) => candidate.userId === studentId
          );
          if (submission?.submissionId) {
            break;
          }
          await wait(1000 * (attempt + 1));
        }

        if (!submission?.submissionId) {
          throw new Error(`manage_submissions did not return a submission for ${studentId}.`);
        }

        let grade = await ctx.invokeTool('manage_submissions', {
          courseId,
          courseWorkId,
          action: 'grade',
          submissionId: String(submission.submissionId),
          draftGrade: 88
        });

        if (grade.output.submission?.draftGrade !== 88) {
          throw new Error('manage_submissions grade did not persist draftGrade 88.');
        }
      }
    },
    manage_announcements: {
      name: 'manage_announcements gets, lists, updates, and deletes an announcement',
      use: ['announcement'],
      run: async ctx => {
        let announcement = ctx.resource('announcement');
        let courseId = String(announcement.courseId);
        let announcementId = String(announcement.announcementId);

        let get = await ctx.invokeTool('manage_announcements', {
          courseId,
          action: 'get',
          announcementId
        });
        if (get.output.announcement?.announcementId !== announcementId) {
          throw new Error('manage_announcements get did not return the tracked announcement.');
        }

        let list = await ctx.invokeTool('manage_announcements', {
          courseId,
          action: 'list'
        });
        expectSome(
          list.output.announcements,
          candidate => candidate.announcementId === announcementId,
          `manage_announcements did not include announcement ${announcementId}.`
        );

        let updatedText = ctx.namespaced('announcement updated');
        let update = await ctx.invokeTool('manage_announcements', {
          courseId,
          action: 'update',
          announcementId,
          text: updatedText
        });
        if (update.output.announcement?.text !== updatedText) {
          throw new Error('manage_announcements update did not return the new text.');
        }

        await ctx.invokeTool('manage_announcements', {
          courseId,
          action: 'delete',
          announcementId
        });
        ctx.deleteResource('announcement');
      }
    },
    manage_topics: {
      name: 'manage_topics gets, lists, updates, and deletes a topic',
      use: ['topic'],
      run: async ctx => {
        let topic = ctx.resource('topic');
        let courseId = String(topic.courseId);
        let topicId = String(topic.topicId);

        let get = await ctx.invokeTool('manage_topics', {
          courseId,
          action: 'get',
          topicId
        });
        if (get.output.topic?.topicId !== topicId) {
          throw new Error('manage_topics get did not return the tracked topic.');
        }

        let list = await ctx.invokeTool('manage_topics', {
          courseId,
          action: 'list'
        });
        expectSome(
          list.output.topics,
          candidate => candidate.topicId === topicId,
          `manage_topics did not include topic ${topicId}.`
        );

        let updatedName = ctx.namespaced('topic updated');
        let update = await ctx.invokeTool('manage_topics', {
          courseId,
          action: 'update',
          topicId,
          name: updatedName
        });
        if (update.output.topic?.name !== updatedName) {
          throw new Error('manage_topics update did not return the new topic name.');
        }

        await ctx.invokeTool('manage_topics', {
          courseId,
          action: 'delete',
          topicId
        });
        ctx.deleteResource('topic');
      }
    },
    manage_coursework_materials: {
      name: 'manage_coursework_materials gets, lists, updates, and deletes a material',
      use: ['material'],
      run: async ctx => {
        let material = ctx.resource('material');
        let courseId = String(material.courseId);
        let materialId = String(material.courseWorkMaterialId);

        let get = await ctx.invokeTool('manage_coursework_materials', {
          courseId,
          action: 'get',
          materialId
        });
        if (get.output.material?.courseWorkMaterialId !== materialId) {
          throw new Error(
            'manage_coursework_materials get did not return the tracked material.'
          );
        }

        let list = await ctx.invokeTool('manage_coursework_materials', {
          courseId,
          action: 'list'
        });
        expectSome(
          list.output.materials,
          candidate => candidate.courseWorkMaterialId === materialId,
          `manage_coursework_materials did not include material ${materialId}.`
        );

        let updatedTitle = ctx.namespaced('material updated');
        let update = await ctx.invokeTool('manage_coursework_materials', {
          courseId,
          action: 'update',
          materialId,
          title: updatedTitle
        });
        if (update.output.material?.title !== updatedTitle) {
          throw new Error('manage_coursework_materials update did not return the new title.');
        }

        await ctx.invokeTool('manage_coursework_materials', {
          courseId,
          action: 'delete',
          materialId
        });
        ctx.deleteResource('material');
      }
    },
    manage_guardians: {
      name: 'manage_guardians lists guardians, lists invitations, and cancels an invitation',
      use: ['student', 'guardian_invitation'],
      run: async ctx => {
        if (!hasStudentFixture(ctx)) {
          logStudentFixtureSkip('manage_guardians');
          return;
        }

        let studentId = String(ctx.resource('student').studentId);
        let invitation = ctx.resource('guardian_invitation');
        let invitationId = String(invitation.invitationId);

        await ctx.invokeTool('manage_guardians', {
          studentId,
          action: 'list'
        });

        let list = await ctx.invokeTool('manage_guardians', {
          studentId,
          action: 'list_invitations',
          invitedEmailAddress: String(invitation.invitedEmailAddress)
        });
        expectSome(
          list.output.invitations,
          candidate => candidate.invitationId === invitationId,
          `manage_guardians did not include invitation ${invitationId}.`
        );

        await ctx.invokeTool('manage_guardians', {
          studentId,
          action: 'cancel_invitation',
          invitationId
        });
        ctx.deleteResource('guardian_invitation');
      }
    },
    get_user_profile: {
      name: 'get_user_profile retrieves the authenticated user profile',
      run: async ctx => {
        let result = await ctx.invokeTool('get_user_profile', {
          userId: 'me'
        });

        if (!result.output.userId && !result.output.emailAddress) {
          throw new Error('get_user_profile did not return a userId or emailAddress.');
        }
      }
    },
    manage_rubrics: {
      name: 'manage_rubrics gets, lists, updates, and deletes a rubric',
      use: ['course_work'],
      run: async ctx => {
        let courseWork = ctx.resource('course_work');
        let courseId = String(courseWork.courseId);
        let courseWorkId = String(courseWork.courseWorkId);
        let rubricId: string | undefined;

        try {
          let created = await ctx.invokeTool('manage_rubrics', {
            courseId,
            courseWorkId,
            action: 'create',
            criteria: createRubricCriteria(ctx.runId, 'initial')
          });
          rubricId = created.output.rubric?.rubricId;
        } catch (error) {
          if (isRubricLicenseError(error)) {
            logRubricLicenseSkip();
            return;
          }
          throw error;
        }

        if (!rubricId) {
          throw new Error('manage_rubrics create did not return a rubricId.');
        }

        try {
          let get = await ctx.invokeTool('manage_rubrics', {
            courseId,
            courseWorkId,
            action: 'get',
            rubricId
          });
          if (get.output.rubric?.rubricId !== rubricId) {
            throw new Error('manage_rubrics get did not return the tracked rubric.');
          }

          let list = await ctx.invokeTool('manage_rubrics', {
            courseId,
            courseWorkId,
            action: 'list'
          });
          expectSome(
            list.output.rubrics,
            candidate => candidate.rubricId === rubricId,
            `manage_rubrics did not include rubric ${rubricId}.`
          );

          let criteria = createRubricCriteria(ctx.runId, 'updated');
          let update = await ctx.invokeTool('manage_rubrics', {
            courseId,
            courseWorkId,
            action: 'update',
            rubricId,
            criteria
          });
          if ((update.output.rubric?.criteria?.length ?? 0) !== criteria.length) {
            throw new Error('manage_rubrics update did not return the updated criteria.');
          }
        } finally {
          await ctx.invokeTool('manage_rubrics', {
            courseId,
            courseWorkId,
            action: 'delete',
            rubricId
          });
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleClassroomToolE2E
});
