import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { readFile } from 'node:fs/promises';
import { GooglePhotosLibraryClient, GooglePhotosPickerClient } from './lib/client';
import { provider } from './index';

type GooglePhotosHelpers = {
  libraryClient: GooglePhotosLibraryClient;
  pickerClient: GooglePhotosPickerClient;
  state: {
    album?: Record<string, any>;
    mediaItem?: Record<string, any>;
    mediaItemFailure?: string;
    pickerSession?: Record<string, any>;
  };
};

let MANAGED_PREFIX = 'slates-e2e:google-photos:';
let SEED_MEDIA_ATTEMPTS = [
  {
    assetUrl: new URL('../../lmnt/logo.jpeg', import.meta.url),
    fileName: 'integration-seed-photo.jpg',
    mimeType: 'image/jpeg'
  },
  {
    assetUrl: new URL('../../cutt-ly/logo.png', import.meta.url),
    fileName: 'integration-seed-photo.png',
    mimeType: 'image/png'
  }
] as const;
let INITIAL_MEDIA_DESCRIPTION = 'A seeded integration test image uploaded by the Google Photos app.';
let UPDATED_MEDIA_DESCRIPTION =
  'An updated seeded integration test image uploaded by the Google Photos app.';
let CLEANUP_MEDIA_DESCRIPTION =
  'An archived seeded integration test image uploaded by the Google Photos app.';

let requireObject = (value: Record<string, any> | undefined, label: string) => {
  if (!value) {
    throw new Error(`${label} was not prepared during beforeSuite.`);
  }
  return value;
};

let getMediaItemOrSkip = (
  ctx: ToolE2EContext<Record<string, any>, GooglePhotosHelpers>,
  scenario: string
) => {
  let mediaItem = ctx.resource('media_item');

  if (typeof mediaItem.mediaItemId === 'string') {
    return mediaItem;
  }

  let failure =
    typeof mediaItem.failure === 'string'
      ? mediaItem.failure
      : 'upload_media could not create a disposable media item for this Google Photos account/app.';

  console.log(`[google-photos e2e] Skipping ${scenario}: ${failure}`);
  return null;
};

let normalizeError = (error: unknown) =>
  error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

let ignoreNotFound = async (run: () => Promise<void>) => {
  try {
    await run();
  } catch (error) {
    let message = normalizeError(error);
    if (message.includes('404') || message.includes('not_found')) {
      return;
    }
    throw error;
  }
};

let createUploadToken = async (
  helpers: GooglePhotosHelpers,
  assetUrl: URL,
  mimeType: string
) => await helpers.libraryClient.uploadBytes(await readFile(assetUrl), mimeType);

export let googlePhotosToolE2E = defineSlateToolE2EIntegration<
  Record<string, any>,
  GooglePhotosHelpers
