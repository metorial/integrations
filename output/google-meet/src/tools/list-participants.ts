import { SlateTool } from 'slates';
import { MeetClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let participantSchema = z.object({
  participantName: z.string().describe('Resource name of the participant'),
  displayName: z.string().optional().describe('Display name of the participant'),
  userType: z.enum(['signedIn', 'anonymous', 'phone']).describe('Type of participant'),
  userResourceName: z.string().optional().describe('User resource name for signed-in users'),
  earliestStartTime: z.string().optional().describe('When the participant first joined'),
  latestEndTime: z.string().optional().describe('When the participant last left')
});

let mapParticipant = (p: any) => {
  let userType: 'signedIn' | 'anonymous' | 'phone' = 'anonymous';
  let displayName: string | undefined;
  let userResourceName: string | undefined;

  if (p.signedinUser) {
    userType = 'signedIn';
    displayName = p.signedinUser.displayName;
    userResourceName = p.signedinUser.user;
  } else if (p.phoneUser) {
    userType = 'phone';
    displayName = p.phoneUser.displayName;
  } else if (p.anonymousUser) {
    userType = 'anonymous';
    displayName = p.anonymousUser.displayName;
  }

  return {
    participantName: p.name || '',
    displayName,
    userType,
    userResourceName,
    earliestStartTime: p.earliestStartTime,
    latestEndTime: p.latestEndTime
  };
};

export let listParticipantsTool = SlateTool.create(
  spec,
  {
    name: 'List Participants',
    key: 'list_participants',
    description: `List participants of a conference. Returns signed-in users, anonymous users, and phone users with their join/leave times. Available during and up to 30 days after a conference.`,
    tags: {
      destructive: false,
      readOnly: true
    }
  }
)
  .input(z.object({
    conferenceRecordName: z.string().describe('Conference record resource name (e.g., "conferenceRecords/abc123")'),
    filter: z.string().optional().describe('Filter expression for participants'),
    pageSize: z.number().optional().describe('Maximum number of participants to return'),
    pageToken: z.string().optional().describe('Page token for pagination')
  }))
  .output(z.object({
    participants: z.array(participantSchema),
    nextPageToken: z.string().optional().describe('Token for the next page')
  }))
  .handleInvocation(async (ctx) => {
    let client = new MeetClient({ token: ctx.auth.token });

    let result = await client.listParticipants(
      ctx.input.conferenceRecordName,
      ctx.input.pageSize,
      ctx.input.pageToken,
      ctx.input.filter
    );

    let participants = result.participants.map(mapParticipant);

    return {
      output: {
        participants,
        nextPageToken: result.nextPageToken
      },
      message: `Found **${participants.length}** participant(s) in the conference.${result.nextPageToken ? ' More results available.' : ''}`
    };
  }).build();

export let getParticipantSessionsTool = SlateTool.create(
  spec,
  {
    name: 'Get Participant Sessions',
    key: 'get_participant_sessions',
    description: `Retrieve the individual join/leave sessions for a specific participant in a conference. Each session represents a unique connection — a participant may have multiple sessions if they join, leave, and rejoin.`,
    tags: {
      destructive: false,
      readOnly: true
    }
  }
)
  .input(z.object({
    participantName: z.string().describe('Participant resource name (e.g., "conferenceRecords/abc123/participants/def456")'),
    pageSize: z.number().optional().describe('Maximum number of sessions to return'),
    pageToken: z.string().optional().describe('Page token for pagination')
  }))
  .output(z.object({
    sessions: z.array(z.object({
      sessionName: z.string().describe('Resource name of the session'),
      startTime: z.string().optional().describe('When the session started'),
      endTime: z.string().optional().describe('When the session ended (empty if still active)')
    })),
    nextPageToken: z.string().optional().describe('Token for the next page')
  }))
  .handleInvocation(async (ctx) => {
    let client = new MeetClient({ token: ctx.auth.token });

    let result = await client.listParticipantSessions(
      ctx.input.participantName,
      ctx.input.pageSize,
      ctx.input.pageToken
    );

    let sessions = result.participantSessions.map(s => ({
      sessionName: s.name || '',
      startTime: s.startTime,
      endTime: s.endTime
    }));

    return {
      output: {
        sessions,
        nextPageToken: result.nextPageToken
      },
      message: `Found **${sessions.length}** session(s) for the participant.`
    };
  }).build();
