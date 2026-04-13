import { createAxios } from 'slates';
import type {
  ApolloContact,
  ApolloPerson,
  ApolloOrganization,
  ApolloAccount,
  ApolloDeal,
  ApolloSequence,
  ApolloTask,
  ApolloUser,
  PeopleSearchFilters,
  OrganizationSearchFilters,
  PersonEnrichmentParams,
  BulkPersonEnrichmentParams
} from './types';

export class Client {
  private axios;

  constructor(private config: { token: string }) {
    this.axios = createAxios({
      baseURL: 'https://api.apollo.io/api/v1'
    });
    this.axios.defaults.headers.common['x-api-key'] = config.token;
  }

  // ========== People Search ==========

  async searchPeople(filters: PeopleSearchFilters): Promise<{ people: ApolloPerson[]; pagination: any }> {
    let response = await this.axios.post('/mixed_people/search', {
      person_titles: filters.personTitles,
      person_locations: filters.personLocations,
      person_seniorities: filters.personSeniorities,
      organization_domains: filters.organizationDomains,
      organization_locations: filters.organizationLocations,
      organization_num_employees_ranges: filters.organizationNumEmployeesRanges,
      organization_industry_tag_ids: filters.organizationIndustryTagIds,
      q_keywords: filters.qKeywords,
      page: filters.page || 1,
      per_page: filters.perPage || 25
    });

    return {
      people: response.data.people || [],
      pagination: response.data.pagination || {}
    };
  }

  // ========== Organization Search ==========

  async searchOrganizations(filters: OrganizationSearchFilters): Promise<{ organizations: ApolloOrganization[]; pagination: any }> {
    let response = await this.axios.post('/mixed_companies/search', {
      organization_num_employees_ranges: filters.organizationNumEmployeesRanges,
      organization_locations: filters.organizationLocations,
      organization_industry_tag_ids: filters.organizationIndustryTagIds,
      organization_ids: filters.organizationIds,
      q_organization_keyword_tags: filters.qOrganizationKeywordTags,
      q_organization_name: filters.qOrganizationName,
      page: filters.page || 1,
      per_page: filters.perPage || 25
    });

    return {
      organizations: response.data.organizations || response.data.accounts || [],
      pagination: response.data.pagination || {}
    };
  }

  // ========== People Enrichment ==========

  async enrichPerson(params: PersonEnrichmentParams): Promise<{ person: ApolloPerson | null }> {
    let response = await this.axios.post('/people/match', {
      first_name: params.firstName,
      last_name: params.lastName,
      name: params.name,
      email: params.email,
      domain: params.domain,
      organization_name: params.organizationName,
      linkedin_url: params.linkedinUrl,
      id: params.apolloId,
      reveal_personal_emails: params.revealPersonalEmails || false,
      reveal_phone_number: params.revealPhoneNumber || false
    });

    return {
      person: response.data.person || null
    };
  }

  async bulkEnrichPeople(params: BulkPersonEnrichmentParams): Promise<{
    matches: ApolloPerson[];
    totalRequested: number;
    uniqueEnriched: number;
    creditsConsumed: number;
  }> {
    let response = await this.axios.post('/people/bulk_match', {
      details: params.details,
      reveal_personal_emails: params.revealPersonalEmails || false,
      reveal_phone_number: params.revealPhoneNumber || false
    });

    return {
      matches: response.data.matches || [],
      totalRequested: response.data.total_requested_enrichments || 0,
      uniqueEnriched: response.data.unique_enriched_records || 0,
      creditsConsumed: response.data.credits_consumed || 0
    };
  }

  // ========== Contacts ==========

