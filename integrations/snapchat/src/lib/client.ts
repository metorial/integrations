import { createAxios } from 'slates';

let adsApi = createAxios({
  baseURL: 'https://adsapi.snapchat.com/v1'
});

let conversionsApi = createAxios({
  baseURL: 'https://tr.snapchat.com/v3'
});

let profileApi = createAxios({
  baseURL: 'https://businessapi.snapchat.com/v1'
});

export class SnapchatClient {
  private headers: Record<string, string>;

  constructor(private token: string) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // ── User / Me ──

  async getMe() {
    let response = await adsApi.get('/me', { headers: this.headers });
    return response.data.me;
  }

  // ── Organizations ──

  async listOrganizations() {
    let response = await adsApi.get('/me/organizations', { headers: this.headers });
    return response.data.organizations?.map((o: any) => o.organization) ?? [];
  }

  async getOrganization(organizationId: string) {
    let response = await adsApi.get(`/organizations/${organizationId}`, {
      headers: this.headers
    });
    return response.data.organizations?.[0]?.organization;
  }

  // ── Ad Accounts ──

  async listAdAccounts(organizationId: string) {
    let response = await adsApi.get(`/organizations/${organizationId}/adaccounts`, {
      headers: this.headers
    });
    return response.data.adaccounts?.map((a: any) => a.adaccount) ?? [];
  }

  async getAdAccount(adAccountId: string) {
    let response = await adsApi.get(`/adaccounts/${adAccountId}`, { headers: this.headers });
    return response.data.adaccounts?.[0]?.adaccount;
  }

  // ── Campaigns ──

  async listCampaigns(adAccountId: string) {
    let response = await adsApi.get(`/adaccounts/${adAccountId}/campaigns`, {
      headers: this.headers
    });
    return response.data.campaigns?.map((c: any) => c.campaign) ?? [];
  }

  async getCampaign(campaignId: string) {
    let response = await adsApi.get(`/campaigns/${campaignId}`, { headers: this.headers });
    return response.data.campaigns?.[0]?.campaign;
  }

  async createCampaign(adAccountId: string, campaignData: Record<string, any>) {
    let response = await adsApi.post(
      `/adaccounts/${adAccountId}/campaigns`,
      {
        campaigns: [campaignData]
      },
      { headers: this.headers }
    );
    return response.data.campaigns?.[0]?.campaign;
  }

  async updateCampaign(adAccountId: string, campaignData: Record<string, any>) {
    let response = await adsApi.put(
      `/adaccounts/${adAccountId}/campaigns`,
      {
        campaigns: [campaignData]
      },
      { headers: this.headers }
    );
    return response.data.campaigns?.[0]?.campaign;
  }

  async deleteCampaign(campaignId: string) {
    let response = await adsApi.delete(`/campaigns/${campaignId}`, { headers: this.headers });
    return response.data;
  }

  // ── Ad Squads ──

  async listAdSquads(campaignId: string) {
    let response = await adsApi.get(`/campaigns/${campaignId}/adsquads`, {
      headers: this.headers
    });
    return response.data.adsquads?.map((a: any) => a.adsquad) ?? [];
  }

  async getAdSquad(adSquadId: string) {
    let response = await adsApi.get(`/adsquads/${adSquadId}`, { headers: this.headers });
    return response.data.adsquads?.[0]?.adsquad;
  }

  async createAdSquad(campaignId: string, adSquadData: Record<string, any>) {
    let response = await adsApi.post(
      `/campaigns/${campaignId}/adsquads`,
      {
        adsquads: [adSquadData]
      },
      { headers: this.headers }
    );
    return response.data.adsquads?.[0]?.adsquad;
  }

  async updateAdSquad(campaignId: string, adSquadData: Record<string, any>) {
    let response = await adsApi.put(
      `/campaigns/${campaignId}/adsquads`,
      {
        adsquads: [adSquadData]
      },
      { headers: this.headers }
    );
    return response.data.adsquads?.[0]?.adsquad;
  }

  async deleteAdSquad(adSquadId: string) {
    let response = await adsApi.delete(`/adsquads/${adSquadId}`, { headers: this.headers });
    return response.data;
  }

  // ── Ads ──

  async listAds(adSquadId: string) {
    let response = await adsApi.get(`/adsquads/${adSquadId}/ads`, { headers: this.headers });
    return response.data.ads?.map((a: any) => a.ad) ?? [];
  }

  async getAd(adId: string) {
    let response = await adsApi.get(`/ads/${adId}`, { headers: this.headers });
    return response.data.ads?.[0]?.ad;
  }

  async createAd(adSquadId: string, adData: Record<string, any>) {
    let response = await adsApi.post(
      `/adsquads/${adSquadId}/ads`,
      {
        ads: [adData]
      },
      { headers: this.headers }
    );
    return response.data.ads?.[0]?.ad;
  }

  async updateAd(adSquadId: string, adData: Record<string, any>) {
    let response = await adsApi.put(
      `/adsquads/${adSquadId}/ads`,
      {
        ads: [adData]
      },
      { headers: this.headers }
    );
    return response.data.ads?.[0]?.ad;
  }

  async deleteAd(adId: string) {
    let response = await adsApi.delete(`/ads/${adId}`, { headers: this.headers });
    return response.data;
  }

  // ── Creatives ──

