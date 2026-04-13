import { SlateTool } from 'slates';
import { ClassroomClient } from '../lib/client';
import { spec } from '../spec';
import { googleClassroomActionScopes } from '../scopes';
import { z } from 'zod';

export let deleteCourse = SlateTool.create(spec, {
  name: 'Delete Course',
  key: 'delete_course',
  description: `Delete a Google Classroom course. This permanently removes the course and all associated data. This action cannot be undone.`,
  tags: {
    destructive: true
  }
})
  .scopes(googleClassroomActionScopes.deleteCourse)
  .input(
    z.object({
      courseId: z.string().describe('ID of the course to delete')
    })
  )
  .output(
    z.object({
      success: z.boolean().describe('Whether the deletion was successful')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClassroomClient({ token: ctx.auth.token });

    await client.deleteCourse(ctx.input.courseId);

    return {
      output: { success: true },
      message: `Successfully deleted course \`${ctx.input.courseId}\`.`
    };
  })
  .build();
