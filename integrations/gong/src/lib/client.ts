import { createAxios } from 'slates';

export class GongClient {
  private axios;
  private authHeader: string;

  constructor(opts: { token: string; baseUrl: string }) {
    // Determine auth header: OAuth tokens are Bearer, Basic Auth tokens are Basic
    // If token looks like a JWT or regular access token (no colon when decoded), use Bearer
    // Basic auth tokens are base64-encoded "accessKey:secret", OAuth tokens are opaque strings
    // We check if baseUrl is the default (basic auth) or customer-specific (OAuth)
    // However, the simplest approach: basic auth tokens from our auth.ts are always base64 of "key:secret"
    // OAuth tokens get Bearer prefix
    let isBasicAuth = false;
    try {
      let decoded = atob(opts.token);
      if (decoded.includes(':') && decoded.split(':').length === 2) {
        isBasicAuth = true;
      }
    } catch {
      // Not valid base64, treat as Bearer
    }

    this.authHeader = isBasicAuth ? `Basic ${opts.token}` : `Bearer ${opts.token}`;

    this.axios = createAxios({
      baseURL: opts.baseUrl,
    });
  }

  private get headers() {
    return {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
    };
  }

  // ========== CALLS ==========

  async listCalls(params: {
    fromDateTime?: string;
    toDateTime?: string;
    cursor?: string;
    workspaceId?: string;
  } = {}) {
    let queryParams: Record<string, string> = {};
    if (params.fromDateTime) queryParams.fromDateTime = params.fromDateTime;
    if (params.toDateTime) queryParams.toDateTime = params.toDateTime;
    if (params.cursor) queryParams.cursor = params.cursor;
    if (params.workspaceId) queryParams.workspaceId = params.workspaceId;

    let response = await this.axios.get('/v2/calls', {
      headers: this.headers,
      params: queryParams,
    });
    return response.data;
  }

