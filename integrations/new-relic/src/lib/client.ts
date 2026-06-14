import { createAxios } from 'slates';
import { newRelicApiError, newRelicGraphqlErrors } from './errors';

export type Region = 'us' | 'eu';

let getGraphqlUrl = (region: Region): string =>
  region === 'eu' ? 'https://api.eu.newrelic.com/graphql' : 'https://api.newrelic.com/graphql';

let getMetricIngestUrl = (region: Region): string =>
  region === 'eu'
    ? 'https://metric-api.eu.newrelic.com/metric/v1'
    : 'https://metric-api.newrelic.com/metric/v1';

let getEventIngestUrl = (region: Region, accountId: string): string =>
  region === 'eu'
    ? `https://insights-collector.eu01.nr-data.net/v1/accounts/${accountId}/events`
    : `https://insights-collector.nr-data.net/v1/accounts/${accountId}/events`;

let getLogIngestUrl = (region: Region): string =>
  region === 'eu'
    ? 'https://log-api.eu.newrelic.com/log/v1'
    : 'https://log-api.newrelic.com/log/v1';

let getTraceIngestUrl = (region: Region): string =>
  region === 'eu'
    ? 'https://trace-api.eu.newrelic.com/trace/v1'
    : 'https://trace-api.newrelic.com/trace/v1';

export interface ClientConfig {
  token: string;
  region: Region;
  accountId: string;
  licenseKey?: string;
}

let assertNoPayloadErrors = (operation: string, errors?: unknown[] | null) => {
  if (errors?.length) {
    throw newRelicGraphqlErrors(operation, errors);
  }
};

let defaultRuntime = (monitorType: string) =>
  monitorType === 'SCRIPT_API'
    ? {
        runtimeType: 'NODE_API',
        runtimeTypeVersion: '22.20.0',
        scriptLanguage: 'JAVASCRIPT'
      }
    : {
        runtimeType: 'CHROME_BROWSER',
        runtimeTypeVersion: 'LATEST',
        scriptLanguage: 'JAVASCRIPT'
      };

export class NerdGraphClient {
  private http: ReturnType<typeof createAxios>;
  private accountId: string;

  constructor(config: ClientConfig) {
    this.accountId = config.accountId;
    this.http = createAxios({
      baseURL: getGraphqlUrl(config.region),
      headers: {
        'API-Key': config.token,
        'Content-Type': 'application/json'
      }
    });
  }

  async query(graphqlQuery: string, variables?: Record<string, any>): Promise<any> {
    try {
      let response = await this.http.post('', {
        query: graphqlQuery,
        variables: variables || {}
      });

      if (response.data?.errors?.length) {
        throw newRelicGraphqlErrors('NerdGraph request', response.data.errors);
      }

      return response.data?.data;
    } catch (error) {
      throw newRelicApiError(error, 'NerdGraph request');
    }
  }

  async runNrql(nrql: string, timeout?: number): Promise<any> {
    let timeoutValue = timeout || 30;
    let data = await this.query(
      `query($accountId: Int!, $nrql: Nrql!, $timeout: Seconds) {
        actor {
          account(id: $accountId) {
            nrql(query: $nrql, timeout: $timeout) {
              results
              metadata {
                timeWindow { begin end }
                facets
              }
            }
          }
        }
      }`,
      { accountId: Number.parseInt(this.accountId, 10), nrql, timeout: timeoutValue }
    );

    return data?.actor?.account?.nrql;
  }

  async searchEntities(params: { query?: string; cursor?: string }): Promise<any> {
    let data = await this.query(
      `query($query: String, $cursor: String) {
        actor {
          entitySearch(query: $query) {
            results(cursor: $cursor) {
              entities {
                guid
                name
                entityType
                domain
                type
                reporting
                alertSeverity
                permalink
                tags { key values }
                account { id name }
              }
              nextCursor
            }
            count
          }
        }
      }`,
      { query: params.query || undefined, cursor: params.cursor }
    );

    return data?.actor?.entitySearch;
  }

