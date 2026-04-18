import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { z } from 'zod';
import { provider } from './index';

type GoogleMeetFixtures = {
  spaceName?: string;
  memberEmail?: string;
  conferenceRecordName?: string;
  participantName?: string;
  recordingName?: string;
  transcriptName?: string;
};

let createSpaceInput = () => ({});

let requireString = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} did not return a non-empty string.`);
  }

  return value;
};

let getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

let shouldSkipSpaceConfigMutation = (error: unknown) =>
  getErrorMessage(error).includes('not available to the user');

let createDisposableSpace = async (ctx: {
  invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
}) => {
  let result = await ctx.invokeTool('create_space', createSpaceInput());

  return {
    spaceName: requireString(result.output.spaceName, 'create_space spaceName'),
    meetingCode: requireString(result.output.meetingCode, 'create_space meetingCode')
  };
};

let getRequiredFixturesOrSkip = <
  Keys extends ReadonlyArray<keyof GoogleMeetFixtures>
>(
  ctx: { fixtures: GoogleMeetFixtures },
  scenarioName: string,
  keys: Keys
): { [K in Keys[number]]: string } | null => {
  let missing = keys.filter(key => {
    let value = ctx.fixtures[key];
    return typeof value !== 'string' || value.length === 0;
  });

  if (missing.length > 0) {
    console.log(
      `[google-meet e2e] Skipping ${scenarioName}: requires ` +
        `SLATES_E2E_FIXTURES with ${missing.join(', ')}.`
    );
    return null;
  }

  return Object.fromEntries(
    keys.map(key => [key, String(ctx.fixtures[key])])
  ) as { [K in Keys[number]]: string };
};

let withManagedMember = async (
  ctx: {
    fixtures: GoogleMeetFixtures;
    invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
    registerCleanup(task: () => Promise<void>, label?: string): void;
  },
  scenarioName: string,
  run: (member: {
    spaceName: string;
    memberEmail: string;
    memberName: string;
    markRemoved(): void;
  }) => Promise<void>
) => {
  let fixtures = getRequiredFixturesOrSkip(ctx, scenarioName, ['memberEmail'] as const);
  if (!fixtures) {
    return;
  }

  let space = await createDisposableSpace(ctx);
  let result = await ctx.invokeTool('add_member', {
    spaceName: space.spaceName,
    email: fixtures.memberEmail,
    role: 'COHOST'
  });
  let memberName = requireString(result.output.memberName, 'add_member memberName');
  let removed = false;

  ctx.registerCleanup(
    async () => {
      if (!removed) {
        try {
          await ctx.invokeTool('remove_member', {
            memberName
          });
        } catch {}
      }
    },
    `cleanup:${scenarioName}:member`
  );

  await run({
    spaceName: space.spaceName,
    memberEmail: fixtures.memberEmail,
    memberName,
    markRemoved: () => {
      removed = true;
    }
  });
};

export let googleMeetToolE2E = defineSlateToolE2EIntegration<GoogleMeetFixtures>({
  fixturesSchema: z.object({
    spaceName: z.string().optional(),
    memberEmail: z.string().email().optional(),
    conferenceRecordName: z.string().optional(),
    participantName: z.string().optional(),
    recordingName: z.string().optional(),
    transcriptName: z.string().optional()
  }),
  scenarioOverrides: {
    create_space: {
      name: 'create_space creates a disposable meeting space',
      run: async ctx => {
        let result = await ctx.invokeTool('create_space', createSpaceInput());

        requireString(result.output.spaceName, 'create_space spaceName');
        requireString(result.output.meetingCode, 'create_space meetingCode');
      }
    },
    get_space: {
      name: 'get_space returns a disposable created space',
      run: async ctx => {
        let created = await createDisposableSpace(ctx);
        let result = await ctx.invokeTool('get_space', {
          spaceNameOrCode: created.meetingCode
        });

        if (result.output.spaceName !== created.spaceName) {
          throw new Error('get_space did not return the created space.');
        }
      }
    },
    update_space: {
      name: 'update_space updates a disposable meeting space',
      run: async ctx => {
        let created = await ctx.invokeTool('create_space', createSpaceInput());
        let spaceName = requireString(created.output.spaceName, 'create_space spaceName');

        let updated;
        try {
          updated = await ctx.invokeTool('update_space', {
            spaceName,
            accessType: 'TRUSTED',
            moderation: 'ON',
            moderationRestrictions: {
              chatRestriction: 'HOSTS_ONLY',
              reactionRestriction: 'NO_RESTRICTION'
            }
          });
        } catch (error) {
          if (!shouldSkipSpaceConfigMutation(error)) {
            throw error;
          }

          console.log(
            '[google-meet e2e] Skipping update_space: this account cannot modify Google Meet space configuration.'
          );
          return;
        }

        if (updated.output.spaceName !== spaceName) {
          throw new Error('update_space did not return the updated space.');
        }
      }
    },
    end_active_conference: {
      name: 'end_active_conference targets the fixture space',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'end_active_conference',
          ['spaceName'] as const
        );
        if (!fixtures) {
          return;
        }

        await ctx.invokeTool('end_active_conference', {
          spaceName: fixtures.spaceName
        });
      }
    },
    add_member: {
      name: 'add_member adds a configured user to a disposable space',
      run: async ctx => {
        await withManagedMember(ctx, 'add_member', async () => {});
      }
    },
    list_members: {
      name: 'list_members returns the added member from a disposable space',
      run: async ctx => {
        await withManagedMember(ctx, 'list_members', async member => {
          let result = await ctx.invokeTool('list_members', {
            spaceName: member.spaceName,
            pageSize: 50
          });

          if (
            !result.output.members.some(
              (candidate: { memberName?: string }) => candidate.memberName === member.memberName
            )
          ) {
            throw new Error('list_members did not include the tracked member.');
          }
        });
      }
    },
    remove_member: {
      name: 'remove_member removes the tracked member from a disposable space',
      run: async ctx => {
        await withManagedMember(ctx, 'remove_member', async member => {
          await ctx.invokeTool('remove_member', {
            memberName: member.memberName
          });
          member.markRemoved();
        });
      }
    },
    list_conference_records: {
      name: 'list_conference_records lists recent records and includes the fixture record',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'list_conference_records',
          ['conferenceRecordName'] as const
        );
        if (!fixtures) {
          return;
        }

        let conferenceRecordName = fixtures.conferenceRecordName;
        let result = await ctx.invokeTool('list_conference_records', {
          pageSize: 25
        });

        if (
          !result.output.conferenceRecords.some(
            (candidate: { conferenceRecordName?: string }) =>
              candidate.conferenceRecordName === conferenceRecordName
          )
        ) {
          throw new Error('list_conference_records did not include the fixture record.');
        }
      }
    },
    get_conference_record: {
      name: 'get_conference_record returns the fixture record',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'get_conference_record',
          ['conferenceRecordName'] as const
        );
        if (!fixtures) {
          return;
        }

        let conferenceRecordName = fixtures.conferenceRecordName;
        let result = await ctx.invokeTool('get_conference_record', {
          conferenceRecordName
        });

        if (result.output.conferenceRecordName !== conferenceRecordName) {
          throw new Error('get_conference_record did not return the fixture record.');
        }
      }
    },
    list_participants: {
      name: 'list_participants includes the fixture participant',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'list_participants',
          ['conferenceRecordName', 'participantName'] as const
        );
        if (!fixtures) {
          return;
        }

        let conferenceRecordName = fixtures.conferenceRecordName;
        let participantName = fixtures.participantName;
        let result = await ctx.invokeTool('list_participants', {
          conferenceRecordName,
          pageSize: 50
        });

        if (
          !result.output.participants.some(
            (candidate: { participantName?: string }) => candidate.participantName === participantName
          )
        ) {
          throw new Error('list_participants did not include the fixture participant.');
        }
      }
    },
    get_participant_sessions: {
      name: 'get_participant_sessions returns sessions for the fixture participant',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'get_participant_sessions',
          ['participantName'] as const
        );
        if (!fixtures) {
          return;
        }

        await ctx.invokeTool('get_participant_sessions', {
          participantName: fixtures.participantName,
          pageSize: 25
        });
      }
    },
    list_recordings: {
      name: 'list_recordings includes the fixture recording',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'list_recordings',
          ['conferenceRecordName', 'recordingName'] as const
        );
        if (!fixtures) {
          return;
        }

        let conferenceRecordName = fixtures.conferenceRecordName;
        let recordingName = fixtures.recordingName;
        let result = await ctx.invokeTool('list_recordings', {
          conferenceRecordName,
          pageSize: 25
        });

        if (
          !result.output.recordings.some(
            (candidate: { recordingName?: string }) => candidate.recordingName === recordingName
          )
        ) {
          throw new Error('list_recordings did not include the fixture recording.');
        }
      }
    },
    get_recording: {
      name: 'get_recording returns the fixture recording',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'get_recording',
          ['recordingName'] as const
        );
        if (!fixtures) {
          return;
        }

        let recordingName = fixtures.recordingName;
        let result = await ctx.invokeTool('get_recording', {
          recordingName
        });

        if (result.output.recordingName !== recordingName) {
          throw new Error('get_recording did not return the fixture recording.');
        }
      }
    },
    list_transcripts: {
      name: 'list_transcripts includes the fixture transcript',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'list_transcripts',
          ['conferenceRecordName', 'transcriptName'] as const
        );
        if (!fixtures) {
          return;
        }

        let conferenceRecordName = fixtures.conferenceRecordName;
        let transcriptName = fixtures.transcriptName;
        let result = await ctx.invokeTool('list_transcripts', {
          conferenceRecordName,
          pageSize: 25
        });

        if (
          !result.output.transcripts.some(
            (candidate: { transcriptName?: string }) => candidate.transcriptName === transcriptName
          )
        ) {
          throw new Error('list_transcripts did not include the fixture transcript.');
        }
      }
    },
    get_transcript: {
      name: 'get_transcript returns the fixture transcript',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'get_transcript',
          ['transcriptName'] as const
        );
        if (!fixtures) {
          return;
        }

        let transcriptName = fixtures.transcriptName;
        let result = await ctx.invokeTool('get_transcript', {
          transcriptName
        });

        if (result.output.transcriptName !== transcriptName) {
          throw new Error('get_transcript did not return the fixture transcript.');
        }
      }
    },
    list_transcript_entries: {
      name: 'list_transcript_entries returns entries for the fixture transcript',
      run: async ctx => {
        let fixtures = getRequiredFixturesOrSkip(
          ctx,
          'list_transcript_entries',
          ['transcriptName'] as const
        );
        if (!fixtures) {
          return;
        }

        await ctx.invokeTool('list_transcript_entries', {
          transcriptName: fixtures.transcriptName,
          pageSize: 100
        });
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleMeetToolE2E
});
