import {
  createLocalSlateTestClient,
  handleSlateTriggerWebhook,
  mapSlateTriggerEvent
} from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from '../index';

(globalThis as typeof globalThis & { expect?: typeof expect }).expect = expect;

let createSlackTriggerTestClient = () =>
  createLocalSlateTestClient({
    slate: provider,
    state: {
      config: {},
      auth: {
        authenticationMethodId: 'oauth',
        output: {
          token: 'test-token'
        }
      }
    }
  });

describe('slack new_message_webhook trigger', () => {
  it('ignores invalid JSON payloads', async () => {
    let client = createSlackTriggerTestClient();

    let handled = await handleSlateTriggerWebhook({
      client,
      triggerId: 'new_message_webhook',
      url: 'https://example.com/hooks/slack/messages',
      headers: {
        'content-type': 'application/json'
      },
      body: '{"type":'
    });

    expect(handled.inputs).toEqual([]);
  });

  it('ignores Slack URL verification payloads', async () => {
    let client = createSlackTriggerTestClient();

    let handled = await handleSlateTriggerWebhook({
      client,
      triggerId: 'new_message_webhook',
      url: 'https://example.com/hooks/slack/messages',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        type: 'url_verification',
        challenge: 'challenge-token'
      })
    });

    expect(handled.inputs).toEqual([]);
  });

  it('ignores non-message callbacks', async () => {
    let client = createSlackTriggerTestClient();

    let handled = await handleSlateTriggerWebhook({
      client,
      triggerId: 'new_message_webhook',
      url: 'https://example.com/hooks/slack/messages',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        type: 'event_callback',
        event: {
          type: 'reaction_added',
          user: 'U123'
        }
      })
    });

    expect(handled.inputs).toEqual([]);
  });

  it('parses a valid message callback and maps it', async () => {
    let client = createSlackTriggerTestClient();

    let handled = await handleSlateTriggerWebhook({
      client,
      triggerId: 'new_message_webhook',
      url: 'https://example.com/hooks/slack/messages',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        type: 'event_callback',
        event: {
          type: 'message',
          channel: 'C123',
          user: 'U234',
          text: 'hello from slack',
          ts: '1710000000.000001',
          thread_ts: '1710000000.000000'
        }
      })
    });

    expect(handled.inputs).toEqual([
      {
        messageTs: '1710000000.000001',
        channelId: 'C123',
        text: 'hello from slack',
        userId: 'U234',
        threadTs: '1710000000.000000',
        subtype: undefined,
        botId: undefined
      }
    ]);

    let mapped = await mapSlateTriggerEvent({
      client,
      triggerId: 'new_message_webhook',
      input: handled.inputs[0]!,
      type: 'message.new',
      output: {
        messageTs: '1710000000.000001',
        channelId: 'C123',
        text: 'hello from slack',
        userId: 'U234',
        threadTs: '1710000000.000000',
        isThread: true
      }
    });

    expect(mapped.id).toBe('C123-1710000000.000001');
  });
});