  async getEntity(entityGuid: string): Promise<any> {
    let data = await this.query(
      `query($guid: EntityGuid!) {
        actor {
          entity(guid: $guid) {
            guid
            name
            entityType
            domain
            type
            reporting
            alertSeverity
            permalink
            tags { key values }
            account { id name }
            goldenMetrics {
              metrics {
                name
                title
                unit
                query
              }
            }
          }
        }
      }`,
      { guid: entityGuid }
    );

    return data?.actor?.entity;
  }

  async addEntityTags(
    entityGuid: string,
    tags: Array<{ key: string; values: string[] }>
  ): Promise<any> {
    let data = await this.query(
      `mutation($guid: EntityGuid!, $tags: [TaggingTagInput!]!) {
        taggingAddTagsToEntity(guid: $guid, tags: $tags) {
          errors { message type }
        }
      }`,
      { guid: entityGuid, tags }
    );

    let result = data?.taggingAddTagsToEntity;
    assertNoPayloadErrors('tag add', result?.errors);
    return result;
  }

  async deleteEntityTags(entityGuid: string, tagKeys: string[]): Promise<any> {
    let data = await this.query(
      `mutation($guid: EntityGuid!, $tagKeys: [String!]!) {
        taggingDeleteTagFromEntity(guid: $guid, tagKeys: $tagKeys) {
          errors { message type }
        }
      }`,
      { guid: entityGuid, tagKeys }
    );

    let result = data?.taggingDeleteTagFromEntity;
    assertNoPayloadErrors('tag deletion', result?.errors);
    return result;
  }

  async replaceEntityTags(
    entityGuid: string,
    tags: Array<{ key: string; values: string[] }>
  ): Promise<any> {
    let data = await this.query(
      `mutation($guid: EntityGuid!, $tags: [TaggingTagInput!]!) {
        taggingReplaceTagsOnEntity(guid: $guid, tags: $tags) {
          errors { message type }
        }
      }`,
      { guid: entityGuid, tags }
    );

    let result = data?.taggingReplaceTagsOnEntity;
    assertNoPayloadErrors('tag replace', result?.errors);
    return result;
  }

  async listAlertPolicies(params?: {
    cursor?: string;
    ids?: string[];
    name?: string;
    nameLike?: string;
  }): Promise<any> {
    let searchCriteria: Record<string, unknown> = {};
    if (params?.ids?.length) searchCriteria.ids = params.ids;
    if (params?.name) searchCriteria.name = params.name;
    if (params?.nameLike) searchCriteria.nameLike = params.nameLike;

    let data = await this.query(
      `query($accountId: Int!, $cursor: String, $searchCriteria: AlertsPoliciesSearchCriteriaInput) {
        actor {
          account(id: $accountId) {
            alerts {
              policiesSearch(cursor: $cursor, searchCriteria: $searchCriteria) {
                policies {
                  id
                  name
                  incidentPreference
                }
                nextCursor
                totalCount
              }
            }
          }
        }
      }`,
      {
        accountId: Number.parseInt(this.accountId, 10),
        cursor: params?.cursor,
        searchCriteria: Object.keys(searchCriteria).length > 0 ? searchCriteria : undefined
      }
    );

    return data?.actor?.account?.alerts?.policiesSearch;
  }

  async getAlertPolicy(policyId: string): Promise<any> {
    let data = await this.query(
      `query($accountId: Int!, $id: ID!) {
        actor {
          account(id: $accountId) {
            alerts {
              policy(id: $id) {
                id
                name
                incidentPreference
              }
            }
          }
        }
      }`,
      { accountId: Number.parseInt(this.accountId, 10), id: policyId }
    );

    return data?.actor?.account?.alerts?.policy;
  }

  async createAlertPolicy(params: {
    name: string;
    incidentPreference: string;
  }): Promise<any> {
    let data = await this.query(
      `mutation($accountId: Int!, $policy: AlertsPolicyInput!) {
        alertsPolicyCreate(accountId: $accountId, policy: $policy) {
          id
          name
          incidentPreference
        }
      }`,
      {
        accountId: Number.parseInt(this.accountId, 10),
        policy: {
          name: params.name,
          incidentPreference: params.incidentPreference
        }
      }
    );

    return data?.alertsPolicyCreate;
  }