>({
  createHelpers: ctx => ({
    libraryClient: new GooglePhotosLibraryClient(ctx.auth.token),
    pickerClient: new GooglePhotosPickerClient(ctx.auth.token),
    state: {}
  }),
  beforeSuite: async ctx => {
    let album = (
      await ctx.invokeTool('create_album', {
        title: ctx.namespaced('album')
      })
    ).output;
    ctx.helpers.state.album = album;

    ctx.registerCleanup(
      async () => {
        let preparedAlbum = ctx.helpers.state.album;
        if (typeof preparedAlbum?.albumId !== 'string') {
          return;
        }

        await ctx.helpers.libraryClient.updateAlbum(preparedAlbum.albumId, {
          title: `${MANAGED_PREFIX}stale ${preparedAlbum.albumId}`.slice(0, 500)
        });
      },
      'cleanup:google-photos-album'
    );

    for (let attempt of SEED_MEDIA_ATTEMPTS) {
      let uploadToken = await createUploadToken(
        ctx.helpers,
        attempt.assetUrl,
        attempt.mimeType
      );
      let createdMedia = await ctx.invokeTool('upload_media', {
        items: [
          {
            uploadToken,
            fileName: attempt.fileName,
            description: INITIAL_MEDIA_DESCRIPTION
          }
        ]
      });

      let mediaItemId = createdMedia.output.results[0]?.mediaItemId;
      if (typeof mediaItemId !== 'string') {
        let status = createdMedia.output.results[0]?.status;
        ctx.helpers.state.mediaItemFailure =
          `upload_media did not return a mediaItemId during beforeSuite.` +
          (typeof status === 'string' && status.length > 0 ? ` Status: ${status}` : '') +
          ` Seed: ${attempt.fileName}`;
        continue;
      }

      let mediaItem = (
        await ctx.invokeTool('get_media_item', {
          mediaItemIds: [mediaItemId]
        })
      ).output.mediaItems[0];
      if (!mediaItem) {
        ctx.helpers.state.mediaItemFailure =
          `get_media_item did not return the uploaded media item during beforeSuite.` +
          ` Seed: ${attempt.fileName}`;
        continue;
      }

      await ctx.invokeTool('manage_album_media', {
        action: 'add',
        albumId: String(album.albumId),
        mediaItemIds: [mediaItemId]
      });

      ctx.helpers.state.mediaItem = mediaItem;

      ctx.registerCleanup(
        async () => {
          let preparedAlbum = ctx.helpers.state.album;
          let preparedMediaItem = ctx.helpers.state.mediaItem;

          if (
            typeof preparedAlbum?.albumId === 'string' &&
            typeof preparedMediaItem?.mediaItemId === 'string'
          ) {
            try {
              await ctx.helpers.libraryClient.removeMediaItemsFromAlbum(preparedAlbum.albumId, [
                preparedMediaItem.mediaItemId
              ]);
            } catch {}
          }

          if (typeof preparedMediaItem?.mediaItemId !== 'string') {
            return;
          }

          await ctx.helpers.libraryClient.updateMediaItem(
            preparedMediaItem.mediaItemId,
            CLEANUP_MEDIA_DESCRIPTION
          );
        },
        'cleanup:google-photos-media-item'
      );

      break;
    }

    if (!ctx.helpers.state.mediaItem) {
      ctx.helpers.state.mediaItem = {
        failure:
          ctx.helpers.state.mediaItemFailure ??
          'upload_media could not create a disposable media item during beforeSuite.'
      };
    }

    let pickerSession = (
      await ctx.invokeTool('create_picker_session', {
        maxItemCount: 1
      })
    ).output;
    ctx.helpers.state.pickerSession = pickerSession;

    ctx.registerCleanup(
      async () => {
        let preparedPickerSession = ctx.helpers.state.pickerSession;
        if (typeof preparedPickerSession?.sessionId !== 'string') {
          return;
        }

        await ignoreNotFound(async () => {
          await ctx.helpers.pickerClient.deleteSession(preparedPickerSession.sessionId);
        });
      },
      'cleanup:google-photos-picker-session'
    );
  },
  resources: {
    album: {
      fromFixture: ctx => requireObject(ctx.helpers.state.album, 'album')
    },
    media_item: {
      fromFixture: ctx =>
        ctx.helpers.state.mediaItem ?? {
          failure:
            ctx.helpers.state.mediaItemFailure ??
            'upload_media could not create a disposable media item during setup.'
        }
    },
    picker_session: {
      fromFixture: ctx => requireObject(ctx.helpers.state.pickerSession, 'picker session')
    }
  },
  scenarioOverrides: {
    create_album: {
      name: 'create_album prepares the disposable album during suite setup',
      use: ['album'],
      run: async ctx => {
        if (typeof ctx.resource('album').albumId !== 'string') {
          throw new Error('Disposable album is missing an albumId.');
        }
      }
    },
    update_album: {
      name: 'update_album changes the disposable album title',
      use: ['album'],
      run: async ctx => {
        let album = ctx.resource('album');
        let update = await ctx.invokeTool('update_album', {
          albumId: String(album.albumId),
          title: ctx.namespaced('album updated')
        });

        ctx.updateResource('album', update.output);
      }
    },
    manage_album_media: {
      name: 'manage_album_media adds, removes, and restores the uploaded media item',
      use: ['album', 'media_item'],
      run: async ctx => {
        let album = ctx.resource('album');
        let mediaItem = getMediaItemOrSkip(ctx, 'manage_album_media');
        if (!mediaItem) {
          return;
        }

        let input = {
          albumId: String(album.albumId),
          mediaItemIds: [String(mediaItem.mediaItemId)]
        };

        await ctx.invokeTool('manage_album_media', {
          action: 'add',
          ...input
        });
        await ctx.invokeTool('manage_album_media', {
          action: 'remove',
          ...input
        });
        await ctx.invokeTool('manage_album_media', {
          action: 'add',
          ...input
        });
      }
    },
    add_album_enrichment: {
      name: 'add_album_enrichment appends a text enrichment to the disposable album',
      use: ['album'],
      run: async ctx => {
        let album = ctx.resource('album');

        await ctx.invokeTool('add_album_enrichment', {
          albumId: String(album.albumId),
          text: ctx.namespaced('album enrichment')
        });
      }
    },
    get_media_item: {
      name: 'get_media_item retrieves the uploaded media item by ID',
      use: ['media_item'],
      run: async ctx => {
        let mediaItem = getMediaItemOrSkip(ctx, 'get_media_item');
        if (!mediaItem) {
          return;
        }
        let result = await ctx.invokeTool('get_media_item', {
          mediaItemIds: [String(mediaItem.mediaItemId)]
        });

        let retrieved = result.output.mediaItems[0];
        if (!retrieved || retrieved.mediaItemId !== String(mediaItem.mediaItemId)) {
          throw new Error('get_media_item did not return the tracked media item.');
        }

        ctx.updateResource('media_item', retrieved);
      }
    },
    search_media_items: {
      name: 'search_media_items finds the uploaded media item in the disposable album',
      use: ['album', 'media_item'],
      run: async ctx => {
        let album = ctx.resource('album');
        let mediaItem = getMediaItemOrSkip(ctx, 'search_media_items');
        if (!mediaItem) {
          return;
        }
        let result = await ctx.invokeTool('search_media_items', {
          albumId: String(album.albumId)
        });

        if (
          !result.output.mediaItems.some(
            candidate => candidate.mediaItemId === String(mediaItem.mediaItemId)
          )
        ) {
          throw new Error('search_media_items did not return the tracked media item.');
        }
      }
    },
    update_media_item: {
      name: 'update_media_item changes the uploaded media item description',
      use: ['media_item'],
      run: async ctx => {
        let mediaItem = getMediaItemOrSkip(ctx, 'update_media_item');
        if (!mediaItem) {
          return;
        }

        await ctx.invokeTool('update_media_item', {
          mediaItemId: String(mediaItem.mediaItemId),
          description: UPDATED_MEDIA_DESCRIPTION
        });

        let readBack = await ctx.invokeTool('get_media_item', {
          mediaItemIds: [String(mediaItem.mediaItemId)]
        });
        let updated = readBack.output.mediaItems[0];
        if (!updated) {
          throw new Error('get_media_item did not return the updated media item.');
        }
        if (updated.description !== UPDATED_MEDIA_DESCRIPTION) {
          throw new Error('update_media_item did not persist the updated description.');
        }

        ctx.updateResource('media_item', updated);
      }
    },
    upload_media: {
      name: 'upload_media prepares the uploaded media item during suite setup',
      use: ['media_item'],
      run: async ctx => {
        let mediaItem = getMediaItemOrSkip(ctx, 'upload_media');
        if (!mediaItem) {
          return;
        }
      }
    },
    create_picker_session: {
      name: 'create_picker_session prepares the disposable picker session during suite setup',
      use: ['picker_session'],
      run: async ctx => {
        if (typeof ctx.resource('picker_session').sessionId !== 'string') {
          throw new Error('Disposable picker session is missing a sessionId.');
        }
      }
    },
    list_picked_media: {
      name: 'list_picked_media handles either a ready or pending picker session',
      use: ['picker_session'],
      run: async ctx => {
        let pickerSession = ctx.resource('picker_session');
        let sessionId = String(pickerSession.sessionId);

        let current = await ctx.invokeTool('get_picker_session', { sessionId });
        ctx.updateResource('picker_session', current.output);

        if (current.output.mediaItemsSet !== true) {
          return;
        }

        try {
          await ctx.invokeTool('list_picked_media', {
            sessionId,
            pageSize: 10
          });
        } catch (error) {
          let message = normalizeError(error);
          if (
            current.output.mediaItemsSet !== true &&
            (message.includes('failed_precondition') ||
              message.includes('failed precondition'))
          ) {
            return;
          }
          throw error;
        }
      }
    },
    delete_picker_session: {
      name: 'delete_picker_session removes the disposable picker session',
      use: ['picker_session'],
      run: async ctx => {
        let pickerSession = ctx.resource('picker_session');
        let result = await ctx.invokeTool('delete_picker_session', {
          sessionId: String(pickerSession.sessionId)
        });

        if (!result.output.deleted) {
          throw new Error('delete_picker_session did not confirm deletion.');
        }

        ctx.deleteResource('picker_session');
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googlePhotosToolE2E
});
