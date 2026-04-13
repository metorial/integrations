import { createAxios } from 'slates';

let api = createAxios({
  baseURL: 'https://people.googleapis.com/v1/',
});

export let DEFAULT_PERSON_FIELDS = 'names,emailAddresses,phoneNumbers,addresses,organizations,birthdays,urls,biographies,events,genders,occupations,nicknames,relations,userDefined,memberships';

export let READONLY_PERSON_FIELDS = 'names,emailAddresses,phoneNumbers';

export interface ContactInput {
  names?: Array<{ givenName?: string; familyName?: string; middleName?: string; prefix?: string; suffix?: string }>;
  emailAddresses?: Array<{ value: string; type?: string }>;
  phoneNumbers?: Array<{ value: string; type?: string }>;
  addresses?: Array<{
    streetAddress?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    type?: string;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
    department?: string;
  }>;
  birthdays?: Array<{ date?: { year?: number; month?: number; day?: number } }>;
  urls?: Array<{ value: string; type?: string }>;
  biographies?: Array<{ value: string }>;
  userDefined?: Array<{ key: string; value: string }>;
  nicknames?: Array<{ value: string }>;
  relations?: Array<{ person: string; type?: string }>;
  events?: Array<{ date?: { year?: number; month?: number; day?: number }; type?: string }>;
  occupations?: Array<{ value: string }>;
}

export class Client {
  private headers: Record<string, string>;

  constructor(private config: { token: string }) {
    this.headers = {
      Authorization: `Bearer ${config.token}`,
    };
  }

  // ---- People / Contacts ----

  async getContact(resourceName: string, personFields?: string) {
    let response = await api.get(resourceName, {
      params: { personFields: personFields || DEFAULT_PERSON_FIELDS },
      headers: this.headers,
    });
    return response.data;
  }

  async listContacts(params: {
    pageSize?: number;
    pageToken?: string;
    sortOrder?: string;
    personFields?: string;
    syncToken?: string;
  }) {
    let response = await api.get('people/me/connections', {
      params: {
        personFields: params.personFields || DEFAULT_PERSON_FIELDS,
        pageSize: params.pageSize || 100,
        pageToken: params.pageToken,
        sortOrder: params.sortOrder,
        syncToken: params.syncToken,
      },
      headers: this.headers,
    });
    return response.data;
  }

  async searchContacts(query: string, personFields?: string, pageSize?: number) {
    let response = await api.get('people:searchContacts', {
      params: {
        query,
        readMask: personFields || DEFAULT_PERSON_FIELDS,
        pageSize: pageSize || 30,
      },
      headers: this.headers,
    });
    return response.data;
  }

  async createContact(contactData: ContactInput) {
    let response = await api.post('people:createContact', contactData, {
      params: { personFields: DEFAULT_PERSON_FIELDS },
      headers: this.headers,
    });
    return response.data;
  }

  async updateContact(
    resourceName: string,
    contactData: ContactInput,
    etag: string,
    updatePersonFields: string
  ) {
    let body = {
      ...contactData,
      etag,
    };
    let response = await api.patch(`${resourceName}:updateContact`, body, {
      params: {
        updatePersonFields,
        personFields: DEFAULT_PERSON_FIELDS,
      },
      headers: this.headers,
    });
    return response.data;
  }

  async deleteContact(resourceName: string) {
    await api.delete(`${resourceName}:deleteContact`, {
      headers: this.headers,
    });
  }

  async batchGetContacts(resourceNames: string[], personFields?: string) {
    let response = await api.get('people:batchGet', {
      params: {
        resourceNames,
        personFields: personFields || DEFAULT_PERSON_FIELDS,
      },
      headers: this.headers,
    });
    return response.data;
  }

  async deleteContactPhoto(resourceName: string) {
    let response = await api.delete(`${resourceName}:deleteContactPhoto`, {
      headers: this.headers,
    });
    return response.data;
  }

  // ---- Contact Groups ----

  async listContactGroups(pageSize?: number, pageToken?: string) {
    let response = await api.get('contactGroups', {
      params: {
        pageSize: pageSize || 100,
        pageToken,
        groupFields: 'name,groupType,memberCount,clientData',
      },
      headers: this.headers,
    });
    return response.data;
  }

  async getContactGroup(resourceName: string, maxMembers?: number) {
    let response = await api.get(resourceName, {
      params: {
        maxMembers: maxMembers || 100,
        groupFields: 'name,groupType,memberCount,clientData',
      },
      headers: this.headers,
    });
    return response.data;
  }

  async createContactGroup(name: string, clientData?: Array<{ key: string; value: string }>) {
    let response = await api.post('contactGroups', {
      contactGroup: {
        name,
        clientData,
      },
    }, {
      headers: this.headers,
    });
    return response.data;
  }

  async updateContactGroup(
    resourceName: string,
    name: string,
    clientData?: Array<{ key: string; value: string }>
  ) {
    let response = await api.put(resourceName, {
      contactGroup: {
        name,
        clientData,
      },
      updateGroupFields: 'name,clientData',
    }, {
      headers: this.headers,
    });
    return response.data;
  }

  async deleteContactGroup(resourceName: string, deleteContacts?: boolean) {
    await api.delete(resourceName, {
      params: { deleteContacts: deleteContacts || false },
      headers: this.headers,
    });
  }

  async modifyContactGroupMembers(
    resourceName: string,
    addResourceNames?: string[],
    removeResourceNames?: string[]
  ) {
    let response = await api.post(`${resourceName}/members:modify`, {
      resourceNamesToAdd: addResourceNames,
      resourceNamesToRemove: removeResourceNames,
    }, {
      headers: this.headers,
    });
    return response.data;
  }

  // ---- Other Contacts ----

  async listOtherContacts(pageSize?: number, pageToken?: string) {
    let response = await api.get('otherContacts', {
      params: {
        pageSize: pageSize || 100,
        pageToken,
        readMask: READONLY_PERSON_FIELDS,
      },
      headers: this.headers,
    });
    return response.data;
  }

  async searchOtherContacts(query: string, pageSize?: number) {
    let response = await api.get('otherContacts:search', {
      params: {
        query,
        readMask: READONLY_PERSON_FIELDS,
        pageSize: pageSize || 30,
      },
      headers: this.headers,
    });
    return response.data;
  }

  async copyOtherContactToMyContacts(resourceName: string) {
    let response = await api.post(`${resourceName}:copyOtherContactToMyContactsGroup`, {
      copyMask: READONLY_PERSON_FIELDS,
      readMask: DEFAULT_PERSON_FIELDS,
    }, {
      headers: this.headers,
    });
    return response.data;
  }

  // ---- Directory ----

  async listDirectoryPeople(params: {
    pageSize?: number;
    pageToken?: string;
    sources: string[];
    readMask?: string;
  }) {
    let response = await api.get('people:listDirectoryPeople', {
      params: {
        pageSize: params.pageSize || 100,
        pageToken: params.pageToken,
        sources: params.sources,
        readMask: params.readMask || DEFAULT_PERSON_FIELDS,
      },
      headers: this.headers,
    });
    return response.data;
  }

  async searchDirectoryPeople(params: {
    query: string;
    pageSize?: number;
    pageToken?: string;
    sources: string[];
    readMask?: string;
  }) {
    let response = await api.get('people:searchDirectoryPeople', {
      params: {
        query: params.query,
        pageSize: params.pageSize || 30,
        pageToken: params.pageToken,
        sources: params.sources,
        readMask: params.readMask || DEFAULT_PERSON_FIELDS,
      },
      headers: this.headers,
    });
    return response.data;
  }
}
