import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { z } from 'zod';
import { provider } from './index';

type GoogleCloudStorageFixtures = {
  notificationTopic?: string;
};

let sanitizeName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

let bucketNameForRun = (runId: string) => {
  let suffix = sanitizeName(runId).slice(-40) || 'run';
  let bucketName = `slates-gcs-${suffix}`.slice(0, 63).replace(/-+$/g, '');
  return bucketName.length >= 3 ? bucketName : `${bucketName}000`.slice(0, 3);
};

let objectNameForRun = (runId: string, label: string) => `e2e/${sanitizeName(runId)}/${label}`;

let getBucketIamMember = (ctx: {
  profile: {
    auth: Record<string, { authType?: string; input?: Record<string, any>; profile?: Record<string, any> }>;
  };
}) => {
  let auth = Object.values(ctx.profile.auth)[0];
  let email =
    typeof auth?.profile?.email === 'string'
      ? auth.profile.email
      : typeof auth?.input?.clientEmail === 'string'
        ? auth.input.clientEmail
        : undefined;

  if (!email) {
    return undefined;
  }

  let memberType =
    auth?.authType === 'auth.service_account' || email.endsWith('gserviceaccount.com')
      ? 'serviceAccount'
      : 'user';

  return `${memberType}:${email}`;
};

let lifecycleDeleteRule = {
  action: { type: 'Delete' as const },
  condition: { age: 30 }
};

let lifecycleTransitionRule = {
  action: { type: 'SetStorageClass' as const, storageClass: 'NEARLINE' },
  condition: { age: 10 }
};

let emptyBucket = async (ctx: ToolE2EContext<GoogleCloudStorageFixtures>, bucketName: string) => {
  let pageToken: string | undefined;
  let objects: Array<{ objectName: string; generation?: string }> = [];

  do {
    let listed = await ctx.invokeTool('list_objects', {
      bucketName,
      includeVersions: true,
      maxResults: 1000,
      pageToken
    });

    objects.push(
      ...listed.output.objects
        .filter(
          (object: { objectName?: string; generation?: string }) =>
            typeof object.objectName === 'string' && object.objectName.length > 0
        )
        .map((object: { objectName: string; generation?: string }) => ({
          objectName: object.objectName,
          generation: object.generation
        }))
    );

    pageToken = listed.output.nextPageToken;
  } while (pageToken);

  for (let object of objects) {
    await ctx.invokeTool('delete_object', {
      bucketName,
      objectName: object.objectName,
      generation: object.generation
    });
  }
};

