import { createAxios } from 'slates';

let identityAxios = createAxios({
  baseURL: 'https://identitytoolkit.googleapis.com/v1',
});

export interface FirebaseUser {
  userId: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  photoUrl?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  createdAt?: string;
  lastSignedInAt?: string;
  customAttributes?: string;
  providerUserInfo?: Array<{
    providerId: string;
    federatedId?: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
    phoneNumber?: string;
  }>;
}

let mapUserRecord = (user: any): FirebaseUser => ({
  userId: user.localId,
  email: user.email,
  displayName: user.displayName,
  phoneNumber: user.phoneNumber,
  photoUrl: user.photoUrl,
  emailVerified: user.emailVerified,
  disabled: user.disabled,
  createdAt: user.createdAt,
  lastSignedInAt: user.lastLoginAt,
  customAttributes: user.customAttributes,
  providerUserInfo: user.providerUserInfo,
});

export class AuthClient {
  private token: string;
  private projectId: string;

  constructor(params: { token: string; projectId: string }) {
    this.token = params.token;
    this.projectId = params.projectId;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  async getUser(userId: string): Promise<FirebaseUser> {
    let response = await identityAxios.post(`/projects/${this.projectId}/accounts:lookup`, {
      localId: [userId],
    }, {
      headers: this.headers,
    });

    let users = response.data.users;
    if (!users || users.length === 0) {
      throw new Error(`User not found: ${userId}`);
    }

    return mapUserRecord(users[0]);
  }

  async getUserByEmail(email: string): Promise<FirebaseUser> {
    let response = await identityAxios.post(`/projects/${this.projectId}/accounts:lookup`, {
      email: [email],
    }, {
      headers: this.headers,
    });

    let users = response.data.users;
    if (!users || users.length === 0) {
      throw new Error(`User not found with email: ${email}`);
    }

    return mapUserRecord(users[0]);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<FirebaseUser> {
    let response = await identityAxios.post(`/projects/${this.projectId}/accounts:lookup`, {
      phoneNumber: [phoneNumber],
    }, {
      headers: this.headers,
    });

    let users = response.data.users;
    if (!users || users.length === 0) {
      throw new Error(`User not found with phone number: ${phoneNumber}`);
    }

    return mapUserRecord(users[0]);
  }

  async createUser(params: {
    email?: string;
    password?: string;
    displayName?: string;
    phoneNumber?: string;
    photoUrl?: string;
    emailVerified?: boolean;
    disabled?: boolean;
  }): Promise<FirebaseUser> {
    let response = await identityAxios.post(`/projects/${this.projectId}/accounts`, {
      email: params.email,
      password: params.password,
      displayName: params.displayName,
      phoneNumber: params.phoneNumber,
      photoUrl: params.photoUrl,
      emailVerified: params.emailVerified,
      disabled: params.disabled,
    }, {
      headers: this.headers,
    });

    return mapUserRecord(response.data);
  }

  async updateUser(userId: string, params: {
    email?: string;
    password?: string;
    displayName?: string;
    phoneNumber?: string;
    photoUrl?: string;
    emailVerified?: boolean;
    disabled?: boolean;
    customAttributes?: string;
  }): Promise<FirebaseUser> {
    let body: any = {
      localId: userId,
    };

    if (params.email !== undefined) body.email = params.email;
    if (params.password !== undefined) body.password = params.password;
    if (params.displayName !== undefined) body.displayName = params.displayName;
    if (params.phoneNumber !== undefined) body.phoneNumber = params.phoneNumber;
    if (params.photoUrl !== undefined) body.photoUrl = params.photoUrl;
    if (params.emailVerified !== undefined) body.emailVerified = params.emailVerified;
    if (params.disabled !== undefined) body.disabled = params.disabled;
    if (params.customAttributes !== undefined) body.customAttributes = params.customAttributes;

    let response = await identityAxios.post(`/projects/${this.projectId}/accounts:update`, body, {
      headers: this.headers,
    });

    return mapUserRecord(response.data);
  }

  async deleteUser(userId: string): Promise<void> {
    await identityAxios.post(`/projects/${this.projectId}/accounts:delete`, {
      localId: userId,
    }, {
      headers: this.headers,
    });
  }

  async listUsers(params?: {
    maxResults?: number;
    nextPageToken?: string;
  }): Promise<{
    users: FirebaseUser[];
    nextPageToken?: string;
  }> {
    let body: any = {
      maxResults: params?.maxResults || 100,
    };
    if (params?.nextPageToken) {
      body.nextPageToken = params.nextPageToken;
    }

    let response = await identityAxios.post(`/projects/${this.projectId}/accounts:batchGet`, body, {
      headers: this.headers,
      params: {
        maxResults: body.maxResults,
        nextPageToken: body.nextPageToken,
      },
    });

    let users = (response.data.users || []).map(mapUserRecord);
    return {
      users,
      nextPageToken: response.data.nextPageToken,
    };
  }

  async setCustomClaims(userId: string, customClaims: Record<string, any>): Promise<void> {
    await identityAxios.post(`/projects/${this.projectId}/accounts:update`, {
      localId: userId,
      customAttributes: JSON.stringify(customClaims),
    }, {
      headers: this.headers,
    });
  }
}