  async updateAlertPolicy(
    policyId: string,
    params: {
      name?: string;
      incidentPreference?: string;
    }
  ): Promise<any> {
    let policy: Record<string, unknown> = {};
    if (params.name !== undefined) policy.name = params.name;
    if (params.incidentPreference !== undefined) {
      policy.incidentPreference = params.incidentPreference;
    }

    let data = await this.query(
      `mutation($accountId: Int!, $id: ID!, $policy: AlertsPolicyUpdateInput!) {
        alertsPolicyUpdate(accountId: $accountId, id: $id, policy: $policy) {
          id
          name
          incidentPreference
        }
      }`,
      {
        accountId: Number.parseInt(this.accountId, 10),
        id: policyId,
        policy
      }
    );

    return data?.alertsPolicyUpdate;
  }

  async deleteAlertPolicy(policyId: string): Promise<any> {
    let data = await this.query(
      `mutation($accountId: Int!, $id: ID!) {
        alertsPolicyDelete(accountId: $accountId, id: $id) {
          id
        }
      }`,
      { accountId: Number.parseInt(this.accountId, 10), id: policyId }
    );

    return data?.alertsPolicyDelete;
  }

  async createNrqlAlertCondition(
    policyId: string,
    params: {
      name: string;
      nrql: string;
      enabled?: boolean;
      type: 'STATIC' | 'BASELINE';
      critical?: {
        threshold: number;
        thresholdDuration: number;
        operator: string;
        thresholdOccurrences: string;
      };
      warning?: {
        threshold: number;
        thresholdDuration: number;
        operator: string;
        thresholdOccurrences: string;
      };
      signal?: {
        aggregationDelay?: number;
        aggregationMethod?: string;
        aggregationWindow?: number;
        fillOption?: string;
        fillValue?: number;
      };
      expiration?: {
        closeViolationsOnExpiration?: boolean;
        expirationDuration?: number;
        openViolationOnExpiration?: boolean;
      };
      baselineDirection?: string;
      violationTimeLimitSeconds?: number;
      description?: string;
    }
  ): Promise<any> {
    let terms: any[] = [];
    if (params.critical) {
      terms.push({ ...params.critical, priority: 'CRITICAL' });
    }
    if (params.warning) {
      terms.push({ ...params.warning, priority: 'WARNING' });
    }

    let conditionInput: any = {
      name: params.name,
      enabled: params.enabled !== false,
      nrql: { query: params.nrql },
      terms,
      signal: params.signal || {
        aggregationWindow: 60,
        aggregationMethod: 'EVENT_FLOW',
        aggregationDelay: 120
      },
      description: params.description || '',
      violationTimeLimitSeconds: params.violationTimeLimitSeconds || 86400
    };

    if (params.type === 'BASELINE') {
      conditionInput.baselineDirection = params.baselineDirection || 'UPPER_ONLY';
    }

    if (params.expiration) {
      conditionInput.expiration = params.expiration;
    }

    let mutation =
      params.type === 'STATIC'
        ? `mutation($accountId: Int!, $policyId: ID!, $condition: AlertsNrqlConditionStaticInput!) {
          alertsNrqlConditionStaticCreate(accountId: $accountId, policyId: $policyId, condition: $condition) {
            id name enabled nrql { query } terms { threshold thresholdDuration operator priority thresholdOccurrences } policyId description
          }
        }`
        : `mutation($accountId: Int!, $policyId: ID!, $condition: AlertsNrqlConditionBaselineInput!) {
          alertsNrqlConditionBaselineCreate(accountId: $accountId, policyId: $policyId, condition: $condition) {
            id name enabled nrql { query } terms { threshold thresholdDuration operator priority thresholdOccurrences } policyId description
          }
        }`;

    let data = await this.query(mutation, {
      accountId: Number.parseInt(this.accountId, 10),
      policyId,
      condition: conditionInput
    });

    return params.type === 'STATIC'
      ? data?.alertsNrqlConditionStaticCreate
      : data?.alertsNrqlConditionBaselineCreate;
  }

