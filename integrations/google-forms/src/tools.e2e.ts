import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { z } from 'zod';
import { provider } from './index';

type GoogleFormsFixtures = {
  watchTopicName?: string;
};

let trashForm = async (token: string, formId: string) => {
  let response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(formId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trashed: true })
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to trash form ${formId}: ${response.status}`);
  }
};

export let googleFormsToolE2E = defineSlateToolE2EIntegration<GoogleFormsFixtures>({
  fixturesSchema: z.object({
    watchTopicName: z
      .string()
      .optional()
      .describe('Optional Pub/Sub topic in projects/{project}/topics/{topic} format')
  }),
  resources: {
    form: {
      create: async ctx => {
        let input = {
          title: ctx.namespaced('form'),
          documentTitle: ctx.namespaced('form document')
        };
        let result = await ctx.invokeTool('create_form', input);

        if (!result.output.formId) {
          throw new Error('create_form did not return a formId.');
        }

        return {
          ...result.output,
          title: result.output.title ?? input.title,
          documentTitle: result.output.documentTitle ?? input.documentTitle
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.formId !== 'string' || value.formId.length === 0) {
            return;
          }

          let token = String(ctx.auth.token ?? '');
          if (!token) {
            return;
          }

          try {
            await trashForm(token, value.formId);
          } catch {}
        }
      }
    }
  },
  scenarioOverrides: {
    create_form: {
      name: 'create_form creates a disposable form resource',
      use: ['form'],
      run: async ctx => {
        let form = ctx.resource('form');
        if (typeof form.formId !== 'string' || form.formId.length === 0) {
          throw new Error('Tracked form resource is missing a formId.');
        }
      }
    },
    update_form: {
      name: 'update_form changes form metadata',
      use: ['form'],
      run: async ctx => {
        let form = ctx.resource('form');
        let formId = String(form.formId);
        let title = ctx.namespaced('form updated');
        let description = `Updated by ${ctx.runId}`;

        await ctx.invokeTool('update_form', {
          formId,
          requests: [
            {
              updateFormInfo: {
                info: {
                  title,
                  description
                },
                updateMask: 'title,description'
              }
            }
          ],
          includeFormInResponse: true
        });

        let readBack = await ctx.invokeTool('get_form', { formId });
        if (readBack.output.title !== title) {
          throw new Error('update_form did not persist the updated title.');
        }
        if (readBack.output.description !== description) {
          throw new Error('update_form did not persist the updated description.');
        }

        ctx.updateResource('form', readBack.output);
      }
    },
    get_response: {
      name: 'get_response reads a live response when one exists',
      use: ['form'],
      run: async ctx => {
        let formId = String(ctx.resource('form').formId);
        let listed = await ctx.invokeTool('list_responses', {
          formId,
          pageSize: 1
        });
        let responseId = listed.output.responses[0]?.responseId;

        if (!responseId) {
          return;
        }

        let result = await ctx.invokeTool('get_response', {
          formId,
          responseId
        });

        if (result.output.responseId !== responseId) {
          throw new Error(
            `get_response returned ${result.output.responseId} instead of ${responseId}.`
          );
        }
      }
    },
    list_responses: {
      name: 'list_responses reads the response list for the disposable form',
      use: ['form'],
      run: async ctx => {
        await ctx.invokeTool('list_responses', {
          formId: String(ctx.resource('form').formId),
          pageSize: 25
        });
      }
    },
    manage_watches: {
      name: 'manage_watches lists watches and optionally exercises create renew delete',
      use: ['form'],
      run: async ctx => {
        let formId = String(ctx.resource('form').formId);
        await ctx.invokeTool('manage_watches', {
          formId,
          action: 'list'
        });

        let topicName = ctx.fixtures.watchTopicName;
        if (!topicName) {
          return;
        }

        let created = await ctx.invokeTool('manage_watches', {
          formId,
          action: 'create',
          eventType: 'SCHEMA',
          topicName
        });
        let watchId = created.output.watch?.watchId;

        if (!watchId) {
          throw new Error('manage_watches create did not return a watchId.');
        }

        try {
          let listed = await ctx.invokeTool('manage_watches', {
            formId,
            action: 'list'
          });
          if (
            !listed.output.watches?.some(
              (candidate: { watchId?: string }) => candidate.watchId === watchId
            )
          ) {
            throw new Error('manage_watches list did not include the created watch.');
          }

          let renewed = await ctx.invokeTool('manage_watches', {
            formId,
            action: 'renew',
            watchId
          });
          if (renewed.output.watch?.watchId !== watchId) {
            throw new Error('manage_watches renew did not return the expected watch.');
          }
        } finally {
          await ctx.invokeTool('manage_watches', {
            formId,
            action: 'delete',
            watchId
          });
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleFormsToolE2E
});
