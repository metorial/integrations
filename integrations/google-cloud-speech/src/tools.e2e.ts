import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { z } from 'zod';
import { provider } from './index';

type GoogleCloudSpeechFixtures = {
  gcsAudioUri?: string;
};

let sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let createRecognizerId = (runId: string) => {
  let suffix =
    runId
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(-40) || 'recognizer';

  return `slates-${suffix}`.slice(0, 63).replace(/-+$/g, '');
};

let createRecognizerDisplayName = (
  ctx: ToolE2EContext<GoogleCloudSpeechFixtures>,
  label: string
) => ctx.namespaced(label).slice(0, 63).trim();

let waitForOperation = async (
  ctx: ToolE2EContext<GoogleCloudSpeechFixtures>,
  operationName: string,
  label: string
) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    let result = await ctx.invokeTool('get_operation', { operationName });
    if (result.output.done) {
      let errorMessage = result.output.error?.message;
      if (errorMessage) {
        throw new Error(`${label} failed: ${errorMessage}`);
      }
      return result.output;
    }

    await sleep(2000);
  }

  throw new Error(`Timed out waiting for ${label}.`);
};

let waitForRecognizer = async (
  ctx: ToolE2EContext<GoogleCloudSpeechFixtures>,
  recognizerId: string,
  predicate?: (recognizer: Record<string, any>) => boolean
) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      let result = await ctx.invokeTool('get_recognizer', { recognizerId });
      if (!predicate || predicate(result.output)) {
        return result.output;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(2000);
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error(`Timed out waiting for recognizer ${recognizerId}.`);
};

let createSampleSpeech = async (
  ctx: ToolE2EContext<GoogleCloudSpeechFixtures>,
  audioEncoding: 'LINEAR16' | 'MP3'
) => {
  let result = await ctx.invokeTool('synthesize_speech', {
    text: 'Hello cloud speech',
    languageCode: 'en-US',
    audioEncoding
  });

  if (result.output.audioContent.length === 0) {
    throw new Error('synthesize_speech did not return any audio content.');
  }

  return result.output;
};

let getGcsAudioUri = (ctx: ToolE2EContext<GoogleCloudSpeechFixtures>) => {
  return typeof ctx.fixtures.gcsAudioUri === 'string' && ctx.fixtures.gcsAudioUri.length > 0
    ? ctx.fixtures.gcsAudioUri
    : undefined;
};

