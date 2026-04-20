import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { provider } from './index';

let GOOGLE_DRIVE_RETRY_ATTEMPTS = 5;
let SHARED_DRIVE_REQUEST_ID_MAX_LENGTH = 64;
let DOC_SEED_RETRY_BASE_DELAY_MS = 500;
let EVENTUAL_CONSISTENCY_RETRY_BASE_DELAY_MS = 1000;
let DRIVE_LIST_PAGE_SIZE = 25;
type DriveAttachmentContent =
  | {
      type: 'content';
      encoding: 'base64' | 'utf-8';
      content: string;
    }
  | {
      type: 'url';
      url: string;
    };

let wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let escapeDriveQueryValue = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

let createSharedDriveRequestId = (runId: string) =>
  runId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SHARED_DRIVE_REQUEST_ID_MAX_LENGTH);

let seedGoogleDocContent = async (token: string, fileId: string, text: string) => {
  for (let attempt = 0; attempt < GOOGLE_DRIVE_RETRY_ATTEMPTS; attempt += 1) {
    let response = await fetch(
      `https://docs.googleapis.com/v1/documents/${encodeURIComponent(fileId)}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: {
                  index: 1
                },
                text
              }
            }
          ]
        })
      }
    );

    if (response.ok) {
      return;
    }

    let body = await response.text();
    if (
      (response.status === 404 || response.status >= 500) &&
      attempt < GOOGLE_DRIVE_RETRY_ATTEMPTS - 1
    ) {
      await wait(DOC_SEED_RETRY_BASE_DELAY_MS * (attempt + 1));
      continue;
    }

    throw new Error(`Seeding Google Doc content failed with ${response.status}: ${body}`);
  }
};

type SharedDriveCapability = {
  supported: boolean;
  reason?: string;
};

type SharedDriveRecord = {
  driveId?: string;
  name?: string;
};

let sharedDriveCapability: SharedDriveCapability | undefined;

let getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

let getSharedDriveSkipReason = (error: unknown) => {
  let message = getErrorMessage(error);
  if (message.toLowerCase().includes('cannot create new shared drives')) {
    return 'shared drives require a Google Workspace account with shared drive creation enabled';
  }
  return null;
};

let hasSharedDriveCapability = async (ctx: {
  invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
  runId: string;
}, scenarioName: string) => {
  if (!sharedDriveCapability) {
    try {
      let probe = await ctx.invokeTool('create_shared_drive', {
        name: `Capability probe ${ctx.runId}`,
        requestId: createSharedDriveRequestId(`${ctx.runId}-capability-probe`)
      });
      let driveId = probe.output.driveId;
      if (typeof driveId === 'string' && driveId.length > 0) {
        await ctx.invokeTool('delete_shared_drive', {
          driveId
        });
      }
      sharedDriveCapability = {
        supported: true
      };
    } catch (error) {
      let reason = getSharedDriveSkipReason(error);
      if (!reason) {
        throw error;
      }
      sharedDriveCapability = {
        supported: false,
        reason
      };
    }
  }

  if (!sharedDriveCapability.supported) {
    console.log(
      `[google-drive e2e] Skipping ${scenarioName}: ${sharedDriveCapability.reason}.`
    );
    return false;
  }

  return true;
};

let withManagedSharedDrive = async (
  ctx: {
    invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
    runId: string;
    namespaced(label: string): string;
  },
  scenarioName: string,
  run: (drive: SharedDriveRecord) => Promise<void>,
  options?: {
    deleteAfterRun?: boolean;
  }
) => {
  if (!(await hasSharedDriveCapability(ctx, scenarioName))) {
    return;
  }

  let result = await ctx.invokeTool('create_shared_drive', {
    name: ctx.namespaced('shared drive'),
    requestId: createSharedDriveRequestId(`${ctx.runId}-${scenarioName}`)
  });
  let drive = result.output;

  if (typeof drive.driveId !== 'string' || drive.driveId.length === 0) {
    throw new Error('create_shared_drive did not return a driveId.');
  }

  let shouldDelete = options?.deleteAfterRun ?? true;

  try {
    await run(drive);
    if (!shouldDelete) {
      return;
    }
  } finally {
    if (shouldDelete) {
      await ctx.invokeTool('delete_shared_drive', {
        driveId: String(drive.driveId)
      });
    }
  }
};

export let googleDriveToolE2E = defineSlateToolE2EIntegration({
  resources: {
    file: {
      create: async ctx => {
        let input = {
          name: ctx.namespaced('document'),
          mimeType: 'application/vnd.google-apps.document',
          description: `Created by ${ctx.runId}`
        };
        let result = await ctx.invokeTool('create_file', input);
        let seededText = `Export seed ${ctx.runId}\n`;

        await seedGoogleDocContent(String(ctx.auth.token), String(result.output.fileId), seededText);

        return {
          ...result.output,
          description: input.description,
          seededText
        };
      }
    },
    uploaded_file: {
      create: async ctx => {
        let input = {
          name: `${ctx.namespaced('download')}.txt`,
          content: `Uploaded by ${ctx.runId}`,
          contentEncoding: 'text' as const,
          mimeType: 'text/plain',
          description: `Uploaded by ${ctx.runId}`
        };
        let result = await ctx.invokeTool('upload_file', input);
        return {
          ...result.output,
          content: input.content,
          description: input.description
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.fileId) {
            return;
          }
          await ctx.invokeTool('delete_file', {
            fileId: String(value.fileId)
          });
        }
      }
    },
    copied_file: {
      use: ['file'],
      create: async ctx => {
        let file = ctx.resource('file');
        let input = {
          fileId: String(file.fileId),
          name: ctx.namespaced('copy'),
          description: `Copied by ${ctx.runId}`
        };
        let result = await ctx.invokeTool('copy_file', input);
        return {
          ...result.output,
          sourceFileId: String(file.fileId),
          description: input.description
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.fileId) {
            return;
          }
          await ctx.invokeTool('delete_file', {
            fileId: String(value.fileId)
          });
        }
      }
    },
    permission: {
      use: ['file'],
      create: async ctx => {
        let file = ctx.resource('file');
        let result = await ctx.invokeTool('share_file', {
          fileId: String(file.fileId),
          role: 'reader',
          type: 'anyone',
          allowFileDiscovery: false
        });
        return {
          ...result.output,
          fileId: String(file.fileId)
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.fileId || !value.permissionId) {
            return;
          }
          await ctx.invokeTool('remove_permission', {
            fileId: String(value.fileId),
            permissionId: String(value.permissionId)
          });
        }
      }
    },
    comment: {
      use: ['file'],
      create: async ctx => {
        let file = ctx.resource('file');
        let input = {
          fileId: String(file.fileId),
          content: ctx.namespaced('comment')
        };
        let result = await ctx.invokeTool('create_comment', input);
        return {
          ...result.output,
          fileId: input.fileId
        };
      }
    }
  },
  scenarioOverrides: {
    search_files: {
      name: 'search_files finds the created Google Doc',
      use: ['file'],
      run: async ctx => {
        let file = ctx.resource('file');
        let fileId = String(file.fileId);
        let name = escapeDriveQueryValue(String(file.name));

        for (let attempt = 0; attempt < GOOGLE_DRIVE_RETRY_ATTEMPTS; attempt += 1) {
          let result = await ctx.invokeTool('search_files', {
            query: `name = '${name}' and trashed = false`,
            pageSize: DRIVE_LIST_PAGE_SIZE
          });

          if (
            result.output.files.some(
              (candidate: { fileId?: string }) => candidate.fileId === fileId
            )
          ) {
            return;
          }

          await wait(EVENTUAL_CONSISTENCY_RETRY_BASE_DELAY_MS * (attempt + 1));
        }

        throw new Error(`search_files did not return file ${fileId}.`);
      }
    },
    create_file: {
      name: 'create_file creates a Google Workspace document',
      use: ['file'],
      run: async () => {}
    },
    upload_file: {
      name: 'upload_file uploads a text file',
      use: ['uploaded_file'],
      run: async () => {}
    },
    download_file: {
      name: 'download_file returns the uploaded file content',
      use: ['uploaded_file'],
      run: async ctx => {
        let file = ctx.resource('uploaded_file');
        let result = await ctx.invokeTool('download_file', {
          fileId: String(file.fileId)
        });

        let attachment = (
          result as {
            attachments?: Array<{ content: DriveAttachmentContent }>;
          }
        ).attachments?.[0]?.content;
        if (attachment?.type !== 'content' || attachment.encoding !== 'base64') {
          throw new Error('download_file did not return a base64 attachment.');
        }

        let content = Buffer.from(attachment.content, 'base64').toString('utf8');
        if (content !== String(file.content)) {
          throw new Error('download_file did not return the expected content.');
        }
      }
    },
    export_file: {
      name: 'export_file exports the Google Doc as plain text',
      use: ['file'],
      run: async ctx => {
        let file = ctx.resource('file');
        let result:
          | {
              output: {
                fileId?: string;
              };
              attachments?: Array<{ content: DriveAttachmentContent }>;
            }
          | undefined;

        for (let attempt = 0; attempt < GOOGLE_DRIVE_RETRY_ATTEMPTS; attempt += 1) {
          try {
            result = await ctx.invokeTool('export_file', {
              fileId: String(file.fileId),
              exportMimeType: 'text/plain'
            });
            break;
          } catch (error) {
            let message = getErrorMessage(error);
            if (
              !message.includes('Internal Server Error') ||
              attempt === GOOGLE_DRIVE_RETRY_ATTEMPTS - 1
            ) {
              throw error;
            }
            await wait(EVENTUAL_CONSISTENCY_RETRY_BASE_DELAY_MS * (attempt + 1));
          }
        }

        if (!result || result.output.fileId !== String(file.fileId)) {
          throw new Error('export_file returned an unexpected fileId.');
        }

        let attachment = result.attachments?.[0]?.content;
        if (attachment?.type !== 'content' || attachment.encoding !== 'base64') {
          throw new Error('export_file did not return a base64 attachment.');
        }

        let exportedText = Buffer.from(attachment.content, 'base64').toString('utf8');

        if (!exportedText.includes(String(file.seededText).trim())) {
          throw new Error('export_file did not include the seeded document content.');
        }
      }
    },
    copy_file: {
      name: 'copy_file creates a disposable copy',
      use: ['copied_file'],
      run: async () => {}
    },
    list_permissions: {
      name: 'list_permissions includes the shared anyone permission',
      use: ['permission'],
      run: async ctx => {
        let permission = ctx.resource('permission');
        let result = await ctx.invokeTool('list_permissions', {
          fileId: String(permission.fileId)
        });

        if (
          !result.output.permissions.some(
            (candidate: { permissionId?: string }) =>
              candidate.permissionId === String(permission.permissionId)
          )
        ) {
          throw new Error('list_permissions did not return the tracked permission.');
        }
      }
    },
    share_file: {
      name: 'share_file creates an anyone permission',
      use: ['permission'],
      run: async () => {}
    },
    update_permission: {
      name: 'update_permission changes the shared role',
      use: ['permission'],
      run: async ctx => {
        let permission = ctx.resource('permission');
        let result = await ctx.invokeTool('update_permission', {
          fileId: String(permission.fileId),
          permissionId: String(permission.permissionId),
          role: 'commenter'
        });

        ctx.updateResource('permission', result.output);
      }
    },
    remove_permission: {
      name: 'remove_permission revokes the shared permission',
      use: ['permission'],
      run: async ctx => {
        let permission = ctx.resource('permission');
        await ctx.invokeTool('remove_permission', {
          fileId: String(permission.fileId),
          permissionId: String(permission.permissionId)
        });

        ctx.deleteResource('permission');
      }
    },
    create_comment: {
      name: 'create_comment creates a file comment',
      use: ['comment'],
      run: async () => {}
    },
    reply_to_comment: {
      name: 'reply_to_comment adds a threaded reply',
      use: ['comment'],
      run: async ctx => {
        let comment = ctx.resource('comment');
        await ctx.invokeTool('reply_to_comment', {
          fileId: String(comment.fileId),
          commentId: String(comment.commentId),
          content: ctx.namespaced('reply')
        });
      }
    },
    list_revisions: {
      name: 'list_revisions returns revision history for the uploaded file',
      use: ['uploaded_file'],
      run: async ctx => {
        let file = ctx.resource('uploaded_file');
        let result = await ctx.invokeTool('list_revisions', {
          fileId: String(file.fileId)
        });

        if (result.output.revisions.length === 0) {
          throw new Error('list_revisions did not return any revisions.');
        }
      }
    },
    list_shared_drives: {
      name: 'list_shared_drives includes the created shared drive',
      run: async ctx => {
        await withManagedSharedDrive(ctx, 'list_shared_drives', async drive => {
          let driveId = String(drive.driveId);
          let name = escapeDriveQueryValue(String(drive.name));

          for (let attempt = 0; attempt < GOOGLE_DRIVE_RETRY_ATTEMPTS; attempt += 1) {
            let result = await ctx.invokeTool('list_shared_drives', {
              query: `name contains '${name}'`,
              pageSize: DRIVE_LIST_PAGE_SIZE
            });

            if (
              result.output.drives.some(
                (candidate: { driveId?: string }) => candidate.driveId === driveId
              )
            ) {
              return;
            }

            await wait(EVENTUAL_CONSISTENCY_RETRY_BASE_DELAY_MS * (attempt + 1));
          }

          throw new Error(`list_shared_drives did not return drive ${driveId}.`);
        });
      }
    },
    create_shared_drive: {
      name: 'create_shared_drive creates a disposable shared drive',
      run: async ctx => {
        await withManagedSharedDrive(ctx, 'create_shared_drive', async () => {});
      }
    },
    update_shared_drive: {
      name: 'update_shared_drive renames the created shared drive',
      run: async ctx => {
        await withManagedSharedDrive(ctx, 'update_shared_drive', async drive => {
          let updatedName = ctx.namespaced('shared drive updated');
          let result = await ctx.invokeTool('update_shared_drive', {
            driveId: String(drive.driveId),
            name: updatedName
          });

          if (result.output.driveId !== String(drive.driveId)) {
            throw new Error('update_shared_drive returned an unexpected driveId.');
          }

          if (result.output.name !== updatedName) {
            throw new Error('update_shared_drive did not persist the new name.');
          }
        });
      }
    },
    delete_shared_drive: {
      name: 'delete_shared_drive deletes the created shared drive',
      run: async ctx => {
        await withManagedSharedDrive(
          ctx,
          'delete_shared_drive',
          async drive => {
            let result = await ctx.invokeTool('delete_shared_drive', {
              driveId: String(drive.driveId)
            });

            if (!result.output.deleted) {
              throw new Error('delete_shared_drive did not confirm deletion.');
            }
          },
          {
            deleteAfterRun: false
          }
        );
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleDriveToolE2E
});
