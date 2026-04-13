import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export interface SnowflakeClientConfig {
  accountIdentifier: string;
  token: string;
  tokenType?: string;
}

export interface SqlExecutionOptions {
  statement: string;
  database?: string;
  schema?: string;
  warehouse?: string;
  role?: string;
  timeout?: number;
  bindings?: Record<string, { type: string; value: string }>;
  parameters?: Record<string, any>;
  async?: boolean;
}

export interface StatementResult {
  statementHandle: string;
  statementHandles?: string[];
  code: string;
  message: string;
  createdOn: number;
  statementStatusUrl?: string;
  resultSetMetaData?: {
    numRows: number;
    format: string;
    rowType: Array<{
      name: string;
      type: string;
      length?: number;
      precision?: number;
      scale?: number;
      nullable: boolean;
    }>;
    partitionInfo?: Array<{
      rowCount: number;
      uncompressedSize: number;
    }>;
  };
  data?: string[][];
  stats?: {
    numRowsInserted?: number;
    numRowsUpdated?: number;
    numRowsDeleted?: number;
    numDuplicateRowsUpdated?: number;
  };
}

export interface ListParams {
  like?: string;
  startsWith?: string;
  showLimit?: number;
  fromName?: string;
}

export class SnowflakeClient {
  private http: AxiosInstance;
  private tokenType: string;

