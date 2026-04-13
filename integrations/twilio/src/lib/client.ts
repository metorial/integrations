import { createAxios } from 'slates';

let coreApi = createAxios({
  baseURL: 'https://api.twilio.com/2010-04-01'
});

let verifyApi = createAxios({
  baseURL: 'https://verify.twilio.com/v2'
});

let lookupsApi = createAxios({
  baseURL: 'https://lookups.twilio.com/v2'
});

let conversationsApi = createAxios({
  baseURL: 'https://conversations.twilio.com/v1'
});

let messagingServicesApi = createAxios({
  baseURL: 'https://messaging.twilio.com/v1'
});

export interface TwilioClientConfig {
  accountSid: string;
  token: string;
  apiKeySid?: string;
}

let buildAuthHeader = (config: TwilioClientConfig): string => {
  let username = config.apiKeySid || config.accountSid;
  let password = config.token;
  return 'Basic ' + btoa(`${username}:${password}`);
};

let encodeFormData = (params: Record<string, string | undefined>): string => {
  let parts: string[] = [];
  for (let key of Object.keys(params)) {
    let value = params[key];
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.join('&');
};

export class TwilioClient {
  private authHeader: string;
  private accountSid: string;

  constructor(private config: TwilioClientConfig) {
    this.authHeader = buildAuthHeader(config);
    this.accountSid = config.accountSid;
  }

  // ==================== Messages ====================

  async sendMessage(params: {
    to: string;
    from?: string;
    body?: string;
    messagingServiceSid?: string;
    mediaUrl?: string[];
    statusCallback?: string;
    scheduleType?: string;
    sendAt?: string;
  }) {
    let formParams: Record<string, string | undefined> = {
      To: params.to,
      From: params.from,
      Body: params.body,
      MessagingServiceSid: params.messagingServiceSid,
      StatusCallback: params.statusCallback,
      ScheduleType: params.scheduleType,
      SendAt: params.sendAt
    };

    if (params.mediaUrl) {
      for (let i = 0; i < params.mediaUrl.length; i++) {
        formParams[`MediaUrl`] = params.mediaUrl[i];
      }
    }

    let response = await coreApi.post(
      `/Accounts/${this.accountSid}/Messages.json`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async getMessage(messageSid: string) {
    let response = await coreApi.get(
      `/Accounts/${this.accountSid}/Messages/${messageSid}.json`,
      { headers: { Authorization: this.authHeader } }
    );
    return response.data;
  }

  async listMessages(params?: {
    to?: string;
    from?: string;
    dateSent?: string;
    dateSentBefore?: string;
    dateSentAfter?: string;
    pageSize?: number;
    pageToken?: string;
    page?: number;
  }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      queryParams.To = params.to;
      queryParams.From = params.from;
      queryParams.DateSent = params.dateSent;
      queryParams['DateSent<'] = params.dateSentBefore;
      queryParams['DateSent>'] = params.dateSentAfter;
      if (params.pageSize) queryParams.PageSize = String(params.pageSize);
      if (params.pageToken) queryParams.PageToken = params.pageToken;
      if (params.page !== undefined) queryParams.Page = String(params.page);
    }

    let query = encodeFormData(queryParams);
    let url = `/Accounts/${this.accountSid}/Messages.json${query ? '?' + query : ''}`;

    let response = await coreApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async deleteMessage(messageSid: string) {
    await coreApi.delete(`/Accounts/${this.accountSid}/Messages/${messageSid}.json`, {
      headers: { Authorization: this.authHeader }
    });
  }

  async cancelScheduledMessage(messageSid: string) {
    let response = await coreApi.post(
      `/Accounts/${this.accountSid}/Messages/${messageSid}.json`,
      encodeFormData({ Status: 'canceled' }),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  // ==================== Calls ====================

  async makeCall(params: {
    to: string;
    from: string;
    url?: string;
    twiml?: string;
    applicationSid?: string;
    method?: string;
    statusCallback?: string;
    statusCallbackMethod?: string;
    statusCallbackEvent?: string[];
    timeout?: number;
    record?: boolean;
    recordingChannels?: string;
    recordingStatusCallback?: string;
    machineDetection?: string;
    callerId?: string;
  }) {
    let formParams: Record<string, string | undefined> = {
      To: params.to,
      From: params.from,
      Url: params.url,
      Twiml: params.twiml,
      ApplicationSid: params.applicationSid,
      Method: params.method,
      StatusCallback: params.statusCallback,
      StatusCallbackMethod: params.statusCallbackMethod,
      MachineDetection: params.machineDetection,
      CallerId: params.callerId
    };

    if (params.timeout !== undefined) formParams.Timeout = String(params.timeout);
    if (params.record !== undefined) formParams.Record = String(params.record);
    if (params.recordingChannels) formParams.RecordingChannels = params.recordingChannels;
    if (params.recordingStatusCallback)
      formParams.RecordingStatusCallback = params.recordingStatusCallback;
    if (params.statusCallbackEvent) {
      for (let event of params.statusCallbackEvent) {
        formParams['StatusCallbackEvent'] = event;
      }
    }

    let response = await coreApi.post(
      `/Accounts/${this.accountSid}/Calls.json`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async getCall(callSid: string) {
    let response = await coreApi.get(`/Accounts/${this.accountSid}/Calls/${callSid}.json`, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async listCalls(params?: {
    to?: string;
    from?: string;
    status?: string;
    startTimeBefore?: string;
    startTimeAfter?: string;
    parentCallSid?: string;
    pageSize?: number;
    page?: number;
  }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      queryParams.To = params.to;
      queryParams.From = params.from;
      queryParams.Status = params.status;
      queryParams['StartTime<'] = params.startTimeBefore;
      queryParams['StartTime>'] = params.startTimeAfter;
      queryParams.ParentCallSid = params.parentCallSid;
      if (params.pageSize) queryParams.PageSize = String(params.pageSize);
      if (params.page !== undefined) queryParams.Page = String(params.page);
    }

    let query = encodeFormData(queryParams);
    let url = `/Accounts/${this.accountSid}/Calls.json${query ? '?' + query : ''}`;

    let response = await coreApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async updateCall(
    callSid: string,
    params: {
      url?: string;
      method?: string;
      status?: string;
      twiml?: string;
      statusCallback?: string;
    }
  ) {
    let formParams: Record<string, string | undefined> = {
      Url: params.url,
      Method: params.method,
      Status: params.status,
      Twiml: params.twiml,
      StatusCallback: params.statusCallback
    };

    let response = await coreApi.post(
      `/Accounts/${this.accountSid}/Calls/${callSid}.json`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  // ==================== Verify ====================

  async createVerification(
    serviceSid: string,
    params: {
      to: string;
      channel: string;
      locale?: string;
      customCode?: string;
      amount?: string;
      payee?: string;
      templateSid?: string;
    }
  ) {
    let formParams: Record<string, string | undefined> = {
      To: params.to,
      Channel: params.channel,
      Locale: params.locale,
      CustomCode: params.customCode,
      Amount: params.amount,
      Payee: params.payee,
      TemplateSid: params.templateSid
    };

    let response = await verifyApi.post(
      `/Services/${serviceSid}/Verifications`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async checkVerification(
    serviceSid: string,
    params: {
      code: string;
      to?: string;
      verificationSid?: string;
    }
  ) {
    let formParams: Record<string, string | undefined> = {
      Code: params.code,
      To: params.to,
      VerificationSid: params.verificationSid
    };

    let response = await verifyApi.post(
      `/Services/${serviceSid}/VerificationCheck`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async listVerifyServices(params?: { pageSize?: number }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params?.pageSize) queryParams.PageSize = String(params.pageSize);

    let query = encodeFormData(queryParams);
    let url = `/Services${query ? '?' + query : ''}`;

    let response = await verifyApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  // ==================== Lookup ====================

  async lookupPhoneNumber(
    phoneNumber: string,
    params?: {
      fields?: string[];
      countryCode?: string;
      firstName?: string;
      lastName?: string;
      addressLine1?: string;
    }
  ) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      if (params.fields && params.fields.length > 0)
        queryParams.Fields = params.fields.join(',');
      queryParams.CountryCode = params.countryCode;
      queryParams.FirstName = params.firstName;
      queryParams.LastName = params.lastName;
      queryParams.AddressLine1 = params.addressLine1;
    }

    let query = encodeFormData(queryParams);
    let encodedNumber = encodeURIComponent(phoneNumber);
    let url = `/PhoneNumbers/${encodedNumber}${query ? '?' + query : ''}`;

    let response = await lookupsApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  // ==================== Phone Numbers ====================

  async searchAvailablePhoneNumbers(
    countryCode: string,
    type: 'Local' | 'TollFree' | 'Mobile',
    params?: {
      areaCode?: string;
      contains?: string;
      inRegion?: string;
      inPostalCode?: string;
      smsEnabled?: boolean;
      voiceEnabled?: boolean;
      mmsEnabled?: boolean;
      pageSize?: number;
    }
  ) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      queryParams.AreaCode = params.areaCode;
      queryParams.Contains = params.contains;
      queryParams.InRegion = params.inRegion;
      queryParams.InPostalCode = params.inPostalCode;
      if (params.smsEnabled !== undefined) queryParams.SmsEnabled = String(params.smsEnabled);
      if (params.voiceEnabled !== undefined)
        queryParams.VoiceEnabled = String(params.voiceEnabled);
      if (params.mmsEnabled !== undefined) queryParams.MmsEnabled = String(params.mmsEnabled);
      if (params.pageSize) queryParams.PageSize = String(params.pageSize);
    }

    let query = encodeFormData(queryParams);
    let url = `/Accounts/${this.accountSid}/AvailablePhoneNumbers/${countryCode}/${type}.json${query ? '?' + query : ''}`;

    let response = await coreApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async purchasePhoneNumber(params: {
    phoneNumber: string;
    friendlyName?: string;
    voiceUrl?: string;
    voiceMethod?: string;
    smsUrl?: string;
    smsMethod?: string;
    statusCallback?: string;
  }) {
    let formParams: Record<string, string | undefined> = {
      PhoneNumber: params.phoneNumber,
      FriendlyName: params.friendlyName,
      VoiceUrl: params.voiceUrl,
      VoiceMethod: params.voiceMethod,
      SmsUrl: params.smsUrl,
      SmsMethod: params.smsMethod,
      StatusCallback: params.statusCallback
    };

    let response = await coreApi.post(
      `/Accounts/${this.accountSid}/IncomingPhoneNumbers.json`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async getIncomingPhoneNumber(phoneNumberSid: string) {
    let response = await coreApi.get(
      `/Accounts/${this.accountSid}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
      { headers: { Authorization: this.authHeader } }
    );
    return response.data;
  }

  async listIncomingPhoneNumbers(params?: {
    friendlyName?: string;
    phoneNumber?: string;
    pageSize?: number;
    page?: number;
  }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      queryParams.FriendlyName = params.friendlyName;
      queryParams.PhoneNumber = params.phoneNumber;
      if (params.pageSize) queryParams.PageSize = String(params.pageSize);
      if (params.page !== undefined) queryParams.Page = String(params.page);
    }

    let query = encodeFormData(queryParams);
    let url = `/Accounts/${this.accountSid}/IncomingPhoneNumbers.json${query ? '?' + query : ''}`;

    let response = await coreApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async updateIncomingPhoneNumber(
    phoneNumberSid: string,
    params: {
      friendlyName?: string;
      voiceUrl?: string;
      voiceMethod?: string;
      voiceFallbackUrl?: string;
      smsUrl?: string;
      smsMethod?: string;
      smsFallbackUrl?: string;
      statusCallback?: string;
      statusCallbackMethod?: string;
    }
  ) {
    let formParams: Record<string, string | undefined> = {
      FriendlyName: params.friendlyName,
      VoiceUrl: params.voiceUrl,
      VoiceMethod: params.voiceMethod,
      VoiceFallbackUrl: params.voiceFallbackUrl,
      SmsUrl: params.smsUrl,
      SmsMethod: params.smsMethod,
      SmsFallbackUrl: params.smsFallbackUrl,
      StatusCallback: params.statusCallback,
      StatusCallbackMethod: params.statusCallbackMethod
    };

    let response = await coreApi.post(
      `/Accounts/${this.accountSid}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async releasePhoneNumber(phoneNumberSid: string) {
    await coreApi.delete(
      `/Accounts/${this.accountSid}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
      { headers: { Authorization: this.authHeader } }
    );
  }

  // ==================== Conversations ====================

  async createConversation(params: {
    friendlyName?: string;
    uniqueName?: string;
    attributes?: string;
    state?: string;
    messagingServiceSid?: string;
  }) {
    let formParams: Record<string, string | undefined> = {
      FriendlyName: params.friendlyName,
      UniqueName: params.uniqueName,
      Attributes: params.attributes,
      State: params.state,
      MessagingServiceSid: params.messagingServiceSid
    };

    let response = await conversationsApi.post('/Conversations', encodeFormData(formParams), {
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  }

  async getConversation(conversationSid: string) {
    let response = await conversationsApi.get(`/Conversations/${conversationSid}`, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async listConversations(params?: { pageSize?: number; state?: string }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      if (params.pageSize) queryParams.PageSize = String(params.pageSize);
      queryParams.State = params.state;
    }

    let query = encodeFormData(queryParams);
    let url = `/Conversations${query ? '?' + query : ''}`;

    let response = await conversationsApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async updateConversation(
    conversationSid: string,
    params: {
      friendlyName?: string;
      uniqueName?: string;
      attributes?: string;
      state?: string;
    }
  ) {
    let formParams: Record<string, string | undefined> = {
      FriendlyName: params.friendlyName,
      UniqueName: params.uniqueName,
      Attributes: params.attributes,
      State: params.state
    };

    let response = await conversationsApi.post(
      `/Conversations/${conversationSid}`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async deleteConversation(conversationSid: string) {
    await conversationsApi.delete(`/Conversations/${conversationSid}`, {
      headers: { Authorization: this.authHeader }
    });
  }

  async addConversationParticipant(
    conversationSid: string,
    params: {
      identity?: string;
      messagingBindingAddress?: string;
      messagingBindingProxyAddress?: string;
      attributes?: string;
      roleSid?: string;
    }
  ) {
    let formParams: Record<string, string | undefined> = {
      Identity: params.identity,
      'MessagingBinding.Address': params.messagingBindingAddress,
      'MessagingBinding.ProxyAddress': params.messagingBindingProxyAddress,
      Attributes: params.attributes,
      RoleSid: params.roleSid
    };

    let response = await conversationsApi.post(
      `/Conversations/${conversationSid}/Participants`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async listConversationParticipants(conversationSid: string, params?: { pageSize?: number }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params?.pageSize) queryParams.PageSize = String(params.pageSize);

    let query = encodeFormData(queryParams);
    let url = `/Conversations/${conversationSid}/Participants${query ? '?' + query : ''}`;

    let response = await conversationsApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async removeConversationParticipant(conversationSid: string, participantSid: string) {
    await conversationsApi.delete(
      `/Conversations/${conversationSid}/Participants/${participantSid}`,
      { headers: { Authorization: this.authHeader } }
    );
  }

  async sendConversationMessage(
    conversationSid: string,
    params: {
      author?: string;
      body: string;
      attributes?: string;
      mediaSid?: string;
    }
  ) {
    let formParams: Record<string, string | undefined> = {
      Author: params.author,
      Body: params.body,
      Attributes: params.attributes,
      MediaSid: params.mediaSid
    };

    let response = await conversationsApi.post(
      `/Conversations/${conversationSid}/Messages`,
      encodeFormData(formParams),
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async listConversationMessages(
    conversationSid: string,
    params?: { pageSize?: number; order?: string }
  ) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      if (params.pageSize) queryParams.PageSize = String(params.pageSize);
      queryParams.Order = params.order;
    }

    let query = encodeFormData(queryParams);
    let url = `/Conversations/${conversationSid}/Messages${query ? '?' + query : ''}`;

    let response = await conversationsApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  // ==================== Recordings ====================

  async listCallRecordings(callSid: string, params?: { pageSize?: number }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params?.pageSize) queryParams.PageSize = String(params.pageSize);

    let query = encodeFormData(queryParams);
    let url = `/Accounts/${this.accountSid}/Calls/${callSid}/Recordings.json${query ? '?' + query : ''}`;

    let response = await coreApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  async listRecordings(params?: {
    callSid?: string;
    dateCreatedBefore?: string;
    dateCreatedAfter?: string;
    pageSize?: number;
  }) {
    let queryParams: Record<string, string | undefined> = {};
    if (params) {
      queryParams.CallSid = params.callSid;
      queryParams['DateCreated<'] = params.dateCreatedBefore;
      queryParams['DateCreated>'] = params.dateCreatedAfter;
      if (params.pageSize) queryParams.PageSize = String(params.pageSize);
    }

    let query = encodeFormData(queryParams);
    let url = `/Accounts/${this.accountSid}/Recordings.json${query ? '?' + query : ''}`;

    let response = await coreApi.get(url, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }

  // ==================== Account ====================

  async getAccount() {
    let response = await coreApi.get(`/Accounts/${this.accountSid}.json`, {
      headers: { Authorization: this.authHeader }
    });
    return response.data;
  }
}
