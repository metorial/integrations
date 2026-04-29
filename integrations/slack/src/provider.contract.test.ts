import { createLocalSlateTestClient, expectSlateContract } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';
import { slackActionScopes, slackBotOAuthScopes, slackUserOAuthScopes } from './lib/scopes';

let grantedScopeIds = (scopes: Array<{ scope: string }>) => scopes.map(scope => scope.scope);

let toolIdsAvailableForScopes = (
  tools: Array<{ id: string; scopes?: { AND: Array<{ OR: string[] }> } }>,
  grantedScopes: string[]
) => {
  let granted = new Set(grantedScopes);
  return tools
    .filter(tool =>
      tool.scopes?.AND.every(clause => clause.OR.some(scope => granted.has(scope)))
    )
    .map(tool => tool.id);
};

describe('slack provider contract', () => {
  it('exposes the merged Slack tool and auth surface with scopes', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'slack',
        name: 'Slack'
      },
      toolIds: [
        'send_message',
        'update_message',
        'schedule_message',
        'manage_scheduled_messages',
        'get_conversation_history',
        'get_conversation_info',
        'open_conversation',
        'list_conversations',
        'manage_channel',
        'manage_channel_members',
        'get_user_info',
        'manage_user_status',
        'manage_reactions',
        'manage_pins',
        'manage_files',
        'search_messages',
        'search_files',
        'manage_reminders',
        'manage_user_groups',
        'manage_bookmarks',
        'get_team_info'
      ],
      triggerIds: [
        'new_message',
        'new_message_webhook',
        'channel_activity',
        'new_reaction',
        'new_file',
        'user_change'
      ],
      authMethodIds: ['oauth', 'user_oauth', 'bot_token', 'user_token']
    });

    for (let tool of contract.tools) {
      expect(tool.scopes?.AND.length).toBeGreaterThan(0);
    }

    expect(contract.actions.find(action => action.id === 'send_message')?.scopes).toEqual(
      slackActionScopes.chatWrite
    );
    expect(contract.actions.find(action => action.id === 'search_messages')?.scopes).toEqual(
      slackActionScopes.search
    );
    expect(
      contract.actions.find(action => action.id === 'manage_user_status')?.scopes
    ).toEqual(slackActionScopes.userStatus);
    expect(contract.actions.find(action => action.id === 'manage_reminders')?.scopes).toEqual(
      slackActionScopes.reminders
    );

    let botOAuth = await client.getAuthMethod('oauth');
    let userOAuth = await client.getAuthMethod('user_oauth');
    expect(
      botOAuth.authenticationMethod.scopes?.some(scope => scope.id === 'search:read')
    ).toBe(false);
    expect(
      userOAuth.authenticationMethod.scopes?.some(scope => scope.id === 'search:read')
    ).toBe(true);
  });

  it('models bot and user scope availability distinctly', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let tools = (await client.listTools()) as Array<{
      id: string;
      scopes?: { AND: Array<{ OR: string[] }> };
    }>;

    let botTools = toolIdsAvailableForScopes(tools, grantedScopeIds(slackBotOAuthScopes));
    expect(botTools).toContain('send_message');
    expect(botTools).not.toContain('manage_reminders');
    expect(botTools).not.toContain('search_messages');
    expect(botTools).not.toContain('search_files');
    expect(botTools).not.toContain('manage_user_status');

    let userTools = toolIdsAvailableForScopes(tools, grantedScopeIds(slackUserOAuthScopes));
    expect(userTools).toContain('send_message');
    expect(userTools).toContain('manage_reminders');
    expect(userTools).toContain('search_messages');
    expect(userTools).toContain('search_files');
    expect(userTools).toContain('manage_user_status');

    let chatOnlyTools = toolIdsAvailableForScopes(tools, ['chat:write']);
    expect(chatOnlyTools).toEqual([
      'send_message',
      'update_message',
      'schedule_message',
      'manage_scheduled_messages'
    ]);
  });
});