export let googleCloudSpeechToolE2E =
  defineSlateToolE2EIntegration<GoogleCloudSpeechFixtures>({
    beforeSuite: async ctx => {
      if (typeof ctx.auth.token !== 'string' || ctx.auth.token.length === 0) {
        throw new Error(
          'The selected profile must include a Google Cloud access token for Speech live E2E. ' +
            'Run `bun run integrations:cli -- google-cloud-speech auth setup`.'
        );
      }

      let config = ctx.profile.config as Record<string, unknown> | null;
      if (typeof config?.projectId !== 'string' || config.projectId.length === 0) {
        throw new Error(
          'Missing or invalid provider config for live E2E tools (google-cloud-speech). ' +
            'Run `bun run integrations:cli -- google-cloud-speech config set`. ' +
            'Details: projectId is required.'
        );
      }
    },
    fixturesSchema: z.object({
      gcsAudioUri: z
        .string()
        .regex(/^gs:\/\/.+/, 'Expected gcsAudioUri to be a gs:// URI.')
        .optional()
    }),
    resources: {
      recognizer: {
        create: async ctx => {
          let input = {
            recognizerId: createRecognizerId(ctx.runId),
            displayName: createRecognizerDisplayName(ctx, 'recognizer'),
            model: 'latest_long',
            languageCodes: ['en-US'],
            enableAutomaticPunctuation: true
          };
          let created = await ctx.invokeTool('create_recognizer', input);
          let operationName = String(created.output.operationName);
          if (!operationName) {
            throw new Error('create_recognizer did not return an operation name.');
          }

          await waitForOperation(ctx, operationName, `create recognizer ${input.recognizerId}`);
          let recognizer = await waitForRecognizer(ctx, input.recognizerId);

          return {
            recognizerId: input.recognizerId,
            operationName,
            ...recognizer
          };
        },
        cleanup: {
          kind: 'delete',
          run: async (ctx, value) => {
            if (typeof value.recognizerId !== 'string' || value.recognizerId.length === 0) {
              return;
            }

            try {
              let deleted = await ctx.invokeTool('delete_recognizer', {
                recognizerId: value.recognizerId
              });
              let operationName = String(deleted.output.operationName);
              if (operationName) {
                await waitForOperation(
                  ctx,
                  operationName,
                  `delete recognizer ${value.recognizerId}`
                );
              }
            } catch (error) {
              let message = error instanceof Error ? error.message : String(error);
              if (message.includes('404') || message.includes('NOT_FOUND')) {
                return;
              }
              throw error;
            }
          }
        }
      }
    },
    scenarioOverrides: {
      transcribe_audio: {
        name: 'transcribe_audio transcribes synthesized inline audio',
        run: async ctx => {
          let speech = await createSampleSpeech(ctx, 'LINEAR16');
          let result = await ctx.invokeTool('transcribe_audio', {
            audioContent: speech.audioContent,
            model: 'latest_short',
            languageCodes: ['en-US'],
            enableAutomaticPunctuation: true
          });

          if (result.output.transcript.trim().length === 0) {
            throw new Error('transcribe_audio returned an empty transcript.');
          }
        }
      },
      batch_transcribe_audio: {
        name: 'batch_transcribe_audio starts a batch transcription from GCS',
        run: async ctx => {
          let gcsAudioUri = getGcsAudioUri(ctx);
          if (!gcsAudioUri) {
            console.log(
              '[google-cloud-speech e2e] Skipping batch_transcribe_audio: ' +
                'requires SLATES_E2E_FIXTURES with gcsAudioUri.'
            );
            return;
          }

          let result = await ctx.invokeTool('batch_transcribe_audio', {
            fileUris: [gcsAudioUri],
            model: 'latest_long',
            languageCodes: ['en-US']
          });

          if (String(result.output.operationName).length === 0) {
            throw new Error('batch_transcribe_audio did not return an operation name.');
          }
        }
      },
      get_operation: {
        name: 'get_operation returns the recognizer creation operation',
        use: ['recognizer'],
        run: async ctx => {
          let recognizer = ctx.resource('recognizer');
          let operationName = String(recognizer.operationName);
          let result = await ctx.invokeTool('get_operation', { operationName });

          if (result.output.operationName !== operationName) {
            throw new Error('get_operation returned a different operation than requested.');
          }
          if (!result.output.done) {
            throw new Error('get_operation did not return a completed recognizer operation.');
          }
          if (result.output.error?.message) {
            throw new Error(`get_operation returned an error: ${result.output.error.message}`);
          }
        }
      },
      create_recognizer: {
        name: 'create_recognizer creates a managed recognizer',
        use: ['recognizer'],
        run: async ctx => {
          let recognizer = ctx.resource('recognizer');
          if (typeof recognizer.name !== 'string' || recognizer.name.length === 0) {
            throw new Error('recognizer resource did not expose a name.');
          }
        }
      },
      get_recognizer: {
        name: 'get_recognizer returns the managed recognizer',
        use: ['recognizer'],
        run: async ctx => {
          let recognizer = ctx.resource('recognizer');
          let result = await ctx.invokeTool('get_recognizer', {
            recognizerId: String(recognizer.recognizerId)
          });

          if (!String(result.output.name).endsWith(`/recognizers/${recognizer.recognizerId}`)) {
            throw new Error('get_recognizer did not return the expected recognizer.');
          }

          ctx.updateResource('recognizer', result.output);
        }
      },
      update_recognizer: {
        name: 'update_recognizer updates the managed recognizer',
        use: ['recognizer'],
        run: async ctx => {
          let recognizer = ctx.resource('recognizer');
          let displayName = createRecognizerDisplayName(ctx, 'recognizer updated');
          let updated = await ctx.invokeTool('update_recognizer', {
            recognizerId: String(recognizer.recognizerId),
            displayName
          });
          let operationName = String(updated.output.operationName);
          if (!operationName) {
            throw new Error('update_recognizer did not return an operation name.');
          }

          await waitForOperation(
            ctx,
            operationName,
            `update recognizer ${recognizer.recognizerId}`
          );

          let readBack = await waitForRecognizer(
            ctx,
            String(recognizer.recognizerId),
            candidate => candidate.displayName === displayName
          );

          ctx.updateResource('recognizer', {
            operationName,
            ...readBack
          });
        }
      },
      delete_recognizer: {
        name: 'delete_recognizer deletes the managed recognizer',
        use: ['recognizer'],
        run: async ctx => {
          let recognizer = ctx.resource('recognizer');
          let deleted = await ctx.invokeTool('delete_recognizer', {
            recognizerId: String(recognizer.recognizerId)
          });
          let operationName = String(deleted.output.operationName);
          if (!operationName) {
            throw new Error('delete_recognizer did not return an operation name.');
          }

          await waitForOperation(
            ctx,
            operationName,
            `delete recognizer ${recognizer.recognizerId}`
          );
          ctx.deleteResource('recognizer');
        }
      },
      synthesize_speech: {
        name: 'synthesize_speech returns encoded audio for inline text',
        run: async ctx => {
          let result = await createSampleSpeech(ctx, 'MP3');

          if (result.audioEncoding !== 'MP3') {
            throw new Error('synthesize_speech did not preserve the requested encoding.');
          }
          if (result.audioContent.length < 100) {
            throw new Error('synthesize_speech returned unexpectedly small audio content.');
          }
        }
      },
      list_voices: {
        name: 'list_voices returns voices for English',
        run: async ctx => {
          let result = await ctx.invokeTool('list_voices', {
            languageCode: 'en-US'
          });

          if (result.output.totalCount < 1) {
            throw new Error('list_voices did not return any English voices.');
          }
        }
      }
    }
  });

runSlateToolE2ESuite({
  provider,
  integration: googleCloudSpeechToolE2E
});