  async updateNrqlAlertCondition(
    conditionId: string,
    params: {
      name?: string;
      nrql?: string;
      enabled?: boolean;
      type: 'STATIC' | 'BASELINE';
      critical?: {
        threshold: number;
        thresholdDuration: number;
        operator: string;
        thresholdOccurrences: string;
      };
      warning?: {
        threshold: number;
        thresholdDuration: number;
        operator: string;
        thresholdOccurrences: string;
      };
      baselineDirection?: string;
      violationTimeLimitSeconds?: number;
      description?: string;
    }
  ): Promise<any> {
    let conditionInput: any = {};
    if (params.name !== undefined) conditionInput.name = params.name;
    if (params.nrql !== undefined) conditionInput.nrql = { query: params.nrql };
    if (params.enabled !== undefined) conditionInput.enabled = params.enabled;
    if (params.description !== undefined) conditionInput.description = params.description;
    if (params.violationTimeLimitSeconds !== undefined) {
      conditionInput.violationTimeLimitSeconds = params.violationTimeLimitSeconds;
    }
    if (params.type === 'BASELINE' && params.baselineDirection !== undefined) {
      conditionInput.baselineDirection = params.baselineDirection;
    }

    let terms: any[] = [];
    if (params.critical) terms.push({ ...params.critical, priority: 'CRITICAL' });
    if (params.warning) terms.push({ ...params.warning, priority: 'WARNING' });
    if (terms.length > 0) conditionInput.terms = terms;

    let mutation =
      params.type === 'STATIC'
        ? `mutation($accountId: Int!, $id: ID!, $condition: AlertsNrqlConditionStaticInput!) {
          alertsNrqlConditionStaticUpdate(accountId: $accountId, id: $id, condition: $condition) {
            id name enabled nrql { query } terms { threshold thresholdDuration operator priority thresholdOccurrences } policyId description
          }
        }`
        : `mutation($accountId: Int!, $id: ID!, $condition: AlertsNrqlConditionBaselineInput!) {
          alertsNrqlConditionBaselineUpdate(accountId: $accountId, id: $id, condition: $condition) {
            id name enabled nrql { query } terms { threshold thresholdDuration operator priority thresholdOccurrences } policyId description
          }
        }`;

    let data = await this.query(mutation, {
      accountId: Number.parseInt(this.accountId, 10),
      id: conditionId,
      condition: conditionInput
    });

    return params.type === 'STATIC'
      ? data?.alertsNrqlConditionStaticUpdate
      : data?.alertsNrqlConditionBaselineUpdate;
  }

  async deleteAlertCondition(conditionId: string): Promise<any> {
    let data = await this.query(
      `mutation($accountId: Int!, $id: ID!) {
        alertsConditionDelete(accountId: $accountId, id: $id) {
          id
        }
      }`,
      { accountId: Number.parseInt(this.accountId, 10), id: conditionId }
    );

    return data?.alertsConditionDelete;
  }

  async createDashboard(params: {
    name: string;
    description?: string;
    permissions?: string;
    pages: Array<{
      name: string;
      description?: string;
      widgets: Array<{
        title: string;
        visualization: string;
        rawConfiguration: any;
        layout?: { column: number; row: number; width: number; height: number };
      }>;
    }>;
  }): Promise<any> {
    let dashboardInput: any = {
      name: params.name,
      description: params.description || '',
      permissions: params.permissions || 'PUBLIC_READ_WRITE',
      pages: params.pages.map(page => ({
        name: page.name,
        description: page.description || '',
        widgets: page.widgets.map(widget => ({
          title: widget.title,
          visualization: { id: widget.visualization },
          rawConfiguration: widget.rawConfiguration,
          layout: widget.layout
        }))
      }))
    };

    let data = await this.query(
      `mutation($accountId: Int!, $dashboard: DashboardInput!) {
        dashboardCreate(accountId: $accountId, dashboard: $dashboard) {
          entityResult {
            guid name description permalink
            pages { guid name widgets { id title visualization { id } } }
          }
          errors { description type }
        }
      }`,
      { accountId: Number.parseInt(this.accountId, 10), dashboard: dashboardInput }
    );

    let result = data?.dashboardCreate;
    assertNoPayloadErrors('dashboard create', result?.errors);
    return result?.entityResult;
  }

