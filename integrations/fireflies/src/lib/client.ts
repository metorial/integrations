import { createAxios } from 'slates';

let httpClient = createAxios({
  baseURL: 'https://api.fireflies.ai'
});

export class FirefliesClient {
  private token: string;

  constructor(config: { token: string }) {
    this.token = config.token;
  }

  private async query<T = any>(
    graphqlQuery: string,
    variables?: Record<string, any>
  ): Promise<T> {
    let response = await httpClient.post(
      '/graphql',
      {
        query: graphqlQuery,
        variables
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors && response.data.errors.length > 0) {
      let error = response.data.errors[0];
      throw new Error(error.message || 'GraphQL request failed');
    }

    return response.data.data as T;
  }

  // ── Transcripts ──

  async getTranscripts(params?: {
    keyword?: string;
    scope?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    skip?: number;
    organizers?: string[];
    participants?: string[];
    userId?: string;
    mine?: boolean;
    channelId?: string;
  }) {
    let args: string[] = [];
    if (params?.keyword) args.push(`keyword: "${params.keyword}"`);
    if (params?.scope) args.push(`scope: ${params.scope}`);
    if (params?.fromDate) args.push(`fromDate: "${params.fromDate}"`);
    if (params?.toDate) args.push(`toDate: "${params.toDate}"`);
    if (params?.limit !== undefined) args.push(`limit: ${params.limit}`);
    if (params?.skip !== undefined) args.push(`skip: ${params.skip}`);
    if (params?.organizers) args.push(`organizers: ${JSON.stringify(params.organizers)}`);
    if (params?.participants)
      args.push(`participants: ${JSON.stringify(params.participants)}`);
    if (params?.userId) args.push(`user_id: "${params.userId}"`);
    if (params?.mine !== undefined) args.push(`mine: ${params.mine}`);
    if (params?.channelId) args.push(`channel_id: "${params.channelId}"`);

    let argsStr = args.length > 0 ? `(${args.join(', ')})` : '';

    let result = await this.query<{ transcripts: any[] }>(`
      query {
        transcripts${argsStr} {
          id
          title
          date
          duration
          organizer_email
          participants
          privacy
          transcript_url
          audio_url
          video_url
          fireflies_users
          is_live
          channels {
            id
            title
          }
        }
      }
    `);

    return result.transcripts;
  }

  async getTranscript(transcriptId: string) {
    let result = await this.query<{ transcript: any }>(
      `
      query GetTranscript($id: String!) {
        transcript(id: $id) {
          id
          title
          date
          duration
          organizer_email
          participants
          privacy
          transcript_url
          audio_url
          video_url
          fireflies_users
          is_live
          meeting_link
          channels {
            id
            title
          }
          speakers {
            id
            name
          }
          summary {
            keywords
            action_items
            outline
            shorthand_bullet
            overview
            bullet_gist
            gist
            short_summary
          }
          sentences {
            index
            text
            raw_text
            start_time
            end_time
            speaker_id
            speaker_name
            ai_filters {
              task
              pricing
              metric
              question
              date_and_time
              sentiment
            }
          }
          meeting_attendees {
            displayName
            email
            phoneNumber
          }
          meeting_attendance {
            name
            join_time
            leave_time
          }
        }
      }
    `,
      { id: transcriptId }
    );

    return result.transcript;
  }

  async deleteTranscript(transcriptId: string) {
    let result = await this.query<{ deleteTranscript: any }>(
      `
      mutation DeleteTranscript($id: String!) {
        deleteTranscript(id: $id) {
          id
          title
          date
        }
      }
    `,
      { id: transcriptId }
    );

    return result.deleteTranscript;
  }

  async updateMeetingTitle(transcriptId: string, title: string) {
    let result = await this.query<{ updateMeetingTitle: any }>(
      `
      mutation UpdateMeetingTitle($input: UpdateMeetingTitleInput!) {
        updateMeetingTitle(input: $input) {
          title
        }
      }
    `,
      { input: { id: transcriptId, title } }
    );

    return result.updateMeetingTitle;
  }

  async updateMeetingPrivacy(transcriptId: string, privacy: string) {
    let result = await this.query<{ updateMeetingPrivacy: any }>(
      `
      mutation UpdateMeetingPrivacy($input: UpdateMeetingPrivacyInput!) {
        updateMeetingPrivacy(input: $input) {
          id
          title
          privacy
        }
      }
    `,
      { input: { id: transcriptId, privacy } }
    );

    return result.updateMeetingPrivacy;
  }

  async updateMeetingChannel(transcriptIds: string[], channelId: string) {
    let result = await this.query<{ updateMeetingChannel: any[] }>(
      `
      mutation UpdateMeetingChannel($input: UpdateMeetingChannelInput!) {
        updateMeetingChannel(input: $input) {
          id
          title
          channels {
            id
          }
        }
      }
    `,
      { input: { transcript_ids: transcriptIds, channel_id: channelId } }
    );

    return result.updateMeetingChannel;
  }

  // ── Audio Upload ──

  async uploadAudio(params: {
    url: string;
    title?: string;
    webhook?: string;
    customLanguage?: string;
    attendees?: Array<{ displayName?: string; email?: string; phoneNumber?: string }>;
    clientReferenceId?: string;
    bypassSizeCheck?: boolean;
  }) {
    let variables: Record<string, any> = {
      input: {
        url: params.url,
        title: params.title,
        webhook: params.webhook,
        custom_language: params.customLanguage,
        attendees: params.attendees,
        client_reference_id: params.clientReferenceId,
        bypass_size_check: params.bypassSizeCheck
      }
    };

    let result = await this.query<{ uploadAudio: any }>(
      `
      mutation UploadAudio($input: AudioUploadInput) {
        uploadAudio(input: $input) {
          success
          title
          message
        }
      }
    `,
      variables
    );

    return result.uploadAudio;
  }

  // ── Users ──

  async getUser(userId?: string) {
    let args = userId ? `(id: "${userId}")` : '';
    let result = await this.query<{ user: any }>(`
      query {
        user${args} {
          user_id
          email
          name
          num_transcripts
          recent_meeting
          recent_transcript
          minutes_consumed
          is_admin
          integrations
        }
      }
    `);

    return result.user;
  }

  async getUsers() {
    let result = await this.query<{ users: any[] }>(`
      query {
        users {
          user_id
          email
          name
          num_transcripts
          recent_meeting
          minutes_consumed
          is_admin
          integrations
        }
      }
    `);

    return result.users;
  }

  async setUserRole(userId: string, role: string) {
    let result = await this.query<{ setUserRole: any }>(
      `
      mutation SetUserRole($userId: String!, $role: Role!) {
        setUserRole(user_id: $userId, role: $role) {
          id
          name
          email
          role
        }
      }
    `,
      { userId, role }
    );

    return result.setUserRole;
  }

  // ── Live Meeting ──

  async addToLiveMeeting(params: {
    meetingLink: string;
    title?: string;
    meetingPassword?: string;
    duration?: number;
    language?: string;
  }) {
    let result = await this.query<{ addToLiveMeeting: any }>(
      `
      mutation AddToLive($meetingLink: String!, $title: String, $meetingPassword: String, $duration: Int, $language: String) {
        addToLiveMeeting(
          meeting_link: $meetingLink,
          title: $title,
          meeting_password: $meetingPassword,
          duration: $duration,
          language: $language
        ) {
          success
        }
      }
    `,
      {
        meetingLink: params.meetingLink,
        title: params.title,
        meetingPassword: params.meetingPassword,
        duration: params.duration,
        language: params.language
      }
    );

    return result.addToLiveMeeting;
  }

  async getActiveMeetings(params?: { email?: string; states?: string[] }) {
    let args: string[] = [];
    if (params?.email) args.push(`email: "${params.email}"`);
    if (params?.states && params.states.length > 0) {
      args.push(`states: [${params.states.join(', ')}]`);
    }

    let argsStr = args.length > 0 ? `(${args.join(', ')})` : '';

    let result = await this.query<{ active_meetings: any[] }>(`
      query {
        active_meetings${argsStr} {
          id
          title
          organizer_email
          meeting_link
          start_time
          end_time
          privacy
          state
        }
      }
    `);

    return result.active_meetings;
  }

  // ── Soundbites (Bites) ──

  async createBite(params: {
    transcriptId: string;
    startTime: number;
    endTime: number;
    name?: string;
    mediaType?: string;
    privacies?: string[];
    summary?: string;
  }) {
    let result = await this.query<{ createBite: any }>(
      `
      mutation CreateBite($transcriptId: ID!, $startTime: Float!, $endTime: Float!, $name: String, $mediaType: String, $privacies: [String], $summary: String) {
        createBite(
          transcript_id: $transcriptId,
          start_time: $startTime,
          end_time: $endTime,
          name: $name,
          media_type: $mediaType,
          privacies: $privacies,
          summary: $summary
        ) {
          id
          name
          status
          summary
        }
      }
    `,
      {
        transcriptId: params.transcriptId,
        startTime: params.startTime,
        endTime: params.endTime,
        name: params.name,
        mediaType: params.mediaType,
        privacies: params.privacies,
        summary: params.summary
      }
    );

    return result.createBite;
  }

  // ── Channels ──

  async getChannels() {
    let result = await this.query<{ channels: any[] }>(`
      query {
        channels {
          id
          title
          is_private
          created_by
          created_at
          updated_at
          members {
            user_id
            email
            name
          }
        }
      }
    `);

    return result.channels;
  }

  // ── AskFred ──

  async getAskFredThreads(transcriptId?: string) {
    let args = transcriptId ? `(transcript_id: "${transcriptId}")` : '';
    let result = await this.query<{ askfred_threads: any[] }>(`
      query {
        askfred_threads${args} {
          id
          title
          transcript_id
          user_id
          created_at
        }
      }
    `);

    return result.askfred_threads;
  }

  async getAskFredThread(threadId: string) {
    let result = await this.query<{ askfred_thread: any }>(
      `
      query GetAskFredThread($id: String!) {
        askfred_thread(id: $id) {
          id
          title
          transcript_id
          user_id
          created_at
          messages {
            id
            thread_id
            query
            answer
            suggested_queries
            status
            created_at
            updated_at
          }
        }
      }
    `,
      { id: threadId }
    );

    return result.askfred_thread;
  }

  async createAskFredThread(params: {
    query: string;
    transcriptId?: string;
    filters?: {
      startTime?: string;
      endTime?: string;
      channelIds?: string[];
      organizers?: string[];
      participants?: string[];
      transcriptIds?: string[];
    };
    responseLanguage?: string;
    formatMode?: string;
  }) {
    let input: Record<string, any> = {
      query: params.query
    };

    if (params.transcriptId) input.transcript_id = params.transcriptId;
    if (params.responseLanguage) input.response_language = params.responseLanguage;
    if (params.formatMode) input.format_mode = params.formatMode;

    if (params.filters) {
      let filters: Record<string, any> = {};
      if (params.filters.startTime) filters.start_time = params.filters.startTime;
      if (params.filters.endTime) filters.end_time = params.filters.endTime;
      if (params.filters.channelIds) filters.channel_ids = params.filters.channelIds;
      if (params.filters.organizers) filters.organizers = params.filters.organizers;
      if (params.filters.participants) filters.participants = params.filters.participants;
      if (params.filters.transcriptIds) filters.transcript_ids = params.filters.transcriptIds;
      input.filters = filters;
    }

    let result = await this.query<{ createAskFredThread: any }>(
      `
      mutation CreateAskFredThread($input: CreateAskFredThreadInput!) {
        createAskFredThread(input: $input) {
          message {
            id
            thread_id
            query
            answer
            suggested_queries
            status
            created_at
          }
        }
      }
    `,
      { input }
    );

    return result.createAskFredThread;
  }

  async continueAskFredThread(params: {
    threadId: string;
    query: string;
    responseLanguage?: string;
    formatMode?: string;
  }) {
    let input: Record<string, any> = {
      thread_id: params.threadId,
      query: params.query
    };

    if (params.responseLanguage) input.response_language = params.responseLanguage;
    if (params.formatMode) input.format_mode = params.formatMode;

    let result = await this.query<{ continueAskFredThread: any }>(
      `
      mutation ContinueAskFredThread($input: ContinueAskFredThreadInput!) {
        continueAskFredThread(input: $input) {
          message {
            id
            thread_id
            query
            answer
            suggested_queries
            status
            created_at
          }
        }
      }
    `,
      { input }
    );

    return result.continueAskFredThread;
  }

  async deleteAskFredThread(threadId: string) {
    let result = await this.query<{ deleteAskFredThread: any }>(
      `
      mutation DeleteAskFredThread($id: String!) {
        deleteAskFredThread(id: $id) {
          id
          title
          transcript_id
          user_id
          created_at
        }
      }
    `,
      { id: threadId }
    );

    return result.deleteAskFredThread;
  }

  // ── Meeting Sharing ──

  async shareMeeting(params: { meetingId: string; emails: string[]; expiryDays?: number }) {
    let result = await this.query<{ shareMeeting: any }>(
      `
      mutation ShareMeeting($input: ShareMeetingInput!) {
        shareMeeting(input: $input) {
          success
          message
        }
      }
    `,
      {
        input: {
          meeting_id: params.meetingId,
          emails: params.emails,
          expiry_days: params.expiryDays
        }
      }
    );

    return result.shareMeeting;
  }

  async revokeSharedMeetingAccess(meetingId: string, email: string) {
    let result = await this.query<{ revokeSharedMeetingAccess: any }>(
      `
      mutation RevokeSharedMeetingAccess($input: RevokeSharedMeetingAccessInput!) {
        revokeSharedMeetingAccess(input: $input) {
          success
          message
        }
      }
    `,
      {
        input: {
          meeting_id: meetingId,
          email
        }
      }
    );

    return result.revokeSharedMeetingAccess;
  }

  // ── AI Apps ──

  async getAiApps(params?: {
    appId?: string;
    transcriptId?: string;
    limit?: number;
    skip?: number;
  }) {
    let args: string[] = [];
    if (params?.appId) args.push(`app_id: "${params.appId}"`);
    if (params?.transcriptId) args.push(`transcript_id: "${params.transcriptId}"`);
    if (params?.limit !== undefined) args.push(`limit: ${params.limit}`);
    if (params?.skip !== undefined) args.push(`skip: ${params.skip}`);

    let argsStr = args.length > 0 ? `(${args.join(', ')})` : '';

    let result = await this.query<{ apps: any }>(`
      query {
        apps${argsStr} {
          outputs {
            transcript_id
            user_id
            app_id
            created_at
            title
            prompt
            response
          }
        }
      }
    `);

    return result.apps;
  }
}