export let googleCloudStorageToolE2E = defineSlateToolE2EIntegration<GoogleCloudStorageFixtures>({
  beforeSuite: async ctx => {
    if (typeof ctx.auth.token !== 'string' || ctx.auth.token.length === 0) {
      throw new Error(
        'The selected profile must include a Google Cloud access token for Storage live E2E. ' +
          'Run `bun run integrations:cli -- google-cloud-storage auth setup`.'
      );
    }

    let config = ctx.profile.config as Record<string, unknown> | null;
    if (typeof config?.projectId !== 'string' || config.projectId.length === 0) {
      throw new Error(
        'Missing or invalid provider config for live E2E tools (google-cloud-storage). ' +
          'Run `bun run integrations:cli -- google-cloud-storage config set`. ' +
          'Details: projectId is required.'
      );
    }
  },
  fixturesSchema: z.object({
    notificationTopic: z
      .string()
      .describe('Pub/Sub topic in projects/{project}/topics/{topic} format for notifications')
      .optional()
  }),
  resources: {
    bucket: {
      create: async ctx => {
        let bucketName = bucketNameForRun(ctx.runId);
        let result = await ctx.invokeTool('manage_bucket', {
          action: 'create',
          bucketName,
          location: 'US'
        });

        return {
          ...result.output,
          bucketName,
          name: bucketName
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.bucketName) {
            return;
          }

          await emptyBucket(ctx, String(value.bucketName));

          await ctx.invokeTool('manage_bucket', {
            action: 'delete',
            bucketName: String(value.bucketName)
          });
        }
      }
    },
    object: {
      use: ['bucket'],
      create: async ctx => {
        let bucket = ctx.resource('bucket');
        let input = {
          bucketName: String(bucket.bucketName),
          objectName: objectNameForRun(ctx.runId, 'seed.txt'),
          content: `seed ${ctx.runId}`,
          contentType: 'text/plain',
          customMetadata: {
            suite_run: ctx.runId
          }
        };
        let result = await ctx.invokeTool('upload_object', input);

        return {
          ...result.output,
          bucketName: input.bucketName,
          objectName: input.objectName,
          name: input.objectName,
          content: input.content
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.bucketName || !value.objectName) {
            return;
          }

          await ctx.invokeTool('delete_object', {
            bucketName: String(value.bucketName),
            objectName: String(value.objectName)
          });
        }
      }
    }
  },
  scenarioOverrides: {
    list_buckets: {
      name: 'list_buckets includes the created bucket',
      use: ['bucket'],
      run: async ctx => {
        let bucket = ctx.resource('bucket');
        let bucketName = String(bucket.bucketName);
        let result = await ctx.invokeTool('list_buckets', {
          prefix: bucketName,
          maxResults: 50
        });

        if (
          !result.output.buckets.some(
            (candidate: { bucketName?: string }) => candidate.bucketName === bucketName
          )
        ) {
          throw new Error(`list_buckets did not include the expected bucket ${bucketName}.`);
        }
      }
    },
    manage_bucket: {
      name: 'manage_bucket updates the tracked bucket',
      use: ['bucket'],
      run: async ctx => {
        let bucket = ctx.resource('bucket');
        let bucketName = String(bucket.bucketName);
        let suiteRunLabel = sanitizeName(ctx.runId).slice(-30) || 'run';

        await ctx.invokeTool('manage_bucket', {
          action: 'update',
          bucketName,
          enableVersioning: true,
          labels: {
            suite_run: suiteRunLabel
          }
        });

        let readBack = await ctx.invokeTool('get_bucket', { bucketName });
        if (!readBack.output.versioningEnabled) {
          throw new Error('manage_bucket update did not enable versioning.');
        }
        if (readBack.output.labels?.suite_run !== suiteRunLabel) {
          throw new Error('manage_bucket update did not persist the expected label.');
        }

        ctx.updateResource('bucket', {
          ...readBack.output,
          name: bucketName
        });
      }
    },
    list_objects: {
      name: 'list_objects includes the tracked object',
      use: ['object'],
      run: async ctx => {
        let object = ctx.resource('object');
        let bucketName = String(object.bucketName);
        let objectName = String(object.objectName);
        let result = await ctx.invokeTool('list_objects', {
          bucketName,
          prefix: objectName,
          maxResults: 50
        });

        if (
          !result.output.objects.some(
            (candidate: { objectName?: string }) => candidate.objectName === objectName
          )
        ) {
          throw new Error(`list_objects did not include the expected object ${objectName}.`);
        }
      }
    },
    upload_object: {
      name: 'upload_object uploads another object into the test bucket',
      use: ['bucket'],
      run: async ctx => {
        let bucket = ctx.resource('bucket');
        let input = {
          bucketName: String(bucket.bucketName),
          objectName: objectNameForRun(ctx.runId, 'uploaded.txt'),
          content: `uploaded ${ctx.runId}`,
          contentType: 'text/plain',
          customMetadata: {
            suite_run: ctx.runId
          }
        };
        let result = await ctx.invokeTool('upload_object', input);

        if (result.output.objectName !== input.objectName) {
          throw new Error('upload_object did not return the uploaded object name.');
        }

        return {
          provide: {
            object: {
              ...result.output,
              bucketName: input.bucketName,
              objectName: input.objectName,
              name: input.objectName,
              content: input.content
            }
          }
        };
      }
    },
    copy_object: {
      name: 'copy_object copies the tracked object inside the same bucket',
      use: ['object'],
      run: async ctx => {
        let object = ctx.resource('object');
        let bucketName = String(object.bucketName);
        let destinationObject = objectNameForRun(ctx.runId, 'copied.txt');
        let result = await ctx.invokeTool('copy_object', {
          sourceBucket: bucketName,
          sourceObject: String(object.objectName),
          destinationBucket: bucketName,
          destinationObject
        });

        if (result.output.objectName !== destinationObject) {
          throw new Error('copy_object did not return the copied object name.');
        }

        return {
          provide: {
            object: {
              ...result.output,
              bucketName,
              objectName: destinationObject,
              name: destinationObject
            }
          }
        };
      }
    },
    update_object_metadata: {
      name: 'update_object_metadata changes metadata on the tracked object',
      use: ['object'],
      run: async ctx => {
        let object = ctx.resource('object');
        let bucketName = String(object.bucketName);
        let objectName = String(object.objectName);
        let contentType = 'application/json';

        await ctx.invokeTool('update_object_metadata', {
          bucketName,
          objectName,
          contentType,
          cacheControl: 'no-cache',
          customMetadata: {
            suite_run: ctx.runId,
            phase: 'metadata'
          }
        });

        let readBack = await ctx.invokeTool('get_object', {
          bucketName,
          objectName
        });
        if (readBack.output.contentType !== contentType) {
          throw new Error('update_object_metadata did not persist the expected content type.');
        }
        if (readBack.output.customMetadata?.phase !== 'metadata') {
          throw new Error('update_object_metadata did not persist the expected custom metadata.');
        }

        ctx.updateResource('object', {
          ...readBack.output,
          name: objectName
        });
      }
    },
    manage_bucket_iam: {
      name: 'manage_bucket_iam gets, adds, and removes a binding',
      use: ['bucket'],
      run: async ctx => {
        let bucketName = String(ctx.resource('bucket').bucketName);
        let role = 'roles/storage.objectViewer';
        let member = getBucketIamMember(ctx);

        if (!member) {
          console.log(
            '[google-cloud-storage e2e] Skipping manage_bucket_iam: requires an authenticated user or service account email on the selected profile.'
          );
          return;
        }

        await ctx.invokeTool('manage_bucket_iam', {
          bucketName,
          action: 'get'
        });

        let added = await ctx.invokeTool('manage_bucket_iam', {
          bucketName,
          action: 'add_binding',
          binding: {
            role,
            members: [member]
          }
        });
        if (
          !added.output.bindings.some(
            (binding: { role?: string; members?: string[] }) =>
              binding.role === role && binding.members?.includes(member)
          )
        ) {
          throw new Error('manage_bucket_iam add_binding did not persist the expected member.');
        }

        let removed = await ctx.invokeTool('manage_bucket_iam', {
          bucketName,
          action: 'remove_binding',
          binding: {
            role,
            members: [member]
          }
        });
        if (
          removed.output.bindings.some(
            (binding: { role?: string; members?: string[] }) =>
              binding.role === role && binding.members?.includes(member)
          )
        ) {
          throw new Error(
            'manage_bucket_iam remove_binding did not remove the expected member.'
          );
        }
      }
    },
    manage_lifecycle: {
      name: 'manage_lifecycle gets, sets, adds, and clears rules',
      use: ['bucket'],
      run: async ctx => {
        let bucketName = String(ctx.resource('bucket').bucketName);

        await ctx.invokeTool('manage_lifecycle', {
          bucketName,
          action: 'get'
        });

        let setResult = await ctx.invokeTool('manage_lifecycle', {
          bucketName,
          action: 'set',
          rules: [lifecycleDeleteRule]
        });
        if (setResult.output.rules.length < 1) {
          throw new Error('manage_lifecycle set did not return any rules.');
        }

        let added = await ctx.invokeTool('manage_lifecycle', {
          bucketName,
          action: 'add',
          rule: lifecycleTransitionRule
        });
        if (
          !added.output.rules.some(
            (rule: { action?: { type?: string; storageClass?: string } }) =>
              rule.action?.type === 'SetStorageClass' &&
              rule.action?.storageClass === 'NEARLINE'
          )
        ) {
          throw new Error('manage_lifecycle add did not append the expected transition rule.');
        }

        let cleared = await ctx.invokeTool('manage_lifecycle', {
          bucketName,
          action: 'clear'
        });
        if (cleared.output.rules.length !== 0) {
          throw new Error('manage_lifecycle clear did not remove all rules.');
        }
      }
    },
    manage_notifications: {
      name: 'manage_notifications lists, creates, and deletes a notification',
      use: ['bucket'],
      run: async ctx => {
        let bucketName = String(ctx.resource('bucket').bucketName);
        let notificationTopic = ctx.fixtures.notificationTopic;

        if (!notificationTopic) {
          console.log(
            '[google-cloud-storage e2e] Skipping manage_notifications: requires SLATES_E2E_FIXTURES with notificationTopic.'
          );
          return;
        }

        await ctx.invokeTool('manage_notifications', {
          bucketName,
          action: 'list'
        });

        let created = await ctx.invokeTool('manage_notifications', {
          bucketName,
          action: 'create',
          topic: notificationTopic,
          objectNamePrefix: `notifications/${sanitizeName(ctx.runId)}/`,
          eventTypes: ['OBJECT_FINALIZE'],
          payloadFormat: 'JSON_API_V1',
          customAttributes: {
            suite_run: ctx.runId
          }
        });

        let notificationId = created.output.created?.notificationId;
        if (!notificationId) {
          throw new Error('manage_notifications create did not return a notificationId.');
        }

        let deleted = false;
        ctx.registerCleanup(
          async () => {
            if (deleted) {
              return;
            }

            await ctx.invokeTool('manage_notifications', {
              bucketName,
              action: 'delete',
              notificationId
            });
          },
          'cleanup:notification'
        );

        let listed = await ctx.invokeTool('manage_notifications', {
          bucketName,
          action: 'list'
        });
        if (
          !listed.output.notifications?.some(
            (notification: { notificationId?: string }) =>
              notification.notificationId === notificationId
          )
        ) {
          throw new Error('manage_notifications list did not include the created notification.');
        }

        await ctx.invokeTool('manage_notifications', {
          bucketName,
          action: 'delete',
          notificationId
        });
        deleted = true;

        let afterDelete = await ctx.invokeTool('manage_notifications', {
          bucketName,
          action: 'list'
        });
        if (
          afterDelete.output.notifications?.some(
            (notification: { notificationId?: string }) =>
              notification.notificationId === notificationId
          )
        ) {
          throw new Error('manage_notifications delete did not remove the notification.');
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleCloudStorageToolE2E
});