  async updateDashboard(
    dashboardGuid: string,
    params: {
      name?: string;
      description?: string;
      permissions?: string;
      pages?: Array<{
        name: string;
        description?: string;
        widgets: Array<{
          title: string;
          visualization: string;
          rawConfiguration: any;
          layout?: { column: number; row: number; width: number; height: number };
        }>;
      }>;
    }
  ): Promise<any> {
    let dashboardInput: any = {};
    if (params.name !== undefined) dashboardInput.name = params.name;
    if (params.description !== undefined) dashboardInput.description = params.description;
    if (params.permissions !== undefined) dashboardInput.permissions = params.permissions;
    if (params.pages !== undefined) {
      dashboardInput.pages = params.pages.map(page => ({
        name: page.name,
        description: page.description || '',
        widgets: page.widgets.map(widget => ({
          title: widget.title,
          visualization: { id: widget.visualization },
          rawConfiguration: widget.rawConfiguration,
          layout: widget.layout
        }))
      }));
    }

    let data = await this.query(
      `mutation($guid: EntityGuid!, $dashboard: DashboardUpdateInput!) {
        dashboardUpdate(guid: $guid, dashboard: $dashboard) {
          entityResult {
            guid name description permalink
            pages { guid name widgets { id title visualization { id } } }
          }
          errors { description type }
        }
      }`,
      { guid: dashboardGuid, dashboard: dashboardInput }
    );

    let result = data?.dashboardUpdate;
    assertNoPayloadErrors('dashboard update', result?.errors);
    return result?.entityResult;
  }

  async deleteDashboard(dashboardGuid: string): Promise<any> {
    let data = await this.query(
      `mutation($guid: EntityGuid!) {
        dashboardDelete(guid: $guid) {
          status
          errors { description type }
        }
      }`,
      { guid: dashboardGuid }
    );

    let result = data?.dashboardDelete;
    assertNoPayloadErrors('dashboard delete', result?.errors);
    return result;
  }

  async getDashboard(dashboardGuid: string): Promise<any> {
    let data = await this.query(
      `query($guid: EntityGuid!) {
        actor {
          entity(guid: $guid) {
            ... on DashboardEntity {
              guid name description permalink permissions
              pages {
                guid name description
                widgets {
                  id title
                  visualization { id }
                  rawConfiguration
                  layout { column row width height }
                }
              }
            }
          }
        }
      }`,
      { guid: dashboardGuid }
    );

    return data?.actor?.entity;
  }