  async searchContacts(params: {
    qKeywords?: string;
    contactStageIds?: string[];
    sortByField?: string;
    sortAscending?: boolean;
    page?: number;
    perPage?: number;
  }): Promise<{ contacts: ApolloContact[]; pagination: any }> {
    let response = await this.axios.post('/contacts/search', {
      q_keywords: params.qKeywords,
      contact_stage_ids: params.contactStageIds,
      sort_by_field: params.sortByField,
      sort_ascending: params.sortAscending,
      page: params.page || 1,
      per_page: params.perPage || 25
    });

    return {
      contacts: response.data.contacts || [],
      pagination: response.data.pagination || {}
    };
  }

  async createContact(contact: {
    firstName?: string;
    lastName?: string;
    email?: string;
    title?: string;
    phone?: string;
    organizationName?: string;
    ownerId?: string;
    accountId?: string;
    contactStageId?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    labelIds?: string[];
    runDedupe?: boolean;
  }): Promise<{ contact: ApolloContact }> {
    let response = await this.axios.post('/contacts', {
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      title: contact.title,
      phone: contact.phone,
      organization_name: contact.organizationName,
      owner_id: contact.ownerId,
      account_id: contact.accountId,
      contact_stage_id: contact.contactStageId,
      website_url: contact.websiteUrl,
      linkedin_url: contact.linkedinUrl,
      city: contact.city,
      state: contact.state,
      country: contact.country,
      postal_code: contact.postalCode,
      label_ids: contact.labelIds,
      run_dedupe: contact.runDedupe
    });

    return {
      contact: response.data.contact || response.data
    };
  }

