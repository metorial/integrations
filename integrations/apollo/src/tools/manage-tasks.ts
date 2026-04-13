import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let searchTasks = SlateTool.create(spec, {
  name: 'Search Tasks',
  key: 'search_tasks',
  description: `Search for tasks created by your team in Apollo. Tasks track upcoming actions like emailing or calling contacts.`,
  constraints: [
    'Maximum 50,000 results (100 per page, up to 500 pages)',
    'Requires a master API key'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      keywords: z.string().optional().describe('Keywords to search tasks'),
      sortByField: z.string().optional().describe('Field to sort results by'),
      sortAscending: z
        .boolean()
        .optional()
        .describe('Sort in ascending order (default: false)'),
      page: z.number().optional().describe('Page number (default: 1)'),
      perPage: z.number().optional().describe('Results per page (default: 25, max: 100)')
    })
  )
  .output(
    z.object({
      tasks: z.array(
        z.object({
          taskId: z.string().optional(),
          type: z.string().optional(),
          status: z.string().optional(),
          priority: z.string().optional(),
          dueDate: z.string().optional(),
          note: z.string().optional(),
          userId: z.string().optional(),
          contactId: z.string().optional(),
          accountId: z.string().optional(),
          createdAt: z.string().optional(),
          updatedAt: z.string().optional(),
          completedAt: z.string().optional()
        })
      ),
      totalEntries: z.number().optional(),
      currentPage: z.number().optional(),
      totalPages: z.number().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.searchTasks({
      qKeywords: ctx.input.keywords,
      sortByField: ctx.input.sortByField,
      sortAscending: ctx.input.sortAscending,
      page: ctx.input.page,
      perPage: ctx.input.perPage
    });

    let tasks = result.tasks.map(t => ({
      taskId: t.id,
      type: t.type,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      note: t.note,
      userId: t.user_id,
      contactId: t.contact_id,
      accountId: t.account_id,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      completedAt: t.completed_at
    }));

    return {
      output: {
        tasks,
        totalEntries: result.pagination?.total_entries,
        currentPage: result.pagination?.page,
        totalPages: result.pagination?.total_pages
      },
      message: `Found **${result.pagination?.total_entries ?? tasks.length}** tasks. Returned ${tasks.length} results.`
    };
  })
  .build();

export let createTask = SlateTool.create(spec, {
  name: 'Create Task',
  key: 'create_task',
  description: `Create one or more tasks in Apollo to track upcoming actions like emailing or calling contacts. Supports both single and bulk task creation.`,
  instructions: [
    'For a single task, use the top-level fields. For multiple tasks, use the tasks array.',
    'Apollo does not deduplicate tasks — duplicate tasks with the same details will be created.'
  ],
  constraints: ['Requires a master API key'],
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      userId: z.string().optional().describe('Apollo user ID to assign the task to'),
      contactId: z.string().optional().describe('Contact ID to associate with the task'),
      accountId: z.string().optional().describe('Account ID to associate with the task'),
      type: z.string().optional().describe('Task type, e.g. "call", "email", "todo"'),
      priority: z.string().optional().describe('Task priority, e.g. "high", "medium", "low"'),
      dueDate: z.string().optional().describe('Due date in ISO 8601 format'),
      note: z.string().optional().describe('Task description/note'),
      status: z.string().optional().describe('Task status'),
      tasks: z
        .array(
          z.object({
            userId: z.string().optional(),
            contactId: z.string().optional(),
            accountId: z.string().optional(),
            type: z.string().optional(),
            priority: z.string().optional(),
            dueDate: z.string().optional(),
            note: z.string().optional(),
            status: z.string().optional()
          })
        )
        .optional()
        .describe('For bulk creation: array of tasks to create')
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      tasksCreated: z.number()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    if (ctx.input.tasks && ctx.input.tasks.length > 0) {
      await client.bulkCreateTasks(
        ctx.input.tasks.map(t => ({
          userId: t.userId,
          contactId: t.contactId,
          accountId: t.accountId,
          type: t.type,
          priority: t.priority,
          dueDate: t.dueDate,
          note: t.note,
          status: t.status
        }))
      );

      return {
        output: {
          success: true,
          tasksCreated: ctx.input.tasks.length
        },
        message: `Bulk created **${ctx.input.tasks.length}** task(s).`
      };
    }

    await client.createTask({
      userId: ctx.input.userId,
      contactId: ctx.input.contactId,
      accountId: ctx.input.accountId,
      type: ctx.input.type,
      priority: ctx.input.priority,
      dueDate: ctx.input.dueDate,
      note: ctx.input.note,
      status: ctx.input.status
    });

    return {
      output: {
        success: true,
        tasksCreated: 1
      },
      message: `Created task${ctx.input.type ? ` (${ctx.input.type})` : ''}${ctx.input.note ? `: "${ctx.input.note}"` : ''}.`
    };
  })
  .build();