  async createSyntheticMonitor(params: {
    name: string;
    type: string;
    uri?: string;
    period: string;
    status: string;
    locations: { public: string[] };
    script?: string;
    runtimeTypeVersion?: string;
    browsers?: string[];
    devices?: string[];
    apdexTarget?: number;
    advancedOptions?: Record<string, unknown>;
  }): Promise<any> {
    let monitorType = params.type.toUpperCase();

    let monitorInput: Record<string, unknown> = {
      name: params.name,
      period: params.period,
      status: params.status,
      locations: params.locations
    };
    if (params.apdexTarget !== undefined) monitorInput.apdexTarget = params.apdexTarget;
    if (params.advancedOptions !== undefined) monitorInput.advancedOptions = params.advancedOptions;

    if (monitorType === 'SIMPLE_BROWSER') {
      monitorInput = {
        ...monitorInput,
        uri: params.uri,
        browsers: params.browsers || ['CHROME'],
        devices: params.devices || ['DESKTOP'],
        runtime: {
          ...defaultRuntime(monitorType),
          ...(params.runtimeTypeVersion ? { runtimeTypeVersion: params.runtimeTypeVersion } : {})
        }
      };

      let data = await this.query(
        `mutation($accountId: Int!, $monitor: SyntheticsCreateSimpleBrowserMonitorInput!) {
          syntheticsCreateSimpleBrowserMonitor(accountId: $accountId, monitor: $monitor) {
            monitor { guid name status period uri locations { public } }
            errors { description type }
          }
        }`,
        {
          accountId: Number.parseInt(this.accountId, 10),
          monitor: monitorInput
        }
      );
      let result = data?.syntheticsCreateSimpleBrowserMonitor;
      assertNoPayloadErrors('synthetic monitor create', result?.errors);
      return result?.monitor;
    }

    if (monitorType === 'SCRIPT_BROWSER' || monitorType === 'SCRIPT_API') {
      let mutationName =
        monitorType === 'SCRIPT_BROWSER'
          ? 'syntheticsCreateScriptBrowserMonitor'
          : 'syntheticsCreateScriptApiMonitor';
      let inputType =
        monitorType === 'SCRIPT_BROWSER'
          ? 'SyntheticsCreateScriptBrowserMonitorInput'
          : 'SyntheticsCreateScriptApiMonitorInput';
      monitorInput = {
        ...monitorInput,
        script: params.script,
        runtime: {
          ...defaultRuntime(monitorType),
          ...(params.runtimeTypeVersion ? { runtimeTypeVersion: params.runtimeTypeVersion } : {})
        },
        ...(monitorType === 'SCRIPT_BROWSER'
          ? {
              browsers: params.browsers || ['CHROME'],
              devices: params.devices || ['DESKTOP']
            }
          : {}),
        ...(params.uri ? { uri: params.uri } : {})
      };

      let data = await this.query(
        `mutation($accountId: Int!, $monitor: ${inputType}!) {
          ${mutationName}(accountId: $accountId, monitor: $monitor) {
            monitor { guid name status period locations { public } }
            errors { description type }
          }
        }`,
        {
          accountId: Number.parseInt(this.accountId, 10),
          monitor: monitorInput
        }
      );
      let result = data?.[mutationName];
      assertNoPayloadErrors('synthetic monitor create', result?.errors);
      return result?.monitor;
    }

    // Default: simple ping monitor
    monitorInput = {
      ...monitorInput,
      uri: params.uri
    };

    let data = await this.query(
      `mutation($accountId: Int!, $monitor: SyntheticsCreateSimpleMonitorInput!) {
        syntheticsCreateSimpleMonitor(accountId: $accountId, monitor: $monitor) {
          monitor { guid name status period uri locations { public } }
          errors { description type }
        }
      }`,
      {
        accountId: Number.parseInt(this.accountId, 10),
        monitor: monitorInput
      }
    );
    let result = data?.syntheticsCreateSimpleMonitor;
    assertNoPayloadErrors('synthetic monitor create', result?.errors);
    return result?.monitor;
  }

