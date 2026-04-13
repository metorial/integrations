import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listJobsTool = SlateTool.create(
  spec,
  {
    name: 'List Jobs',
    key: 'list_jobs',
    description: `List dbt Cloud jobs, optionally filtered by project or environment. Returns job names, schedules, settings, and execution configuration. Use this to discover available jobs that can be triggered or monitored.`,
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({
    projectId: z.string().optional().describe('Filter jobs by project ID'),
    environmentId: z.string().optional().describe('Filter jobs by environment ID'),
    orderBy: z.string().optional().describe('Field to order results by (prefix with - for descending, e.g., "-id")'),
    limit: z.number().optional().describe('Maximum number of jobs to return (max 100)'),
    offset: z.number().optional().describe('Number of jobs to skip for pagination')
  }))
  .output(z.object({
    jobs: z.array(z.object({
      jobId: z.number().describe('Unique job identifier'),
      accountId: z.number().describe('Account the job belongs to'),
      projectId: z.number().describe('Project the job belongs to'),
      environmentId: z.number().describe('Environment the job runs in'),
      name: z.string().describe('Job name'),
      executeSteps: z.array(z.string()).optional().describe('dbt commands executed by this job'),
      state: z.number().optional().describe('Job state (1 = active, 2 = deleted)'),
      dbtVersion: z.string().nullable().optional().describe('dbt version override'),
      generateDocs: z.boolean().optional().describe('Whether docs are generated after run'),
      schedule: z.any().optional().describe('Job schedule configuration'),
      settingsThreads: z.number().optional().describe('Number of threads configured'),
      createdAt: z.string().optional().describe('Creation timestamp'),
      updatedAt: z.string().optional().describe('Last update timestamp')
    })).describe('List of jobs')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      accountId: ctx.config.accountId,
      baseUrl: ctx.config.baseUrl
    });

    let jobs = await client.listJobs({
      project_id: ctx.input.projectId,
      environment_id: ctx.input.environmentId,
      order_by: ctx.input.orderBy,
      limit: ctx.input.limit,
      offset: ctx.input.offset
    });

    let mapped = jobs.map((j: any) => ({
      jobId: j.id,
      accountId: j.account_id,
      projectId: j.project_id,
      environmentId: j.environment_id,
      name: j.name,
      executeSteps: j.execute_steps,
      state: j.state,
      dbtVersion: j.dbt_version ?? null,
      generateDocs: j.generate_docs,
      schedule: j.schedule,
      settingsThreads: j.settings?.threads,
      createdAt: j.created_at,
      updatedAt: j.updated_at
    }));

    return {
      output: { jobs: mapped },
      message: `Found **${mapped.length}** job(s).`
    };
  }).build();
