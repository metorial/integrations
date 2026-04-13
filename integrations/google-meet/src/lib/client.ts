import { createAxios } from 'slates';
import type {
  Space,
  SpaceConfig,
  Member,
  ConferenceRecord,
  Participant,
  ParticipantSession,
  Recording,
  Transcript,
  TranscriptEntry
} from './types';

let meetAxios = createAxios({
  baseURL: 'https://meet.googleapis.com'
});

export class MeetClient {
  private headers: Record<string, string>;

  constructor(config: { token: string }) {
    this.headers = {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    };
  }

  // --- Spaces ---

  async createSpace(spaceConfig?: SpaceConfig): Promise<Space> {
    let body: Space = {};
    if (spaceConfig) {
      body.config = spaceConfig;
    }
    let response = await meetAxios.post('/v2/spaces', body, { headers: this.headers });
    return response.data;
  }

  async getSpace(spaceNameOrCode: string): Promise<Space> {
    let name = spaceNameOrCode.startsWith('spaces/')
      ? spaceNameOrCode
      : `spaces/${spaceNameOrCode}`;
    let response = await meetAxios.get(`/v2/${name}`, { headers: this.headers });
    return response.data;
  }

  async updateSpace(
    spaceName: string,
    config: SpaceConfig,
    updateMask: string
  ): Promise<Space> {
    let name = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
    let response = await meetAxios.patch(
      `/v2/${name}`,
      { config },
      {
        headers: this.headers,
        params: { updateMask }
      }
    );
    return response.data;
  }

  async endActiveConference(spaceName: string): Promise<void> {
    let name = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
    await meetAxios.post(`/v2/${name}:endActiveConference`, {}, { headers: this.headers });
  }

  // --- Members (v2beta) ---

  async createMember(
    spaceName: string,
    member: { user?: string; email?: string; role?: string }
  ): Promise<Member> {
    let parent = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
    let response = await meetAxios.post(`/v2beta/${parent}/members`, member, {
      headers: this.headers
    });
    return response.data;
  }

  async getMember(memberName: string): Promise<Member> {
    let response = await meetAxios.get(`/v2beta/${memberName}`, { headers: this.headers });
    return response.data;
  }

  async listMembers(
    spaceName: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{ members: Member[]; nextPageToken?: string }> {
    let parent = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
    let params: Record<string, string | number> = {};
    if (pageSize) params.pageSize = pageSize;
    if (pageToken) params.pageToken = pageToken;

    let response = await meetAxios.get(`/v2beta/${parent}/members`, {
      headers: this.headers,
      params
    });
    return {
      members: response.data.members || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  async deleteMember(memberName: string): Promise<void> {
    await meetAxios.delete(`/v2beta/${memberName}`, { headers: this.headers });
  }

  // --- Conference Records ---

  async getConferenceRecord(name: string): Promise<ConferenceRecord> {
    let fullName = name.startsWith('conferenceRecords/') ? name : `conferenceRecords/${name}`;
    let response = await meetAxios.get(`/v2/${fullName}`, { headers: this.headers });
    return response.data;
  }

  async listConferenceRecords(
    filter?: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{ conferenceRecords: ConferenceRecord[]; nextPageToken?: string }> {
    let params: Record<string, string | number> = {};
    if (filter) params.filter = filter;
    if (pageSize) params.pageSize = pageSize;
    if (pageToken) params.pageToken = pageToken;

    let response = await meetAxios.get('/v2/conferenceRecords', {
      headers: this.headers,
      params
    });
    return {
      conferenceRecords: response.data.conferenceRecords || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  // --- Participants ---

  async getParticipant(name: string): Promise<Participant> {
    let response = await meetAxios.get(`/v2/${name}`, { headers: this.headers });
    return response.data;
  }

  async listParticipants(
    conferenceRecordName: string,
    pageSize?: number,
    pageToken?: string,
    filter?: string
  ): Promise<{ participants: Participant[]; nextPageToken?: string }> {
    let parent = conferenceRecordName.startsWith('conferenceRecords/')
      ? conferenceRecordName
      : `conferenceRecords/${conferenceRecordName}`;
    let params: Record<string, string | number> = {};
    if (pageSize) params.pageSize = pageSize;
    if (pageToken) params.pageToken = pageToken;
    if (filter) params.filter = filter;

    let response = await meetAxios.get(`/v2/${parent}/participants`, {
      headers: this.headers,
      params
    });
    return {
      participants: response.data.participants || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  // --- Participant Sessions ---

  async listParticipantSessions(
    participantName: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{ participantSessions: ParticipantSession[]; nextPageToken?: string }> {
    let params: Record<string, string | number> = {};
    if (pageSize) params.pageSize = pageSize;
    if (pageToken) params.pageToken = pageToken;

    let response = await meetAxios.get(`/v2/${participantName}/participantSessions`, {
      headers: this.headers,
      params
    });
    return {
      participantSessions: response.data.participantSessions || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  // --- Recordings ---

  async getRecording(name: string): Promise<Recording> {
    let response = await meetAxios.get(`/v2/${name}`, { headers: this.headers });
    return response.data;
  }

  async listRecordings(
    conferenceRecordName: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{ recordings: Recording[]; nextPageToken?: string }> {
    let parent = conferenceRecordName.startsWith('conferenceRecords/')
      ? conferenceRecordName
      : `conferenceRecords/${conferenceRecordName}`;
    let params: Record<string, string | number> = {};
    if (pageSize) params.pageSize = pageSize;
    if (pageToken) params.pageToken = pageToken;

    let response = await meetAxios.get(`/v2/${parent}/recordings`, {
      headers: this.headers,
      params
    });
    return {
      recordings: response.data.recordings || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  // --- Transcripts ---

  async getTranscript(name: string): Promise<Transcript> {
    let response = await meetAxios.get(`/v2/${name}`, { headers: this.headers });
    return response.data;
  }

  async listTranscripts(
    conferenceRecordName: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{ transcripts: Transcript[]; nextPageToken?: string }> {
    let parent = conferenceRecordName.startsWith('conferenceRecords/')
      ? conferenceRecordName
      : `conferenceRecords/${conferenceRecordName}`;
    let params: Record<string, string | number> = {};
    if (pageSize) params.pageSize = pageSize;
    if (pageToken) params.pageToken = pageToken;

    let response = await meetAxios.get(`/v2/${parent}/transcripts`, {
      headers: this.headers,
      params
    });
    return {
      transcripts: response.data.transcripts || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  // --- Transcript Entries ---

  async getTranscriptEntry(name: string): Promise<TranscriptEntry> {
    let response = await meetAxios.get(`/v2/${name}`, { headers: this.headers });
    return response.data;
  }

  async listTranscriptEntries(
    transcriptName: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{ transcriptEntries: TranscriptEntry[]; nextPageToken?: string }> {
    let params: Record<string, string | number> = {};
    if (pageSize) params.pageSize = pageSize;
    if (pageToken) params.pageToken = pageToken;

    let response = await meetAxios.get(`/v2/${transcriptName}/entries`, {
      headers: this.headers,
      params
    });
    return {
      transcriptEntries: response.data.transcriptEntries || [],
      nextPageToken: response.data.nextPageToken
    };
  }
}
