import { SlateTool } from 'slates';
import { TypeformClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageWorkspace = SlateTool.create(spec, {
  name: 'Manage Workspace',
  key: 'manage_workspace',
  description: `Create, retrieve, update, or delete a Typeform workspace. Workspaces organize forms and support team collaboration. You can rename workspaces, add or remove members, and move forms between workspaces.`,
  instructions: [
    'To **create**, provide just the **name**.',
    'To **retrieve**, provide the **workspaceId**.',
    'To **update** (rename, add/remove members), provide **workspaceId** and the relevant update fields.',
    'To **delete**, set **delete** to true and provide the **workspaceId**.'
  ],
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      workspaceId: z
        .string()
        .optional()
        .describe('Workspace ID (required for retrieve, update, and delete)'),
      name: z.string().optional().describe('Workspace name (for create or rename)'),
      delete: z.boolean().optional().describe('Set to true to delete the workspace'),
      addMembers: z.array(z.string()).optional().describe('Email addresses of members to add'),
      removeMembers: z
        .array(z.string())
        .optional()
        .describe('Email addresses of members to remove')
    })
  )
  .output(
    z.object({
      workspaceId: z.string().optional().describe('Workspace ID'),
      name: z.string().optional().describe('Workspace name'),
      formCount: z.number().optional().describe('Number of forms in the workspace'),
      memberCount: z.number().optional().describe('Number of members in the workspace'),
      deleted: z.boolean().optional().describe('Whether the workspace was deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new TypeformClient({
      token: ctx.auth.token,
      baseUrl: ctx.config.baseUrl
    });

    // Delete
    if (ctx.input.delete && ctx.input.workspaceId) {
      await client.deleteWorkspace(ctx.input.workspaceId);
      return {
        output: {
          workspaceId: ctx.input.workspaceId,
          deleted: true
        },
        message: `Deleted workspace \`${ctx.input.workspaceId}\`.`
      };
    }

    // Create
    if (!ctx.input.workspaceId && ctx.input.name) {
      let result = await client.createWorkspace(ctx.input.name);
      return {
        output: {
          workspaceId: result.id,
          name: result.name,
          formCount: (result.forms?.items || []).length,
          memberCount: (result.members?.items || []).length
        },
        message: `Created workspace **${result.name}**.`
      };
    }

    // Update
    if (
      ctx.input.workspaceId &&
      (ctx.input.name || ctx.input.addMembers || ctx.input.removeMembers)
    ) {
      let operations: any[] = [];
      if (ctx.input.name) {
        operations.push({ op: 'replace', path: '/name', value: ctx.input.name });
      }
      if (ctx.input.addMembers) {
        for (let email of ctx.input.addMembers) {
          operations.push({ op: 'add', path: '/members', value: { email } });
        }
      }
      if (ctx.input.removeMembers) {
        for (let email of ctx.input.removeMembers) {
          operations.push({ op: 'remove', path: '/members', value: { email } });
        }
      }

      await client.updateWorkspace(ctx.input.workspaceId, operations);

      let result = await client.getWorkspace(ctx.input.workspaceId);
      return {
        output: {
          workspaceId: result.id,
          name: result.name,
          formCount: (result.forms?.items || []).length,
          memberCount: (result.members?.items || []).length
        },
        message: `Updated workspace **${result.name}**.`
      };
    }

    // Retrieve
    if (ctx.input.workspaceId) {
      let result = await client.getWorkspace(ctx.input.workspaceId);
      return {
        output: {
          workspaceId: result.id,
          name: result.name,
          formCount: (result.forms?.items || []).length,
          memberCount: (result.members?.items || []).length
        },
        message: `Retrieved workspace **${result.name}** with **${(result.forms?.items || []).length}** forms.`
      };
    }

    throw new Error(
      'Provide either a name to create a workspace, or a workspaceId to retrieve/update/delete one.'
    );
  })
  .build();
