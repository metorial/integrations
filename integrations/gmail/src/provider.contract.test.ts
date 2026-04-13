import { createLocalSlateTestClient, expectSlateContract } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';
import { gmailActionScopes } from './scopes';

describe('gmail provider contract', () => {
  it('exposes the expected provider, tool, trigger, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'gmail',
        name: 'Gmail'
      },
      toolIds: [
        'send_email',
        'search_messages',
        'get_message',
        'modify_message',
        'manage_draft',
        'manage_labels',
        'manage_thread',
        'manage_settings',
        'get_attachment'
      ],
      triggerIds: ['inbound_webhook', 'mailbox_changes'],
      authMethodIds: ['google_oauth'],
      tools: [
        { id: 'send_email', readOnly: false, destructive: false },
        { id: 'search_messages', readOnly: true, destructive: false },
        { id: 'get_message', readOnly: true, destructive: false },
        { id: 'modify_message', readOnly: false, destructive: true },
        { id: 'manage_draft', readOnly: false, destructive: false },
        { id: 'manage_labels', readOnly: false, destructive: false },
        { id: 'manage_thread', readOnly: false, destructive: false },
        { id: 'manage_settings', readOnly: false, destructive: false },
        { id: 'get_attachment', readOnly: true, destructive: false }
      ],
      triggers: [
        { id: 'inbound_webhook', invocationType: 'webhook' },
        { id: 'mailbox_changes', invocationType: 'polling' }
      ]
    });

    expect(contract.actions).toHaveLength(11);
    expect(Object.keys(contract.configSchema.properties ?? {})).toEqual(['userId']);

    let expectedScopes = {
      send_email: gmailActionScopes.sendEmail,
      search_messages: gmailActionScopes.searchMessages,
      get_message: gmailActionScopes.getMessage,
      modify_message: gmailActionScopes.modifyMessage,
      manage_draft: gmailActionScopes.manageDraft,
      manage_labels: gmailActionScopes.manageLabels,
      manage_thread: gmailActionScopes.manageThread,
      manage_settings: gmailActionScopes.manageSettings,
      get_attachment: gmailActionScopes.getAttachment,
      mailbox_changes: gmailActionScopes.mailboxChanges,
      inbound_webhook: gmailActionScopes.inboundWebhook
    };

    for (let [actionId, scopes] of Object.entries(expectedScopes)) {
      expect(contract.actions.find(action => action.id === actionId)?.scopes).toEqual(scopes);
    }

    let oauth = await client.getAuthMethod('google_oauth');
    expect(oauth.authenticationMethod.type).toBe('auth.oauth');
    expect(oauth.authenticationMethod.capabilities.handleTokenRefresh?.enabled).toBe(true);
    expect(oauth.authenticationMethod.capabilities.getProfile?.enabled).toBe(true);

    let scopeTitles = new Set((oauth.authenticationMethod.scopes ?? []).map(scope => scope.title));
    expect(scopeTitles.has('Read-Only')).toBe(true);
    expect(scopeTitles.has('Full Access')).toBe(true);
    expect(scopeTitles.has('User Profile')).toBe(true);
  });
});