  async updateSyntheticMonitor(
    monitorGuid: string,
    params: {
      type: string;
      name?: string;
      uri?: string;
      period?: string;
      status?: string;
      locations?: { public: string[] };
      script?: string;
      runtimeTypeVersion?: string;
      browsers?: string[];
      devices?: string[];
      apdexTarget?: number;
      advancedOptions?: Record<string, unknown>;
    }
  ): Promise<any> {
    let monitorType = params.type.toUpperCase();
    let monitorInput: Record<string, unknown> = {};
    if (params.name !== undefined) monitorInput.name = params.name;
    if (params.uri !== undefined) monitorInput.uri = params.uri;
    if (params.period !== undefined) monitorInput.period = params.period;
    if (params.status !== undefined) monitorInput.status = params.status;
    if (params.locations !== undefined) monitorInput.locations = params.locations;
    if (params.script !== undefined) monitorInput.script = params.script;
    if (params.apdexTarget !== undefined) monitorInput.apdexTarget = params.apdexTarget;
    if (params.advancedOptions !== undefined) monitorInput.advancedOptions = params.advancedOptions;

    if (params.runtimeTypeVersion !== undefined) {
      monitorInput.runtime = {
        ...defaultRuntime(monitorType),
        runtimeTypeVersion: params.runtimeTypeVersion
      };
    }

    if (monitorType === 'SIMPLE_BROWSER' || monitorType === 'SCRIPT_BROWSER') {
      if (params.browsers !== undefined) monitorInput.browsers = params.browsers;
      if (params.devices !== undefined) monitorInput.devices = params.devices;
    }

    let mutationName =
      monitorType === 'SIMPLE_BROWSER'
        ? 'syntheticsUpdateSimpleBrowserMonitor'
        : monitorType === 'SCRIPT_BROWSER'
          ? 'syntheticsUpdateScriptBrowserMonitor'
          : monitorType === 'SCRIPT_API'
            ? 'syntheticsUpdateScriptApiMonitor'
            : 'syntheticsUpdateSimpleMonitor';
    let inputType =
      monitorType === 'SIMPLE_BROWSER'
        ? 'SyntheticsUpdateSimpleBrowserMonitorInput'
        : monitorType === 'SCRIPT_BROWSER'
          ? 'SyntheticsUpdateScriptBrowserMonitorInput'
          : monitorType === 'SCRIPT_API'
            ? 'SyntheticsUpdateScriptApiMonitorInput'
            : 'SyntheticsUpdateSimpleMonitorInput';

    let data = await this.query(
      `mutation($guid: EntityGuid!, $monitor: ${inputType}!) {
        ${mutationName}(guid: $guid, monitor: $monitor) {
          monitor { guid name status period uri locations { public } }
          errors { description type }
        }
      }`,
      { guid: monitorGuid, monitor: monitorInput }
    );

    let result = data?.[mutationName];
    assertNoPayloadErrors('synthetic monitor update', result?.errors);
    return result?.monitor || { guid: monitorGuid };
  }

  async deleteSyntheticMonitor(monitorGuid: string): Promise<any> {
    let data = await this.query(
      `mutation($guid: EntityGuid!) {
        syntheticsDeleteMonitor(guid: $guid) {
          deletedGuid
        }
      }`,
      { guid: monitorGuid }
    );

    return data?.syntheticsDeleteMonitor;
  }

  async createChangeTrackingMarker(params: {
    entityGuid: string;
    version?: string;
    changelog?: string;
    commit?: string;
    description?: string;
    deploymentType?: string;
    deepLink?: string;
    groupId?: string;
    user?: string;
    timestamp?: number;
  }): Promise<any> {
    let deploymentInput: any = {
      entityGuid: params.entityGuid,
      version: params.version || ''
    };
    if (params.changelog) deploymentInput.changelog = params.changelog;
    if (params.commit) deploymentInput.commit = params.commit;
    if (params.description) deploymentInput.description = params.description;
    if (params.deploymentType) deploymentInput.deploymentType = params.deploymentType;
    if (params.deepLink) deploymentInput.deepLink = params.deepLink;
    if (params.groupId) deploymentInput.groupId = params.groupId;
    if (params.user) deploymentInput.user = params.user;
    if (params.timestamp) deploymentInput.timestamp = params.timestamp;

    let data = await this.query(
      `mutation($deployment: ChangeTrackingDeploymentInput!) {
        changeTrackingCreateDeployment(deployment: $deployment) {
          deploymentId entityGuid version changelog commit description deploymentType deepLink groupId user timestamp
        }
      }`,
      { deployment: deploymentInput }
    );

    return data?.changeTrackingCreateDeployment;
  }