  async listCreatives(adAccountId: string) {
    let response = await adsApi.get(`/adaccounts/${adAccountId}/creatives`, {
      headers: this.headers
    });
    return response.data.creatives?.map((c: any) => c.creative) ?? [];
  }

  async getCreative(creativeId: string) {
    let response = await adsApi.get(`/creatives/${creativeId}`, { headers: this.headers });
    return response.data.creatives?.[0]?.creative;
  }

  async createCreative(adAccountId: string, creativeData: Record<string, any>) {
    let response = await adsApi.post(
      `/adaccounts/${adAccountId}/creatives`,
      {
        creatives: [creativeData]
      },
      { headers: this.headers }
    );
    return response.data.creatives?.[0]?.creative;
  }

  async updateCreative(adAccountId: string, creativeData: Record<string, any>) {
    let response = await adsApi.put(
      `/adaccounts/${adAccountId}/creatives`,
      {
        creatives: [creativeData]
      },
      { headers: this.headers }
    );
    return response.data.creatives?.[0]?.creative;
  }

  // ── Media ──

  async listMedia(adAccountId: string) {
    let response = await adsApi.get(`/adaccounts/${adAccountId}/media`, {
      headers: this.headers
    });
    return response.data.media?.map((m: any) => m.media) ?? [];
  }

  async getMedia(mediaId: string) {
    let response = await adsApi.get(`/media/${mediaId}`, { headers: this.headers });
    return response.data.media?.[0]?.media;
  }

  async createMedia(adAccountId: string, mediaData: Record<string, any>) {
    let response = await adsApi.post(
      `/adaccounts/${adAccountId}/media`,
      {
        media: [mediaData]
      },
      { headers: this.headers }
    );
    return response.data.media?.[0]?.media;
  }

  // ── Audience Segments ──

  async listSegments(adAccountId: string) {
    let response = await adsApi.get(`/adaccounts/${adAccountId}/segments`, {
      headers: this.headers
    });
    return response.data.segments?.map((s: any) => s.segment) ?? [];
  }

  async getSegment(segmentId: string) {
    let response = await adsApi.get(`/segments/${segmentId}`, { headers: this.headers });
    return response.data.segments?.[0]?.segment;
  }

  async createSegment(adAccountId: string, segmentData: Record<string, any>) {
    let response = await adsApi.post(
      `/adaccounts/${adAccountId}/segments`,
      {
        segments: [segmentData]
      },
      { headers: this.headers }
    );
    return response.data.segments?.[0]?.segment;
  }

  async updateSegment(adAccountId: string, segmentData: Record<string, any>) {
    let response = await adsApi.put(
      `/adaccounts/${adAccountId}/segments`,
      {
        segments: [segmentData]
      },
      { headers: this.headers }
    );
    return response.data.segments?.[0]?.segment;
  }

  async deleteSegment(segmentId: string) {
    let response = await adsApi.delete(`/segments/${segmentId}`, { headers: this.headers });
    return response.data;
  }

  async addUsersToSegment(segmentId: string, userData: Record<string, any>) {
    let response = await adsApi.post(`/segments/${segmentId}/users`, userData, {
      headers: this.headers
    });
    return response.data;
  }

  // ── Stats / Reporting ──

  async getStats(
    entityType: 'campaigns' | 'adsquads' | 'ads' | 'adaccounts',
    entityId: string,
    params: Record<string, string>
  ) {
    let response = await adsApi.get(`/${entityType}/${entityId}/stats`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  // ── Conversions API ──

  async sendConversionEvents(pixelOrAppId: string, events: any[]) {
    let response = await conversionsApi.post(
      `/${pixelOrAppId}/events`,
      {
        data: events
      },
      {
        headers: this.headers
      }
    );
    return response.data;
  }

  async validateConversionEvents(pixelOrAppId: string, events: any[]) {
    let response = await conversionsApi.post(
      `/${pixelOrAppId}/events/validate`,
      {
        data: events
      },
      {
        headers: this.headers
      }
    );
    return response.data;
  }

  // ── Pixels ──

  async listPixels(adAccountId: string) {
    let response = await adsApi.get(`/adaccounts/${adAccountId}/pixels`, {
      headers: this.headers
    });
    return response.data.pixels?.map((p: any) => p.pixel) ?? [];
  }

  async getPixel(pixelId: string) {
    let response = await adsApi.get(`/pixels/${pixelId}`, { headers: this.headers });
    return response.data.pixels?.[0]?.pixel;
  }

  async createPixel(adAccountId: string, pixelData: Record<string, any>) {
    let response = await adsApi.post(
      `/adaccounts/${adAccountId}/pixels`,
      {
        pixels: [pixelData]
      },
      { headers: this.headers }
    );
    return response.data.pixels?.[0]?.pixel;
  }

  // ── Funding Sources ──

  async listFundingSources(organizationId: string) {
    let response = await adsApi.get(`/organizations/${organizationId}/fundingsources`, {
      headers: this.headers
    });
    return response.data.fundingsources?.map((f: any) => f.fundingsource) ?? [];
  }

  // ── Public Profiles ──

  async getMyProfile() {
    let response = await profileApi.get('/public_profiles/my_profile', {
      headers: this.headers
    });
    return response.data;
  }

  async listPublicProfiles(organizationId: string) {
    let response = await profileApi.get(`/organizations/${organizationId}/public_profiles`, {
      headers: this.headers
    });
    return response.data;
  }
}
