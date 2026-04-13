import { createAxios } from 'slates';
import {
  GtmAccount,
  GtmContainer,
  GtmWorkspace,
  GtmTag,
  GtmTrigger,
  GtmVariable,
  GtmBuiltInVariable,
  GtmContainerVersion,
  GtmContainerVersionHeader,
  GtmEnvironment,
  GtmFolder,
  GtmUserPermission,
  GtmCreateVersionResponse,
  GtmPublishResponse,
  GtmWorkspaceStatus,
  ListAccountsResponse,
  ListContainersResponse,
  ListWorkspacesResponse,
  ListTagsResponse,
  ListTriggersResponse,
  ListVariablesResponse,
  ListBuiltInVariablesResponse,
  ListVersionHeadersResponse,
  ListEnvironmentsResponse,
  ListFoldersResponse,
  ListUserPermissionsResponse,
  FolderEntitiesResponse,
} from './types';

let gtmAxios = createAxios({
  baseURL: 'https://tagmanager.googleapis.com/tagmanager/v2'
});

export class GtmClient {
  constructor(private token: string) {}

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // ========== Accounts ==========

  async listAccounts(pageToken?: string): Promise<ListAccountsResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get('/accounts', {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getAccount(accountId: string): Promise<GtmAccount> {
    let response = await gtmAxios.get(`/accounts/${accountId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateAccount(accountId: string, data: Partial<GtmAccount>): Promise<GtmAccount> {
    let response = await gtmAxios.put(`/accounts/${accountId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // ========== Containers ==========

  async listContainers(accountId: string, pageToken?: string): Promise<ListContainersResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getContainer(accountId: string, containerId: string): Promise<GtmContainer> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createContainer(accountId: string, data: {
    name: string;
    usageContext?: string[];
    notes?: string;
    domainName?: string[];
  }): Promise<GtmContainer> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateContainer(accountId: string, containerId: string, data: Partial<GtmContainer>): Promise<GtmContainer> {
    let response = await gtmAxios.put(`/accounts/${accountId}/containers/${containerId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteContainer(accountId: string, containerId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}`, {
      headers: this.getHeaders()
    });
  }

  async getContainerSnippet(accountId: string, containerId: string): Promise<string> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}:snippet`, {
      headers: this.getHeaders()
    });
    return response.data?.snippet || '';
  }

  // ========== Workspaces ==========

  async listWorkspaces(accountId: string, containerId: string, pageToken?: string): Promise<ListWorkspacesResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getWorkspace(accountId: string, containerId: string, workspaceId: string): Promise<GtmWorkspace> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createWorkspace(accountId: string, containerId: string, data: {
    name: string;
    description?: string;
  }): Promise<GtmWorkspace> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateWorkspace(accountId: string, containerId: string, workspaceId: string, data: Partial<GtmWorkspace>): Promise<GtmWorkspace> {
    let response = await gtmAxios.put(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteWorkspace(accountId: string, containerId: string, workspaceId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`, {
      headers: this.getHeaders()
    });
  }

  async syncWorkspace(accountId: string, containerId: string, workspaceId: string): Promise<GtmWorkspaceStatus> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}:sync`, null, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getWorkspaceStatus(accountId: string, containerId: string, workspaceId: string): Promise<GtmWorkspaceStatus> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/status`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // ========== Tags ==========

  async listTags(accountId: string, containerId: string, workspaceId: string, pageToken?: string): Promise<ListTagsResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getTag(accountId: string, containerId: string, workspaceId: string, tagId: string): Promise<GtmTag> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createTag(accountId: string, containerId: string, workspaceId: string, data: Partial<GtmTag>): Promise<GtmTag> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateTag(accountId: string, containerId: string, workspaceId: string, tagId: string, data: Partial<GtmTag>): Promise<GtmTag> {
    let response = await gtmAxios.put(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteTag(accountId: string, containerId: string, workspaceId: string, tagId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`, {
      headers: this.getHeaders()
    });
  }

  async revertTag(accountId: string, containerId: string, workspaceId: string, tagId: string): Promise<GtmTag> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}:revert`, null, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // ========== Triggers ==========

  async listTriggers(accountId: string, containerId: string, workspaceId: string, pageToken?: string): Promise<ListTriggersResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getTrigger(accountId: string, containerId: string, workspaceId: string, triggerId: string): Promise<GtmTrigger> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createTrigger(accountId: string, containerId: string, workspaceId: string, data: Partial<GtmTrigger>): Promise<GtmTrigger> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateTrigger(accountId: string, containerId: string, workspaceId: string, triggerId: string, data: Partial<GtmTrigger>): Promise<GtmTrigger> {
    let response = await gtmAxios.put(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteTrigger(accountId: string, containerId: string, workspaceId: string, triggerId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`, {
      headers: this.getHeaders()
    });
  }

  // ========== Variables ==========

  async listVariables(accountId: string, containerId: string, workspaceId: string, pageToken?: string): Promise<ListVariablesResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getVariable(accountId: string, containerId: string, workspaceId: string, variableId: string): Promise<GtmVariable> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createVariable(accountId: string, containerId: string, workspaceId: string, data: Partial<GtmVariable>): Promise<GtmVariable> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateVariable(accountId: string, containerId: string, workspaceId: string, variableId: string, data: Partial<GtmVariable>): Promise<GtmVariable> {
    let response = await gtmAxios.put(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteVariable(accountId: string, containerId: string, workspaceId: string, variableId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`, {
      headers: this.getHeaders()
    });
  }

  // ========== Built-In Variables ==========

  async listBuiltInVariables(accountId: string, containerId: string, workspaceId: string, pageToken?: string): Promise<ListBuiltInVariablesResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async enableBuiltInVariables(accountId: string, containerId: string, workspaceId: string, types: string[]): Promise<GtmBuiltInVariable[]> {
    let response = await gtmAxios.post(
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables`,
      null,
      {
        headers: this.getHeaders(),
        params: { type: types }
      }
    );
    return response.data?.builtInVariable || [];
  }

  async disableBuiltInVariables(accountId: string, containerId: string, workspaceId: string, types: string[]): Promise<void> {
    await gtmAxios.delete(
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables`,
      {
        headers: this.getHeaders(),
        params: { type: types }
      }
    );
  }

  // ========== Versions ==========

  async createVersion(accountId: string, containerId: string, workspaceId: string, data: {
    name?: string;
    notes?: string;
  }): Promise<GtmCreateVersionResponse> {
    let response = await gtmAxios.post(
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}:create_version`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getVersion(accountId: string, containerId: string, versionId: string): Promise<GtmContainerVersion> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/versions/${versionId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getLiveVersion(accountId: string, containerId: string): Promise<GtmContainerVersion> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/versions:live`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async publishVersion(accountId: string, containerId: string, versionId: string): Promise<GtmPublishResponse> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/versions/${versionId}:publish`, null, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteVersion(accountId: string, containerId: string, versionId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}/versions/${versionId}`, {
      headers: this.getHeaders()
    });
  }

  async listVersionHeaders(accountId: string, containerId: string, pageToken?: string): Promise<ListVersionHeadersResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/version_headers`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getLatestVersionHeader(accountId: string, containerId: string): Promise<GtmContainerVersionHeader> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/version_headers:latest`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // ========== Environments ==========

  async listEnvironments(accountId: string, containerId: string, pageToken?: string): Promise<ListEnvironmentsResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/environments`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getEnvironment(accountId: string, containerId: string, environmentId: string): Promise<GtmEnvironment> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/environments/${environmentId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createEnvironment(accountId: string, containerId: string, data: {
    name: string;
    description?: string;
    enableDebug?: boolean;
    url?: string;
  }): Promise<GtmEnvironment> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/environments`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateEnvironment(accountId: string, containerId: string, environmentId: string, data: Partial<GtmEnvironment>): Promise<GtmEnvironment> {
    let response = await gtmAxios.put(`/accounts/${accountId}/containers/${containerId}/environments/${environmentId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteEnvironment(accountId: string, containerId: string, environmentId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}/environments/${environmentId}`, {
      headers: this.getHeaders()
    });
  }

  async reauthorizeEnvironment(accountId: string, containerId: string, environmentId: string): Promise<GtmEnvironment> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/environments/${environmentId}:reauthorize`, null, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // ========== Folders ==========

  async listFolders(accountId: string, containerId: string, workspaceId: string, pageToken?: string): Promise<ListFoldersResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getFolder(accountId: string, containerId: string, workspaceId: string, folderId: string): Promise<GtmFolder> {
    let response = await gtmAxios.get(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createFolder(accountId: string, containerId: string, workspaceId: string, data: {
    name: string;
    notes?: string;
  }): Promise<GtmFolder> {
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateFolder(accountId: string, containerId: string, workspaceId: string, folderId: string, data: Partial<GtmFolder>): Promise<GtmFolder> {
    let response = await gtmAxios.put(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteFolder(accountId: string, containerId: string, workspaceId: string, folderId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`, {
      headers: this.getHeaders()
    });
  }

  async listFolderEntities(accountId: string, containerId: string, workspaceId: string, folderId: string, pageToken?: string): Promise<FolderEntitiesResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.post(`/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}:entities`, null, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async moveEntitiesToFolder(accountId: string, containerId: string, workspaceId: string, folderId: string, entities: {
    tagId?: string[];
    triggerId?: string[];
    variableId?: string[];
  }): Promise<void> {
    await gtmAxios.post(
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}:move_entities_to_folder`,
      null,
      {
        headers: this.getHeaders(),
        params: entities
      }
    );
  }

  // ========== User Permissions ==========

  async listUserPermissions(accountId: string, pageToken?: string): Promise<ListUserPermissionsResponse> {
    let params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;
    let response = await gtmAxios.get(`/accounts/${accountId}/user_permissions`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getUserPermission(accountId: string, userPermissionId: string): Promise<GtmUserPermission> {
    let response = await gtmAxios.get(`/accounts/${accountId}/user_permissions/${userPermissionId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createUserPermission(accountId: string, data: {
    emailAddress: string;
    accountAccess?: { permission: string };
    containerAccess?: Array<{ containerId: string; permission: string }>;
  }): Promise<GtmUserPermission> {
    let response = await gtmAxios.post(`/accounts/${accountId}/user_permissions`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateUserPermission(accountId: string, userPermissionId: string, data: Partial<GtmUserPermission>): Promise<GtmUserPermission> {
    let response = await gtmAxios.put(`/accounts/${accountId}/user_permissions/${userPermissionId}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteUserPermission(accountId: string, userPermissionId: string): Promise<void> {
    await gtmAxios.delete(`/accounts/${accountId}/user_permissions/${userPermissionId}`, {
      headers: this.getHeaders()
    });
  }
}