  constructor(config: SnowflakeClientConfig) {
    this.tokenType = config.tokenType || 'OAUTH';
    this.http = createAxios({
      baseURL: `https://${config.accountIdentifier}.snowflakecomputing.com`,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Snowflake-Authorization-Token-Type': this.tokenType
      }
    });
  }

  // --- SQL Statement Execution ---

  async executeStatement(options: SqlExecutionOptions): Promise<StatementResult> {
    let body: Record<string, any> = {
      statement: options.statement
    };

    if (options.database) body.database = options.database;
    if (options.schema) body.schema = options.schema;
    if (options.warehouse) body.warehouse = options.warehouse;
    if (options.role) body.role = options.role;
    if (options.timeout !== undefined) body.timeout = options.timeout;
    if (options.bindings) body.bindings = options.bindings;
    if (options.parameters) body.parameters = options.parameters;

    let params: Record<string, string> = {};
    if (options.async) {
      params.async = 'true';
    }

    let response = await this.http.post('/api/v2/statements', body, {
      params,
      validateStatus: (status: number) => status === 200 || status === 202
    });

    return response.data;
  }

  async getStatementStatus(
    statementHandle: string,
    partition?: number
  ): Promise<StatementResult> {
    let params: Record<string, any> = {};
    if (partition !== undefined) {
      params.partition = partition;
    }

    let response = await this.http.get(`/api/v2/statements/${statementHandle}`, {
      params,
      validateStatus: (status: number) => status === 200 || status === 202
    });

    return response.data;
  }

  async cancelStatement(statementHandle: string): Promise<{ code: string; message: string }> {
    let response = await this.http.post(`/api/v2/statements/${statementHandle}/cancel`);
    return response.data;
  }

  // --- Database Management ---

  async listDatabases(params?: ListParams): Promise<any[]> {
    let response = await this.http.get('/api/v2/databases', { params });
    return response.data || [];
  }

  async getDatabase(name: string): Promise<any> {
    let response = await this.http.get(`/api/v2/databases/${encodeURIComponent(name)}`);
    return response.data;
  }

  async createDatabase(body: Record<string, any>, createMode?: string): Promise<any> {
    let params: Record<string, string> = {};
    if (createMode) params.createMode = createMode;

    let response = await this.http.post('/api/v2/databases', body, { params });
    return response.data;
  }

  async deleteDatabase(name: string, ifExists?: boolean): Promise<any> {
    let params: Record<string, any> = {};
    if (ifExists) params.ifExists = true;

    let response = await this.http.delete(`/api/v2/databases/${encodeURIComponent(name)}`, {
      params
    });
    return response.data;
  }

  // --- Schema Management ---

  async listSchemas(database: string, params?: ListParams): Promise<any[]> {
    let response = await this.http.get(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas`,
      { params }
    );
    return response.data || [];
  }

  async getSchema(database: string, name: string): Promise<any> {
    let response = await this.http.get(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(name)}`
    );
    return response.data;
  }

  async createSchema(
    database: string,
    body: Record<string, any>,
    createMode?: string
  ): Promise<any> {
    let params: Record<string, string> = {};
    if (createMode) params.createMode = createMode;

    let response = await this.http.post(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas`,
      body,
      { params }
    );
    return response.data;
  }

  async deleteSchema(database: string, name: string, ifExists?: boolean): Promise<any> {
    let params: Record<string, any> = {};
    if (ifExists) params.ifExists = true;

    let response = await this.http.delete(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(name)}`,
      { params }
    );
    return response.data;
  }

  // --- Table Management ---

  async listTables(database: string, schema: string, params?: ListParams): Promise<any[]> {
    let response = await this.http.get(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tables`,
      { params }
    );
    return response.data || [];
  }

  async getTable(database: string, schema: string, name: string): Promise<any> {
    let response = await this.http.get(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tables/${encodeURIComponent(name)}`
    );
    return response.data;
  }

  async createTable(
    database: string,
    schema: string,
    body: Record<string, any>,
    createMode?: string
  ): Promise<any> {
    let params: Record<string, string> = {};
    if (createMode) params.createMode = createMode;

    let response = await this.http.post(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tables`,
      body,
      { params }
    );
    return response.data;
  }

  async deleteTable(
    database: string,
    schema: string,
    name: string,
    ifExists?: boolean
  ): Promise<any> {
    let params: Record<string, any> = {};
    if (ifExists) params.ifExists = true;

    let response = await this.http.delete(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tables/${encodeURIComponent(name)}`,
      { params }
    );
    return response.data;
  }

  // --- Warehouse Management ---

  async listWarehouses(params?: ListParams): Promise<any[]> {
    let response = await this.http.get('/api/v2/warehouses', { params });
    return response.data || [];
  }

  async getWarehouse(name: string): Promise<any> {
    let response = await this.http.get(`/api/v2/warehouses/${encodeURIComponent(name)}`);
    return response.data;
  }

  async createWarehouse(body: Record<string, any>, createMode?: string): Promise<any> {
    let params: Record<string, string> = {};
    if (createMode) params.createMode = createMode;

    let response = await this.http.post('/api/v2/warehouses', body, { params });
    return response.data;
  }

  async deleteWarehouse(name: string, ifExists?: boolean): Promise<any> {
    let params: Record<string, any> = {};
    if (ifExists) params.ifExists = true;

    let response = await this.http.delete(`/api/v2/warehouses/${encodeURIComponent(name)}`, {
      params
    });
    return response.data;
  }

  async resumeWarehouse(name: string): Promise<any> {
    let response = await this.http.post(
      `/api/v2/warehouses/${encodeURIComponent(name)}:resume`
    );
    return response.data;
  }

  async suspendWarehouse(name: string): Promise<any> {
    let response = await this.http.post(
      `/api/v2/warehouses/${encodeURIComponent(name)}:suspend`
    );
    return response.data;
  }

  async abortWarehouseQueries(name: string): Promise<any> {
    let response = await this.http.post(
      `/api/v2/warehouses/${encodeURIComponent(name)}:abort`
    );
    return response.data;
  }

  // --- User Management ---

  async listUsers(params?: ListParams): Promise<any[]> {
    let response = await this.http.get('/api/v2/users', { params });
    return response.data || [];
  }

  async getUser(name: string): Promise<any> {
    let response = await this.http.get(`/api/v2/users/${encodeURIComponent(name)}`);
    return response.data;
  }

  async createUser(body: Record<string, any>, createMode?: string): Promise<any> {
    let params: Record<string, string> = {};
    if (createMode) params.createMode = createMode;

    let response = await this.http.post('/api/v2/users', body, { params });
    return response.data;
  }

  async deleteUser(name: string, ifExists?: boolean): Promise<any> {
    let params: Record<string, any> = {};
    if (ifExists) params.ifExists = true;

    let response = await this.http.delete(`/api/v2/users/${encodeURIComponent(name)}`, {
      params
    });
    return response.data;
  }

  // --- Role Management ---

  async listRoles(params?: ListParams): Promise<any[]> {
    let response = await this.http.get('/api/v2/roles', { params });
    return response.data || [];
  }

  async getRole(name: string): Promise<any> {
    let response = await this.http.get(`/api/v2/roles/${encodeURIComponent(name)}`);
    return response.data;
  }

  async createRole(body: Record<string, any>, createMode?: string): Promise<any> {
    let params: Record<string, string> = {};
    if (createMode) params.createMode = createMode;

    let response = await this.http.post('/api/v2/roles', body, { params });
    return response.data;
  }

  async deleteRole(name: string, ifExists?: boolean): Promise<any> {
    let params: Record<string, any> = {};
    if (ifExists) params.ifExists = true;

    let response = await this.http.delete(`/api/v2/roles/${encodeURIComponent(name)}`, {
      params
    });
    return response.data;
  }

  // --- Grant Management ---

  async grantPrivileges(body: Record<string, any>): Promise<any> {
    let response = await this.http.post('/api/v2/grants', body);
    return response.data;
  }

  async revokeGrant(body: Record<string, any>): Promise<any> {
    let response = await this.http.post('/api/v2/grants:revoke', body);
    return response.data;
  }

  // --- Task Management ---

  async listTasks(database: string, schema: string, params?: ListParams): Promise<any[]> {
    let response = await this.http.get(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tasks`,
      { params }
    );
    return response.data || [];
  }

  async getTask(database: string, schema: string, name: string): Promise<any> {
    let response = await this.http.get(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tasks/${encodeURIComponent(name)}`
    );
    return response.data;
  }

  async createTask(
    database: string,
    schema: string,
    body: Record<string, any>,
    createMode?: string
  ): Promise<any> {
    let params: Record<string, string> = {};
    if (createMode) params.createMode = createMode;

    let response = await this.http.post(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tasks`,
      body,
      { params }
    );
    return response.data;
  }

  async executeTask(database: string, schema: string, name: string): Promise<any> {
    let response = await this.http.post(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tasks/${encodeURIComponent(name)}:execute`
    );
    return response.data;
  }

  async deleteTask(
    database: string,
    schema: string,
    name: string,
    ifExists?: boolean
  ): Promise<any> {
    let params: Record<string, any> = {};
    if (ifExists) params.ifExists = true;

    let response = await this.http.delete(
      `/api/v2/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tasks/${encodeURIComponent(name)}`,
      { params }
    );
    return response.data;
  }
}
