import { createLocalSlateTestClient, expectSlateContract } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';
import { googleMeetActionScopes } from './scopes';

describe('google-meet provider contract', () => {
  it('exposes the expected provider, tool, trigger, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'google-meet',
        name: 'Google Meet'
      },
      toolIds: [
        'create_space',
        'get_space',
        'update_space',
        'end_active_conference',
        'add_member',
        'list_members',
        'remove_member',
        'list_conference_records',
        'get_conference_record',
        'list_participants',
        'get_participant_sessions',
        'list_recordings',
        'get_recording',
        'list_transcripts',
        'get_transcript',
        'list_transcript_entries'
      ],
      triggerIds: [
        'inbound_webhook',
        'conference_events',
        'participant_events',
        'recording_events',
        'transcript_events'
      ],
      authMethodIds: ['google_oauth'],
      tools: [
        { id: 'create_space', readOnly: false, destructive: false },
        { id: 'get_space', readOnly: true, destructive: false },
        { id: 'update_space', readOnly: false, destructive: false },
        { id: 'end_active_conference', readOnly: false, destructive: true },
        { id: 'add_member', readOnly: false, destructive: false },
        { id: 'list_members', readOnly: true, destructive: false },
        { id: 'remove_member', readOnly: false, destructive: true },
        { id: 'list_conference_records', readOnly: true, destructive: false },
        { id: 'get_conference_record', readOnly: true, destructive: false },
        { id: 'list_participants', readOnly: true, destructive: false },
        { id: 'get_participant_sessions', readOnly: true, destructive: false },
        { id: 'list_recordings', readOnly: true, destructive: false },
        { id: 'get_recording', readOnly: true, destructive: false },
        { id: 'list_transcripts', readOnly: true, destructive: false },
        { id: 'get_transcript', readOnly: true, destructive: false },
        { id: 'list_transcript_entries', readOnly: true, destructive: false }
      ],
      triggers: [
        { id: 'inbound_webhook', invocationType: 'webhook' },
        { id: 'conference_events', invocationType: 'polling' },
        { id: 'participant_events', invocationType: 'polling' },
        { id: 'recording_events', invocationType: 'polling' },
        { id: 'transcript_events', invocationType: 'polling' }
      ]
    });

    expect(contract.actions).toHaveLength(21);
    expect(Object.keys(contract.configSchema.properties ?? {})).toEqual([]);

    let expectedScopes = {
      create_space: googleMeetActionScopes.createSpace,
      get_space: googleMeetActionScopes.getSpace,
      update_space: googleMeetActionScopes.updateSpace,
      end_active_conference: googleMeetActionScopes.endActiveConference,
      add_member: googleMeetActionScopes.addMember,
      list_members: googleMeetActionScopes.listMembers,
      remove_member: googleMeetActionScopes.removeMember,
      list_conference_records: googleMeetActionScopes.listConferenceRecords,
      get_conference_record: googleMeetActionScopes.getConferenceRecord,
      list_participants: googleMeetActionScopes.listParticipants,
      get_participant_sessions: googleMeetActionScopes.getParticipantSessions,
      list_recordings: googleMeetActionScopes.listRecordings,
      get_recording: googleMeetActionScopes.getRecording,
      list_transcripts: googleMeetActionScopes.listTranscripts,
      get_transcript: googleMeetActionScopes.getTranscript,
      list_transcript_entries: googleMeetActionScopes.listTranscriptEntries,
      inbound_webhook: googleMeetActionScopes.inboundWebhook,
      conference_events: googleMeetActionScopes.conferenceEvents,
      participant_events: googleMeetActionScopes.participantEvents,
      recording_events: googleMeetActionScopes.recordingEvents,
      transcript_events: googleMeetActionScopes.transcriptEvents
    };

    for (let [actionId, scopes] of Object.entries(expectedScopes)) {
      expect(contract.actions.find(action => action.id === actionId)?.scopes).toEqual(scopes);
    }

    let oauth = await client.getAuthMethod('google_oauth');
    expect(oauth.authenticationMethod.type).toBe('auth.oauth');
    expect(oauth.authenticationMethod.capabilities.handleTokenRefresh?.enabled).toBe(true);
    expect(oauth.authenticationMethod.capabilities.getProfile?.enabled).toBe(true);
  });
});