  async updateContact(contactId: string, updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    title?: string;
    phone?: string;
    organizationName?: string;
    ownerId?: string;
    accountId?: string;
    contactStageId?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    labelIds?: string[];
  }): Promise<{ contact: ApolloContact }> {
    let body: Record<string, any> = {};
    if (updates.firstName !== undefined) body.first_name = updates.firstName;
    if (updates.lastName !== undefined) body.last_name = updates.lastName;
    if (updates.email !== undefined) body.email = updates.email;
    if (updates.title !== undefined) body.title = updates.title;
    if (updates.phone !== undefined) body.phone = updates.phone;
    if (updates.organizationName !== undefined) body.organization_name = updates.organizationName;
    if (updates.ownerId !== undefined) body.owner_id = updates.ownerId;
    if (updates.accountId !== undefined) body.account_id = updates.accountId;
    if (updates.contactStageId !== undefined) body.contact_stage_id = updates.contactStageId;
    if (updates.websiteUrl !== undefined) body.website_url = updates.websiteUrl;
    if (updates.linkedinUrl !== undefined) body.linkedin_url = updates.linkedinUrl;
    if (updates.city !== undefined) body.city = updates.city;
    if (updates.state !== undefined) body.state = updates.state;
    if (updates.country !== undefined) body.country = updates.country;
    if (updates.postalCode !== undefined) body.postal_code = updates.postalCode;
    if (updates.labelIds !== undefined) body.label_ids = updates.labelIds;

    let response = await this.axios.patch(`/contacts/${contactId}`, body);

    return {
      contact: response.data.contact || response.data
    };
  }

  async updateContactStages(contactIds: string[], contactStageId: string): Promise<{ contacts: ApolloContact[] }> {
    let response = await this.axios.post('/contacts/update_stages', {
      contact_ids: contactIds,
      contact_stage_id: contactStageId
    });

    return {
      contacts: response.data.contacts || []
    };
  }

  // ========== Accounts ==========

  async searchAccounts(params: {
    qKeywords?: string;
    accountStageIds?: string[];
    sortByField?: string;
    sortAscending?: boolean;
    page?: number;
    perPage?: number;
  }): Promise<{ accounts: ApolloAccount[]; pagination: any }> {
    let response = await this.axios.post('/accounts/search', {
      q_keywords: params.qKeywords,
      account_stage_ids: params.accountStageIds,
      sort_by_field: params.sortByField,
      sort_ascending: params.sortAscending,
      page: params.page || 1,
      per_page: params.perPage || 25
    });

    return {
      accounts: response.data.accounts || [],
      pagination: response.data.pagination || {}
    };
  }

  async createAccount(account: {
    name: string;
    domain?: string;
    phone?: string;
    ownerId?: string;
    accountStageId?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    city?: string;
    state?: string;
    country?: string;
  }): Promise<{ account: ApolloAccount }> {
    let response = await this.axios.post('/accounts', {
      name: account.name,
      domain: account.domain,
      phone: account.phone,
      owner_id: account.ownerId,
      account_stage_id: account.accountStageId,
      website_url: account.websiteUrl,
      linkedin_url: account.linkedinUrl,
      city: account.city,
      state: account.state,
      country: account.country
    });

    return {
      account: response.data.account || response.data
    };
  }

  async updateAccount(accountId: string, updates: {
    name?: string;
    domain?: string;
    phone?: string;
    ownerId?: string;
    accountStageId?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    city?: string;
    state?: string;
    country?: string;
  }): Promise<{ account: ApolloAccount }> {
    let body: Record<string, any> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.domain !== undefined) body.domain = updates.domain;
    if (updates.phone !== undefined) body.phone = updates.phone;
    if (updates.ownerId !== undefined) body.owner_id = updates.ownerId;
    if (updates.accountStageId !== undefined) body.account_stage_id = updates.accountStageId;
    if (updates.websiteUrl !== undefined) body.website_url = updates.websiteUrl;
    if (updates.linkedinUrl !== undefined) body.linkedin_url = updates.linkedinUrl;
    if (updates.city !== undefined) body.city = updates.city;
    if (updates.state !== undefined) body.state = updates.state;
    if (updates.country !== undefined) body.country = updates.country;

    let response = await this.axios.patch(`/accounts/${accountId}`, body);

    return {
      account: response.data.account || response.data
    };
  }

  // ========== Deals (Opportunities) ==========

  async listDeals(params?: {
    page?: number;
    perPage?: number;
  }): Promise<{ deals: ApolloDeal[]; pagination: any }> {
    let response = await this.axios.get('/opportunities/search', {
      params: {
        page: params?.page || 1,
        per_page: params?.perPage || 25
      }
    });

    return {
      deals: response.data.opportunities || [],
      pagination: response.data.pagination || {}
    };
  }

  async viewDeal(dealId: string): Promise<{ deal: ApolloDeal }> {
    let response = await this.axios.get(`/opportunities/${dealId}`);

    return {
      deal: response.data.opportunity || response.data
    };
  }

  async createDeal(deal: {
    name: string;
    amount?: number;
    closedDate?: string;
    ownerId?: string;
    accountId?: string;
    dealStageId?: string;
    source?: string;
  }): Promise<{ deal: ApolloDeal }> {
    let response = await this.axios.post('/opportunities', {
      name: deal.name,
      amount: deal.amount,
      closed_date: deal.closedDate,
      owner_id: deal.ownerId,
      account_id: deal.accountId,
      deal_stage_id: deal.dealStageId,
      source: deal.source
    });

    return {
      deal: response.data.opportunity || response.data
    };
  }

  async updateDeal(dealId: string, updates: {
    name?: string;
    amount?: number;
    closedDate?: string;
    ownerId?: string;
    accountId?: string;
    dealStageId?: string;
    source?: string;
    status?: string;
  }): Promise<{ deal: ApolloDeal }> {
    let body: Record<string, any> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.amount !== undefined) body.amount = updates.amount;
    if (updates.closedDate !== undefined) body.closed_date = updates.closedDate;
    if (updates.ownerId !== undefined) body.owner_id = updates.ownerId;
    if (updates.accountId !== undefined) body.account_id = updates.accountId;
    if (updates.dealStageId !== undefined) body.deal_stage_id = updates.dealStageId;
    if (updates.source !== undefined) body.source = updates.source;
    if (updates.status !== undefined) body.status = updates.status;

    let response = await this.axios.patch(`/opportunities/${dealId}`, body);

    return {
      deal: response.data.opportunity || response.data
    };
  }

  async listDealStages(): Promise<{ dealStages: Array<{ id: string; name: string; [key: string]: any }> }> {
    let response = await this.axios.get('/deal_stages');

    return {
      dealStages: response.data.deal_stages || []
    };
  }

  // ========== Sequences ==========

  async searchSequences(params?: {
    qKeywords?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ sequences: ApolloSequence[]; pagination: any }> {
    let response = await this.axios.post('/emailer_campaigns/search', {
      q_keywords: params?.qKeywords,
      page: params?.page || 1,
      per_page: params?.perPage || 25
    });

    return {
      sequences: response.data.emailer_campaigns || [],
      pagination: response.data.pagination || {}
    };
  }

  async addContactsToSequence(sequenceId: string, contactIds: string[], emailAccountId?: string, userId?: string): Promise<any> {
    let response = await this.axios.post(`/emailer_campaigns/${sequenceId}/add_contact_ids`, {
      contact_ids: contactIds,
      emailer_campaign_id: sequenceId,
      send_email_from_email_account_id: emailAccountId,
      userId: userId
    });

    return response.data;
  }

  async updateContactStatusInSequence(contactIds: string[], sequenceId: string, status: 'finished' | 'active'): Promise<any> {
    let response = await this.axios.post('/emailer_campaigns/remove_or_stop_contact_ids', {
      contact_ids: contactIds,
      emailer_campaign_id: sequenceId,
      status: status
    });

    return response.data;
  }

  // ========== Tasks ==========

  async searchTasks(params?: {
    qKeywords?: string;
    sortByField?: string;
    sortAscending?: boolean;
    page?: number;
    perPage?: number;
  }): Promise<{ tasks: ApolloTask[]; pagination: any }> {
    let response = await this.axios.post('/tasks/search', {
      q_keywords: params?.qKeywords,
      sort_by_field: params?.sortByField,
      sort_ascending: params?.sortAscending,
      page: params?.page || 1,
      per_page: params?.perPage || 25
    });

    return {
      tasks: response.data.tasks || [],
      pagination: response.data.pagination || {}
    };
  }

  async createTask(task: {
    userId?: string;
    contactId?: string;
    accountId?: string;
    type?: string;
    priority?: string;
    dueDate?: string;
    note?: string;
    status?: string;
  }): Promise<any> {
    let response = await this.axios.post('/tasks', {
      user_id: task.userId,
      contact_id: task.contactId,
      account_id: task.accountId,
      type: task.type,
      priority: task.priority,
      due_date: task.dueDate,
      note: task.note,
      status: task.status
    });

    return response.data;
  }

  async bulkCreateTasks(tasks: Array<{
    userId?: string;
    contactId?: string;
    accountId?: string;
    type?: string;
    priority?: string;
    dueDate?: string;
    note?: string;
    status?: string;
  }>): Promise<any> {
    let response = await this.axios.post('/tasks/bulk_create', {
      tasks: tasks.map(t => ({
        user_id: t.userId,
        contact_id: t.contactId,
        account_id: t.accountId,
        type: t.type,
        priority: t.priority,
        due_date: t.dueDate,
        note: t.note,
        status: t.status
      }))
    });

    return response.data;
  }

  // ========== Users ==========

  async listUsers(): Promise<{ users: ApolloUser[] }> {
    let response = await this.axios.get('/users/search');

    return {
      users: response.data.users || []
    };
  }

  // ========== Contact Stages ==========

  async listContactStages(): Promise<{ contactStages: Array<{ id: string; name: string; [key: string]: any }> }> {
    let response = await this.axios.get('/contact_stages');

    return {
      contactStages: response.data.contact_stages || []
    };
  }

  // ========== Account Stages ==========

  async listAccountStages(): Promise<{ accountStages: Array<{ id: string; name: string; [key: string]: any }> }> {
    let response = await this.axios.get('/account_stages');

    return {
      accountStages: response.data.account_stages || []
    };
  }
}
