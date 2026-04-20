import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { z } from 'zod';
import { SlackClient } from './lib/client';
import { provider } from './index';

let wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type SlackFixtures = {
  channelId: string;
};

type SlackHelpers = {
  client: SlackClient;
};

let MANAGED_CHANNEL_PREFIX = 'slates-e2e-slack-';
let MANAGED_CHANNEL_STALE_AFTER_SECONDS = 60 * 60;

let toChannelName = (runId: string, suffix: string) => {
  let base = `${runId}-${suffix}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return base || `slates-${suffix}`;
};

export let slackToolE2E = defineSlateToolE2EIntegration<SlackFixtures, SlackHelpers>({
  fixturesSchema: z.object({
    channelId: z.string()
  }),
  createHelpers: ctx => ({
    client: new SlackClient(ctx.auth.token)
  }),
  beforeSuite: async ctx => {
    let token = String(ctx.auth.token ?? '');
    if (!token.startsWith('xoxp-')) {
      throw new Error(
        'Slack live E2E requires a user token (xoxp-) so search_messages can run.'
      );
    }
  },
  resources: {
    channel: {
      fromFixture: ctx => ({
        channelId: ctx.fixtures.channelId
      })
    },
    message: {
      use: ['channel'],
      create: async ctx => {
        let channel = ctx.resource('channel');
        let text = ctx.namespaced('message');
        let result = await ctx.invokeTool('send_message', {
          channelId: String(channel.channelId),
          text
        });
        return {
          ...result.output,
          text
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.channelId || !value.messageTs) {
            return;
          }
          await ctx.helpers.client.deleteMessage({
            channel: String(value.channelId),
            ts: String(value.messageTs)
          });
        }
      }
    },
    scheduled_message: {
      use: ['channel'],
      create: async ctx => {
        let channel = ctx.resource('channel');
        let input = {
          channelId: String(channel.channelId),
          postAt: Math.floor(Date.now() / 1000) + 3600,
          text: ctx.namespaced('scheduled message')
        };
        let result = await ctx.invokeTool('schedule_message', input);
        return {
          ...result.output,
          channelId: input.channelId,
          text: input.text
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.channelId || !value.scheduledMessageId) {
            return;
          }
          await ctx.helpers.client.deleteScheduledMessage({
            channel: String(value.channelId),
            scheduledMessageId: String(value.scheduledMessageId)
          });
        }
      }
    },
    managed_channel: {
      create: async ctx => {
        let result = await ctx.invokeTool('manage_channel', {
          action: 'create',
          name: toChannelName(ctx.runId, 'channel'),
          isPrivate: true,
          topic: ctx.namespaced('topic'),
          purpose: ctx.namespaced('purpose')
        });
        return result.output;
      },
      cleanup: {
        kind: 'soft',
        run: async (ctx, value) => {
          if (!value.channelId) {
            return;
          }
          await ctx.helpers.client.archiveConversation(String(value.channelId));
        }
      },
      janitor: async ctx => {
        let result = await ctx.helpers.client.listConversations({
          types: 'public_channel,private_channel',
          excludeArchived: false,
          limit: 200
        });
        let staleBefore = Math.floor(Date.now() / 1000) - MANAGED_CHANNEL_STALE_AFTER_SECONDS;

        for (let channel of result.channels) {
          if (!channel.name?.startsWith(MANAGED_CHANNEL_PREFIX)) {
            continue;
          }
          if (channel.is_archived) {
            continue;
          }
          if (typeof channel.created !== 'number' || channel.created >= staleBefore) {
            continue;
          }
          await ctx.helpers.client.archiveConversation(channel.id);
        }
      }
    },
    file: {
      use: ['channel'],
      create: async ctx => {
        let channel = ctx.resource('channel');
        let result = await ctx.invokeTool('manage_files', {
          action: 'upload',
          content: `${ctx.runId}\nfile contents`,
          filename: 'slates-e2e.txt',
          filetype: 'text',
          title: ctx.namespaced('file'),
          channelIds: String(channel.channelId)
        });
        let fileId = result.output.file?.fileId;
        if (!fileId) {
          throw new Error('manage_files upload did not return a fileId.');
        }

        return {
          fileId,
          channelId: String(channel.channelId)
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.fileId === 'string') {
            await ctx.helpers.client.deleteFile(value.fileId);
          }
        }
      }
    },
    reminder: {
      create: async ctx => {
        let result = await ctx.invokeTool('manage_reminders', {
          action: 'create',
          text: ctx.namespaced('reminder'),
          time: 'in 30 minutes'
        });
        let reminder = result.output.reminder;
        if (!reminder?.reminderId) {
          throw new Error('manage_reminders create did not return a reminderId.');
        }
        return reminder;
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.reminderId === 'string') {
            await ctx.helpers.client.deleteReminder(value.reminderId);
          }
        }
      }
    },
    bookmark: {
      use: ['channel'],
      create: async ctx => {
        let channel = ctx.resource('channel');
        let result = await ctx.invokeTool('manage_bookmarks', {
          action: 'add',
          channelId: String(channel.channelId),
          title: ctx.namespaced('bookmark'),
          link: 'https://example.com/slates-e2e',
          emoji: 'bookmark',
          type: 'link'
        });
        let bookmark = result.output.bookmark;
        if (!bookmark?.bookmarkId) {
          throw new Error('manage_bookmarks add did not return a bookmarkId.');
        }
        return {
          ...bookmark,
          channelId: bookmark.channelId ?? String(channel.channelId)
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.channelId || !value.bookmarkId) {
            return;
          }
          await ctx.helpers.client.removeBookmark(
            String(value.channelId),
            String(value.bookmarkId)
          );
        }
      }
    }
  },
  scenarioOverrides: {
    send_message: {
      name: 'send_message posts a live message',
      use: ['message'],
      run: async () => {}
    },
    update_message: {
      name: 'update_message edits the tracked message',
      use: ['message'],
      run: async ctx => {
        let message = ctx.resource('message');
        let updatedText = ctx.namespaced('message updated');

        await ctx.invokeTool('update_message', {
          channelId: String(message.channelId),
          messageTs: String(message.messageTs),
          action: 'update',
          text: updatedText
        });

        let history = await ctx.invokeTool('get_conversation_history', {
          channelId: String(message.channelId),
          limit: 50
        });
        let updated = history.output.messages.find(
          (candidate: { ts?: string }) => candidate.ts === String(message.messageTs)
        );
        if (!updated || updated.text !== updatedText) {
          throw new Error('update_message did not persist the new text.');
        }

        ctx.updateResource('message', {
          text: updatedText
        });
      }
    },
    schedule_message: {
      name: 'schedule_message creates a scheduled message',
      use: ['scheduled_message'],
      run: async () => {}
    },
    get_conversation_history: {
      name: 'get_conversation_history includes the tracked message',
      use: ['message'],
      run: async ctx => {
        let message = ctx.resource('message');
        let result = await ctx.invokeTool('get_conversation_history', {
          channelId: String(message.channelId),
          limit: 50
        });

        let messageTs = String(message.messageTs);
        if (
          !result.output.messages.some(
            (candidate: { ts?: string }) => candidate.ts === messageTs
          )
        ) {
          throw new Error(`get_conversation_history did not include message ${messageTs}.`);
        }
      }
    },
    list_conversations: {
      name: 'list_conversations includes the managed channel',
      use: ['managed_channel'],
      run: async ctx => {
        let managedChannel = ctx.resource('managed_channel');
        let result = await ctx.invokeTool('list_conversations', {
          types: 'public_channel,private_channel',
          excludeArchived: true,
          limit: 100
        });

        if (
          !result.output.channels.some(
            (candidate: { channelId?: string }) =>
              candidate.channelId === String(managedChannel.channelId)
          )
        ) {
          throw new Error('list_conversations did not include the managed channel.');
        }
      }
    },
    manage_channel: {
      name: 'manage_channel updates, archives, and unarchives a channel',
      use: ['managed_channel'],
      run: async ctx => {
        let managedChannel = ctx.resource('managed_channel');
        let channelId = String(managedChannel.channelId);

        let update = await ctx.invokeTool('manage_channel', {
          action: 'update',
          channelId,
          topic: ctx.namespaced('updated topic'),
          purpose: ctx.namespaced('updated purpose')
        });

        await ctx.invokeTool('manage_channel', {
          action: 'archive',
          channelId
        });
        await ctx.invokeTool('manage_channel', {
          action: 'unarchive',
          channelId
        });

        ctx.updateResource('managed_channel', update.output);
      }
    },
    manage_channel_members: {
      name: 'manage_channel_members lists members for the fixture channel',
      use: ['channel'],
      run: async ctx => {
        await ctx.invokeTool('manage_channel_members', {
          action: 'list',
          channelId: String(ctx.resource('channel').channelId),
          limit: 100
        });
      }
    },
    get_user_info: {
      name: 'get_user_info lists workspace users',
      run: async ctx => {
        let result = await ctx.invokeTool('get_user_info', {
          listAll: true,
          limit: 50
        });

        if (result.output.users.length === 0) {
          throw new Error('get_user_info did not return any users.');
        }
      }
    },
    manage_reactions: {
      name: 'manage_reactions adds, lists, and removes a reaction',
      use: ['message'],
      run: async ctx => {
        let message = ctx.resource('message');
        let channelId = String(message.channelId);
        let messageTs = String(message.messageTs);

        await ctx.invokeTool('manage_reactions', {
          action: 'add',
          channelId,
          messageTs,
          emoji: 'thumbsup'
        });

        let list = await ctx.invokeTool('manage_reactions', {
          action: 'list',
          channelId,
          messageTs
        });

        if (
          !list.output.reactions?.some(
            (reaction: { name?: string }) => reaction.name === 'thumbsup'
          )
        ) {
          throw new Error('manage_reactions did not report the expected emoji.');
        }

        await ctx.invokeTool('manage_reactions', {
          action: 'remove',
          channelId,
          messageTs,
          emoji: 'thumbsup'
        });
      }
    },
    manage_pins: {
      name: 'manage_pins pins, lists, and unpins the tracked message',
      use: ['message'],
      run: async ctx => {
        let message = ctx.resource('message');
        let channelId = String(message.channelId);
        let messageTs = String(message.messageTs);

        await ctx.invokeTool('manage_pins', {
          action: 'pin',
          channelId,
          messageTs
        });

        let list = await ctx.invokeTool('manage_pins', {
          action: 'list',
          channelId
        });

        if (!list.output.pins?.some((pin: { messageTs?: string }) => pin.messageTs === messageTs)) {
          throw new Error('manage_pins did not report the pinned message.');
        }

        await ctx.invokeTool('manage_pins', {
          action: 'unpin',
          channelId,
          messageTs
        });
      }
    },
    manage_files: {
      name: 'manage_files uploads and retrieves a file',
      use: ['file'],
      run: async ctx => {
        let file = ctx.resource('file');
        let result = await ctx.invokeTool('manage_files', {
          action: 'get',
          fileId: String(file.fileId)
        });

        if (result.output.file?.fileId !== String(file.fileId)) {
          throw new Error('manage_files get did not return the tracked file.');
        }
      }
    },
    search_messages: {
      name: 'search_messages finds the tracked message',
      use: ['message'],
      run: async ctx => {
        let message = ctx.resource('message');
        let messageTs = String(message.messageTs);
        let query = String(message.text ?? ctx.runId);

        for (let attempt = 0; attempt < 5; attempt += 1) {
          let result = await ctx.invokeTool('search_messages', {
            query,
            count: 20
          });

          if (result.output.matches.some((match: { ts?: string }) => match.ts === messageTs)) {
            return;
          }

          await wait(1000 * (attempt + 1));
        }

        throw new Error(`search_messages did not return the tracked message for "${query}".`);
      }
    },
    manage_reminders: {
      name: 'manage_reminders creates and lists a reminder',
      use: ['reminder'],
      run: async ctx => {
        let reminder = ctx.resource('reminder');
        let result = await ctx.invokeTool('manage_reminders', {
          action: 'list'
        });

        if (
          !result.output.reminders?.some(
            (candidate: { reminderId?: string }) =>
              candidate.reminderId === String(reminder.reminderId)
          )
        ) {
          throw new Error('manage_reminders list did not include the tracked reminder.');
        }
      }
    },
    manage_user_groups: {
      name: 'manage_user_groups lists available user groups',
      run: async ctx => {
        await ctx.invokeTool('manage_user_groups', {
          action: 'list',
          includeDisabled: true
        });
      }
    },
    manage_bookmarks: {
      name: 'manage_bookmarks edits and lists the tracked bookmark',
      use: ['bookmark'],
      run: async ctx => {
        let bookmark = ctx.resource('bookmark');
        let channelId = String(bookmark.channelId);
        let bookmarkId = String(bookmark.bookmarkId);

        let edit = await ctx.invokeTool('manage_bookmarks', {
          action: 'edit',
          channelId,
          bookmarkId,
          title: ctx.namespaced('bookmark updated'),
          link: 'https://example.com/slates-e2e-updated',
          emoji: 'pushpin'
        });

        let list = await ctx.invokeTool('manage_bookmarks', {
          action: 'list',
          channelId
        });

        if (
          !list.output.bookmarks?.some(
            (candidate: { bookmarkId?: string }) => candidate.bookmarkId === bookmarkId
          )
        ) {
          throw new Error('manage_bookmarks did not report the expected bookmark.');
        }

        ctx.updateResource('bookmark', {
          ...edit.output.bookmark,
          channelId
        });
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: slackToolE2E
});