  async getCallsExtensive(body: {
    filter: {
      fromDateTime?: string;
      toDateTime?: string;
      callIds?: string[];
      workspaceId?: string;
    };
    contentSelector?: {
      exposedFields?: {
        collaboration?: boolean;
        content?: {
          pointsOfInterest?: boolean;
          structure?: boolean;
          topics?: boolean;
          trackers?: boolean;
          brief?: boolean;
          outline?: boolean;
          highlights?: boolean;
          callOutcome?: boolean;
          keyPoints?: boolean;
        };
        interaction?: {
          personInteractionStats?: boolean;
          questions?: boolean;
          speakers?: boolean;
          video?: boolean;
        };
        media?: boolean;
        parties?: boolean;
      };
    };
    cursor?: string;
  }) {
    let response = await this.axios.post('/v2/calls/extensive', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async getCallTranscripts(body: {
    filter: {
      fromDateTime?: string;
      toDateTime?: string;
      callIds?: string[];
      workspaceId?: string;
    };
    cursor?: string;
  }) {
    let response = await this.axios.post('/v2/calls/transcript', body, {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== USERS ==========

  async listUsers(params: {
    cursor?: string;
    includeAvatars?: boolean;
  } = {}) {
    let queryParams: Record<string, string> = {};
    if (params.cursor) queryParams.cursor = params.cursor;
    if (params.includeAvatars !== undefined) queryParams.includeAvatars = String(params.includeAvatars);

    let response = await this.axios.get('/v2/users', {
      headers: this.headers,
      params: queryParams,
    });
    return response.data;
  }

  // ========== STATS ==========

  async getAggregateActivity(body: {
    filter: {
      fromDate: string;
      toDate: string;
      userIds?: string[];
    };
    cursor?: string;
  }) {
    let response = await this.axios.post('/v2/stats/activity/aggregate', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async getDailyActivity(body: {
    filter: {
      fromDate: string;
      toDate: string;
      userIds?: string[];
    };
    cursor?: string;
  }) {
    let response = await this.axios.post('/v2/stats/activity/day-by-day', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async getInteractionStats(body: {
    filter: {
      fromDate: string;
      toDate: string;
      userIds?: string[];
      createdFromDateTime?: string;
      createdToDateTime?: string;
    };
    cursor?: string;
  }) {
    let response = await this.axios.post('/v2/stats/interaction', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async getAnsweredScorecards(body: {
    filter: {
      fromDateTime?: string;
      toDateTime?: string;
      scorecardIds?: string[];
      reviewedUserIds?: string[];
      reviewerUserIds?: string[];
      callFromDateTime?: string;
      callToDateTime?: string;
    };
    cursor?: string;
  }) {
    let response = await this.axios.post('/v2/stats/activity/scorecards', body, {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== LIBRARY ==========

  async getLibraryFolders(params: {
    workspaceId?: string;
  } = {}) {
    let queryParams: Record<string, string> = {};
    if (params.workspaceId) queryParams.workspaceId = params.workspaceId;

    let response = await this.axios.get('/v2/library/folders', {
      headers: this.headers,
      params: queryParams,
    });
    return response.data;
  }

  async getLibraryFolderCalls(folderId: string) {
    let response = await this.axios.get(`/v2/library/folder-content`, {
      headers: this.headers,
      params: { folderId },
    });
    return response.data;
  }

  // ========== FLOWS (ENGAGE) ==========

  async listFlows(params: {
    workspaceId?: string;
    flowEmailOwner?: string;
  } = {}) {
    let queryParams: Record<string, string> = {};
    if (params.workspaceId) queryParams.workspaceId = params.workspaceId;
    if (params.flowEmailOwner) queryParams.flowEmailOwner = params.flowEmailOwner;

    let response = await this.axios.get('/v2/flows', {
      headers: this.headers,
      params: queryParams,
    });
    return response.data;
  }

  async listFlowFolders(params: {
    workspaceId?: string;
    flowEmailOwner?: string;
  } = {}) {
    let queryParams: Record<string, string> = {};
    if (params.workspaceId) queryParams.workspaceId = params.workspaceId;
    if (params.flowEmailOwner) queryParams.flowEmailOwner = params.flowEmailOwner;

    let response = await this.axios.get('/v2/flows/folders', {
      headers: this.headers,
      params: queryParams,
    });
    return response.data;
  }

  async listProspectFlows(body: {
    crmProspectsIds: string[];
  }) {
    let response = await this.axios.post('/v2/flows/prospects', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async assignProspectsToFlow(body: {
    flowId: string;
    flowInstanceOwnerEmail: string;
    crmProspectsIds: string[];
  }) {
    let response = await this.axios.post('/v2/flows/prospects/assign', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async unassignProspectFromFlows(body: {
    crmProspectId: string;
    flowId?: string;
  }) {
    let response = await this.axios.post('/v2/flows/prospects/unassign', body, {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== CRM ==========

  async getCrmObjects(body: {
    integrationId: string;
    objectType: string;
    objectCrmIds: string[];
  }) {
    let response = await this.axios.post('/v2/crm/entities', body, {
      headers: this.headers,
      params: {
        integrationId: body.integrationId,
        objectType: body.objectType,
      },
    });
    return response.data;
  }

  async getManualCrmAssociations(params: {
    fromDateTime: string;
    cursor?: string;
  }) {
    let queryParams: Record<string, string> = {
      fromDateTime: params.fromDateTime,
    };
    if (params.cursor) queryParams.cursor = params.cursor;

    let response = await this.axios.get('/v2/calls/manual-crm-associations', {
      headers: this.headers,
      params: queryParams,
    });
    return response.data;
  }

  // ========== MEETINGS ==========

  async createMeeting(body: {
    title?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    organizerEmail?: string;
    attendees?: Array<{ email: string; name?: string }>;
    meetingUrl?: string;
    workspaceId?: string;
  }) {
    let response = await this.axios.post('/v2/meetings', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async deleteMeeting(meetingId: string) {
    let response = await this.axios.delete(`/v2/meetings/${meetingId}`, {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== DATA PRIVACY ==========

  async getDataPrivacyForEmail(emailAddress: string) {
    let response = await this.axios.get('/v2/data-privacy/data-for-email-address', {
      headers: this.headers,
      params: { emailAddress },
    });
    return response.data;
  }

  async getDataPrivacyForPhone(phoneNumber: string) {
    let response = await this.axios.get('/v2/data-privacy/data-for-phone-number', {
      headers: this.headers,
      params: { phoneNumber },
    });
    return response.data;
  }

  async eraseDataForEmail(emailAddress: string) {
    let response = await this.axios.post('/v2/data-privacy/erase-data-for-email-address', {
      emailAddress,
    }, {
      headers: this.headers,
    });
    return response.data;
  }

  async eraseDataForPhone(phoneNumber: string) {
    let response = await this.axios.post('/v2/data-privacy/erase-data-for-phone-number', {
      phoneNumber,
    }, {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== WORKSPACES & PERMISSIONS ==========

  async listWorkspaces() {
    let response = await this.axios.get('/v2/workspaces', {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== SETTINGS ==========

  async getSettings() {
    let response = await this.axios.get('/v2/settings/trackers', {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== AUDIT LOGS ==========

  async getAuditLogs(params: {
    fromDateTime: string;
    toDateTime?: string;
    logType?: string;
    cursor?: string;
  }) {
    let queryParams: Record<string, string> = {
      fromDateTime: params.fromDateTime,
    };
    if (params.toDateTime) queryParams.toDateTime = params.toDateTime;
    if (params.logType) queryParams.logType = params.logType;
    if (params.cursor) queryParams.cursor = params.cursor;

    let response = await this.axios.get('/v2/logs', {
      headers: this.headers,
      params: queryParams,
    });
    return response.data;
  }

  // ========== DIGITAL INTERACTIONS ==========

  async postDigitalInteraction(body: {
    events: Array<{
      eventType: string;
      contactEmail?: string;
      contactPhone?: string;
      contentId?: string;
      contentTitle?: string;
      contentUrl?: string;
      eventTimestamp: string;
      workspaceId?: string;
      customData?: Record<string, string>;
    }>;
  }) {
    let response = await this.axios.post('/v2/digital-interaction', body, {
      headers: this.headers,
    });
    return response.data;
  }

  // ========== CALL USERS ACCESS ==========

  async getCallUsersAccess(body: {
    filter: {
      callIds: string[];
    };
  }) {
    let response = await this.axios.post('/v2/calls/users-access', body, {
      headers: this.headers,
    });
    return response.data;
  }
}
