import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { provider } from './index';

let createTaskInput = (
  ctx: { namespaced: (label: string) => string },
  taskListId: string,
  label: string,
  extra: Record<string, any> = {}
) => ({
  taskListId,
  title: ctx.namespaced(label),
  ...extra
});

export let googleTasksToolE2E = defineSlateToolE2EIntegration({
  resources: {
    task: {
      use: ['task_list'],
      create: async ctx => {
        let taskListId = String(ctx.resource('task_list').taskListId);
        let input = createTaskInput(ctx, taskListId, 'task seed', {
          notes: `Created by ${ctx.runId}`
        });
        let result = await ctx.invokeTool('create_task', input);

        return {
          ...result.output,
          taskListId
        };
      }
    }
  },
  scenarioOverrides: {
    create_task: {
      name: 'create_task creates a task in the disposable task list',
      use: ['task_list'],
      run: async ctx => {
        let taskListId = String(ctx.resource('task_list').taskListId);
        let input = createTaskInput(ctx, taskListId, 'task created', {
          notes: `Created by ${ctx.runId}`
        });
        let result = await ctx.invokeTool('create_task', input);

        return {
          provide: {
            task: {
              ...result.output,
              taskListId
            }
          }
        };
      }
    },
    move_task: {
      name: 'move_task reorders a task after another task in the same list',
      use: ['task'],
      run: async ctx => {
        let task = ctx.resource('task');
        let taskListId = String(task.taskListId);
        let taskId = String(task.taskId);

        let anchor = await ctx.invokeTool(
          'create_task',
          createTaskInput(ctx, taskListId, 'task anchor', {
            previousTaskId: taskId
          })
        );
        let anchorTaskId = String(anchor.output.taskId);

        let moved = await ctx.invokeTool('move_task', {
          taskListId,
          taskId,
          previousTaskId: anchorTaskId
        });

        let listed = await ctx.invokeTool('list_tasks', { taskListId });
        let anchorIndex = listed.output.tasks.findIndex(
          (candidate: { taskId?: string }) => candidate.taskId === anchorTaskId
        );
        let taskIndex = listed.output.tasks.findIndex(
          (candidate: { taskId?: string }) => candidate.taskId === taskId
        );

        if (anchorIndex === -1 || taskIndex === -1 || anchorIndex >= taskIndex) {
          throw new Error('move_task did not place the tracked task after the anchor task.');
        }

        ctx.updateResource('task', moved.output);
      }
    },
    clear_completed_tasks: {
      name: 'clear_completed_tasks removes completed tasks from default list results',
      use: ['task_list'],
      run: async ctx => {
        let taskListId = String(ctx.resource('task_list').taskListId);
        let completed = await ctx.invokeTool(
          'create_task',
          createTaskInput(ctx, taskListId, 'task completed', {
            status: 'completed'
          })
        );
        let completedTaskId = String(completed.output.taskId);

        let cleared = await ctx.invokeTool('clear_completed_tasks', { taskListId });
        if (!cleared.output.cleared) {
          throw new Error('clear_completed_tasks did not report success.');
        }

        let listed = await ctx.invokeTool('list_tasks', { taskListId });
        if (
          listed.output.tasks.some(
            (candidate: { taskId?: string }) => candidate.taskId === completedTaskId
          )
        ) {
          throw new Error('clear_completed_tasks did not remove the completed task.');
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleTasksToolE2E
});