  async listAlertIssues(params?: {
    filter?: {
      states?: string[];
      priorities?: string[];
      entityGuids?: string[];
      entityTypes?: string[];
      issueIds?: string[];
    };
    cursor?: string;
  }): Promise<any> {
    let filterInput: any = {};
    if (params?.filter?.states) filterInput.states = params.filter.states;
    if (params?.filter?.priorities) filterInput.priority = params.filter.priorities;
    if (params?.filter?.entityGuids) filterInput.entityGuids = params.filter.entityGuids;
    if (params?.filter?.entityTypes) filterInput.entityTypes = params.filter.entityTypes;
    if (params?.filter?.issueIds) filterInput.ids = params.filter.issueIds;

    let data = await this.query(
      `query($accountId: Int!, $cursor: String, $filter: AiIssuesFilterInput) {
        actor {
          account(id: $accountId) {
            aiIssues {
              issues(cursor: $cursor, filter: $filter) {
                issues {
                  issueId
                  title
                  state
                  priority
                  createdAt
                  activatedAt
                  closedAt
                  acknowledgedAt
                  updatedAt
                  entityGuids
                  entityNames
                  entityTypes
                  sources
                  totalIncidents
                }
                nextCursor
              }
            }
          }
        }
      }`,
      {
        accountId: Number.parseInt(this.accountId, 10),
        cursor: params?.cursor,
        filter: Object.keys(filterInput).length > 0 ? filterInput : undefined
      }
    );

    return data?.actor?.account?.aiIssues?.issues;
  }
}

export class IngestClient {
  private region: Region;
  private accountId: string;
  private licenseKey: string;

  constructor(config: { region: Region; accountId: string; licenseKey: string }) {
    this.region = config.region;
    this.accountId = config.accountId;
    this.licenseKey = config.licenseKey;
  }

  async ingestMetrics(
    metrics: Array<{
      name: string;
      type: string;
      value: number;
      timestamp?: number;
      attributes?: Record<string, any>;
    }>
  ): Promise<any> {
    let http = createAxios({
      baseURL: getMetricIngestUrl(this.region),
      headers: {
        'Api-Key': this.licenseKey,
        'Content-Type': 'application/json'
      }
    });

    let payload = [
      {
        metrics: metrics.map(m => ({
          name: m.name,
          type: m.type,
          value: m.value,
          timestamp: m.timestamp || Math.floor(Date.now() / 1000),
          attributes: m.attributes || {}
        }))
      }
    ];

    try {
      let response = await http.post('', payload);
      return response.data;
    } catch (error) {
      throw newRelicApiError(error, 'metric ingest');
    }
  }

  async ingestEvents(events: Record<string, any>[]): Promise<any> {
    let http = createAxios({
      baseURL: getEventIngestUrl(this.region, this.accountId),
      headers: {
        'Api-Key': this.licenseKey,
        'Content-Type': 'application/json'
      }
    });

    try {
      let response = await http.post('', events);
      return response.data;
    } catch (error) {
      throw newRelicApiError(error, 'event ingest');
    }
  }

  async ingestLogs(
    logs: Array<{
      message: string;
      timestamp?: number;
      attributes?: Record<string, any>;
    }>
  ): Promise<any> {
    let http = createAxios({
      baseURL: getLogIngestUrl(this.region),
      headers: {
        'Api-Key': this.licenseKey,
        'Content-Type': 'application/json'
      }
    });

    let payload = [
      {
        logs: logs.map(l => ({
          message: l.message,
          timestamp: l.timestamp || Date.now(),
          attributes: l.attributes || {}
        }))
      }
    ];

    try {
      let response = await http.post('', payload);
      return response.data;
    } catch (error) {
      throw newRelicApiError(error, 'log ingest');
    }
  }

  async ingestTraces(
    spans: Array<{
      traceId: string;
      spanId: string;
      parentId?: string;
      serviceName: string;
      name: string;
      durationMs: number;
      timestamp?: number;
      attributes?: Record<string, any>;
    }>
  ): Promise<any> {
    let http = createAxios({
      baseURL: getTraceIngestUrl(this.region),
      headers: {
        'Api-Key': this.licenseKey,
        'Content-Type': 'application/json',
        'Data-Format': 'newrelic',
        'Data-Format-Version': '1'
      }
    });

    let payload = [
      {
        spans: spans.map(s => ({
          'trace.id': s.traceId,
          id: s.spanId,
          attributes: {
            'parent.id': s.parentId,
            'service.name': s.serviceName,
            name: s.name,
            'duration.ms': s.durationMs,
            timestamp: s.timestamp || Date.now(),
            ...(s.attributes || {})
          }
        }))
      }
    ];

    try {
      let response = await http.post('', payload);
      return response.data;
    } catch (error) {
      throw newRelicApiError(error, 'trace ingest');
    }
  }
}
