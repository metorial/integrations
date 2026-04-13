import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { clientFromContext } from '../lib/helpers';

let functionSummarySchema = z.object({
  functionName: z.string().optional().describe('Name of the function'),
  functionArn: z.string().optional().describe('ARN of the function'),
  runtime: z.string().optional().describe('Runtime environment (e.g., nodejs22.x, python3.13)'),
  role: z.string().optional().describe('Execution role ARN'),
  handler: z.string().optional().describe('Function handler (e.g., index.handler)'),
  codeSize: z.number().optional().describe('Size of the deployment package in bytes'),
  description: z.string().optional().describe('Function description'),
  timeout: z.number().optional().describe('Execution timeout in seconds'),
  memorySize: z.number().optional().describe('Memory allocated in MB'),
  lastModified: z.string().optional().describe('Last modified timestamp'),
  version: z.string().optional().describe('Function version'),
  state: z.string().optional().describe('Current state of the function'),
  packageType: z.string().optional().describe('Deployment package type (Zip or Image)'),
  architectures: z.array(z.string()).optional().describe('Instruction set architectures'),
});

let functionDetailSchema = functionSummarySchema.extend({
  codeSha256: z.string().optional().describe('SHA256 hash of the deployment package'),
  stateReason: z.string().optional().describe('Reason for current state'),
  environment: z.record(z.string(), z.string()).optional().describe('Environment variables'),
  layers: z.array(z.object({
    arn: z.string().optional().describe('Layer version ARN'),
    codeSize: z.number().optional().describe('Size of the layer in bytes'),
  })).optional().describe('Attached layers'),
  codeLocation: z.string().optional().describe('Pre-signed URL to download the deployment package'),
  reservedConcurrency: z.number().optional().describe('Reserved concurrent executions'),
  tags: z.record(z.string(), z.string()).optional().describe('Resource tags'),
  ephemeralStorageSize: z.number().optional().describe('Ephemeral /tmp storage size in MB'),
  loggingFormat: z.string().optional().describe('Log format (Text or JSON)'),
  tracingMode: z.string().optional().describe('X-Ray tracing mode (Active or PassThrough)'),
  vpcId: z.string().optional().describe('VPC ID if configured'),
  subnetIds: z.array(z.string()).optional().describe('VPC subnet IDs'),
  securityGroupIds: z.array(z.string()).optional().describe('VPC security group IDs'),
});

export let manageLambdaTool = SlateTool.create(
  spec,
  {
    name: 'Manage Lambda',
    key: 'manage_lambda',
    description: `Manage AWS Lambda functions: list functions, get details, invoke a function with a JSON payload, update configuration (memory, timeout, environment variables, layers, VPC, tracing), or delete a function. Set the **operation** field to choose the action.`,
    instructions: [
      'Set "operation" to one of: "list", "get", "invoke", "updateConfiguration", or "delete".',
      'For "list": optionally provide "maxItems" and "marker" for pagination.',
      'For "get": provide "functionName" and optionally "qualifier" (version or alias).',
      'For "invoke": provide "functionName" and optionally "payload", "invocationType", and "logType".',
      'For "updateConfiguration": provide "functionName" and the configuration fields to change. Environment variables replace the entire set.',
      'For "delete": provide "functionName" and optionally "qualifier" to delete a specific version.',
    ],
  }
)
  .input(z.object({
    operation: z.enum(['list', 'get', 'invoke', 'updateConfiguration', 'delete']).describe('The operation to perform on Lambda functions'),

    // Common
    functionName: z.string().optional().describe('Function name, ARN, or partial ARN (required for get, invoke, updateConfiguration, delete)'),
    qualifier: z.string().optional().describe('Version number or alias name (used with get, invoke, delete)'),

    // List
    maxItems: z.number().optional().describe('Maximum number of functions to return when listing (1-10000)'),
    marker: z.string().optional().describe('Pagination token from a previous list response'),

    // Invoke
    payload: z.any().optional().describe('JSON payload to send when invoking the function'),
    invocationType: z.enum(['RequestResponse', 'Event', 'DryRun']).optional().describe('Invocation type: RequestResponse (sync, default), Event (async), or DryRun (validate only)'),
    logType: z.enum(['None', 'Tail']).optional().describe('Set to "Tail" to include the last 4KB of execution logs in the invoke response'),

    // Update configuration
    configuration: z.object({
      role: z.string().optional().describe('New execution role ARN'),
      runtime: z.string().optional().describe('New runtime (e.g., nodejs22.x, python3.13)'),
      handler: z.string().optional().describe('New handler (e.g., index.handler)'),
      description: z.string().optional().describe('New function description'),
      timeout: z.number().optional().describe('New execution timeout in seconds (1-900)'),
      memorySize: z.number().optional().describe('New memory allocation in MB (128-10240)'),
      environment: z.record(z.string(), z.string()).optional().describe('New environment variables (replaces all existing variables)'),
      layers: z.array(z.string()).optional().describe('New layer version ARNs (replaces all existing layers)'),
      ephemeralStorageSize: z.number().optional().describe('New /tmp storage size in MB (512-10240)'),
      tracingMode: z.enum(['Active', 'PassThrough']).optional().describe('X-Ray tracing mode'),
      vpcSubnetIds: z.array(z.string()).optional().describe('VPC subnet IDs (provide empty array to remove VPC)'),
      vpcSecurityGroupIds: z.array(z.string()).optional().describe('VPC security group IDs'),
    }).optional().describe('Configuration fields to update (only for updateConfiguration operation)'),
  }))
  .output(z.object({
    operation: z.string().describe('The operation that was performed'),

    // List results
    functions: z.array(functionSummarySchema).optional().describe('List of Lambda functions (list operation)'),
    nextMarker: z.string().optional().describe('Pagination token for the next page (list operation)'),

    // Get results
    functionDetail: functionDetailSchema.optional().describe('Detailed function information (get operation)'),

    // Invoke results
    statusCode: z.number().optional().describe('HTTP status code from invocation (200=sync, 202=async, 204=dry run)'),
    response: z.any().optional().describe('Function response payload (invoke operation, synchronous only)'),
    functionError: z.string().optional().describe('Error type if the function returned an error (invoke operation)'),
    executedVersion: z.string().optional().describe('Version that was executed (invoke operation)'),
    logResult: z.string().optional().describe('Last 4KB of execution log when logType is Tail (invoke operation)'),

    // Update results
    updatedConfiguration: functionSummarySchema.optional().describe('Updated function configuration (updateConfiguration operation)'),

    // Delete results
    deleted: z.boolean().optional().describe('Whether the function was successfully deleted (delete operation)'),
  }))
  .handleInvocation(async (ctx) => {
    let client = clientFromContext(ctx);
    let { operation } = ctx.input;

    // ── List functions ──
    if (operation === 'list') {
      let params: Record<string, string> = {};
      if (ctx.input.maxItems !== undefined) params['MaxItems'] = String(ctx.input.maxItems);
      if (ctx.input.marker) params['Marker'] = ctx.input.marker;

      let result = await client.request({
        service: 'lambda',
        method: 'GET',
        path: '/2015-03-31/functions',
        params,
        headers: { 'Content-Type': 'application/json' },
      });

      let functions = (result.Functions || []).map((f: any) => ({
        functionName: f.FunctionName,
        functionArn: f.FunctionArn,
        runtime: f.Runtime,
        role: f.Role,
        handler: f.Handler,
        codeSize: f.CodeSize,
        description: f.Description,
        timeout: f.Timeout,
        memorySize: f.MemorySize,
        lastModified: f.LastModified,
        version: f.Version,
        state: f.State,
        packageType: f.PackageType,
        architectures: f.Architectures,
      }));

      return {
        output: {
          operation: 'list',
          functions,
          nextMarker: result.NextMarker,
        },
        message: `Found **${functions.length}** Lambda function(s)${result.NextMarker ? ' (more available)' : ''}.`,
      };
    }

    // ── Validate functionName for remaining operations ──
    if (!ctx.input.functionName) {
      throw new Error(`The "functionName" field is required for the "${operation}" operation.`);
    }

    let encodedName = encodeURIComponent(ctx.input.functionName);

    // ── Get function ──
    if (operation === 'get') {
      let path = `/2015-03-31/functions/${encodedName}`;
      if (ctx.input.qualifier) {
        path += `?Qualifier=${encodeURIComponent(ctx.input.qualifier)}`;
      }

      let result = await client.request({
        service: 'lambda',
        method: 'GET',
        path,
        headers: { 'Content-Type': 'application/json' },
      });

      let config = result.Configuration || {};
      let layers = (config.Layers || []).map((l: any) => ({
        arn: l.Arn,
        codeSize: l.CodeSize,
      }));

      let detail = {
        functionName: config.FunctionName,
        functionArn: config.FunctionArn,
        runtime: config.Runtime,
        role: config.Role,
        handler: config.Handler,
        codeSize: config.CodeSize,
        codeSha256: config.CodeSha256,
        description: config.Description,
        timeout: config.Timeout,
        memorySize: config.MemorySize,
        lastModified: config.LastModified,
        version: config.Version,
        state: config.State,
        stateReason: config.StateReason,
        packageType: config.PackageType,
        architectures: config.Architectures,
        environment: config.Environment?.Variables,
        layers,
        codeLocation: result.Code?.Location,
        reservedConcurrency: result.Concurrency?.ReservedConcurrentExecutions,
        tags: result.Tags,
        ephemeralStorageSize: config.EphemeralStorage?.Size,
        loggingFormat: config.LoggingConfig?.LogFormat,
        tracingMode: config.TracingConfig?.Mode,
        vpcId: config.VpcConfig?.VpcId,
        subnetIds: config.VpcConfig?.SubnetIds,
        securityGroupIds: config.VpcConfig?.SecurityGroupIds,
      };

      return {
        output: {
          operation: 'get',
          functionDetail: detail,
        },
        message: `Retrieved function **${config.FunctionName}** (${config.Runtime || config.PackageType || 'unknown'}, ${config.State || 'Active'}).`,
      };
    }

    // ── Invoke function ──
    if (operation === 'invoke') {
      let path = `/2015-03-31/functions/${encodedName}/invocations`;
      if (ctx.input.qualifier) {
        path += `?Qualifier=${encodeURIComponent(ctx.input.qualifier)}`;
      }

      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (ctx.input.invocationType) {
        headers['X-Amz-Invocation-Type'] = ctx.input.invocationType;
      }
      if (ctx.input.logType) {
        headers['X-Amz-Log-Type'] = ctx.input.logType;
      }

      let body = ctx.input.payload !== undefined ? JSON.stringify(ctx.input.payload) : undefined;

      let result = await client.request({
        service: 'lambda',
        method: 'POST',
        path,
        body,
        headers,
      });

      let invType = ctx.input.invocationType || 'RequestResponse';
      let msg = invType === 'Event'
        ? `Function **${ctx.input.functionName}** invoked asynchronously.`
        : invType === 'DryRun'
          ? `Dry run completed for **${ctx.input.functionName}** -- permissions validated.`
          : `Function **${ctx.input.functionName}** invoked successfully.`;

      // Parse response: Lambda returns the payload directly for sync invocations
      let responsePayload = result;
      let functionError: string | undefined;
      let executedVersion: string | undefined;
      let logResultValue: string | undefined;
      let statusCode: number | undefined;

      // If the result is an object with metadata fields, extract them
      if (result && typeof result === 'object') {
        functionError = result.FunctionError;
        executedVersion = result.ExecutedVersion;
        logResultValue = result.LogResult;
        statusCode = result.StatusCode;
      }

      return {
        output: {
          operation: 'invoke',
          statusCode,
          response: responsePayload,
          functionError,
          executedVersion,
          logResult: logResultValue,
        },
        message: msg,
      };
    }

    // ── Update function configuration ──
    if (operation === 'updateConfiguration') {
      if (!ctx.input.configuration) {
        throw new Error('The "configuration" field is required for the "updateConfiguration" operation.');
      }

      let cfg = ctx.input.configuration;
      let configBody: Record<string, any> = {};

      if (cfg.role) configBody['Role'] = cfg.role;
      if (cfg.runtime) configBody['Runtime'] = cfg.runtime;
      if (cfg.handler) configBody['Handler'] = cfg.handler;
      if (cfg.description !== undefined) configBody['Description'] = cfg.description;
      if (cfg.timeout !== undefined) configBody['Timeout'] = cfg.timeout;
      if (cfg.memorySize !== undefined) configBody['MemorySize'] = cfg.memorySize;
      if (cfg.environment) configBody['Environment'] = { Variables: cfg.environment };
      if (cfg.layers) configBody['Layers'] = cfg.layers;
      if (cfg.ephemeralStorageSize !== undefined) configBody['EphemeralStorage'] = { Size: cfg.ephemeralStorageSize };
      if (cfg.tracingMode) configBody['TracingConfig'] = { Mode: cfg.tracingMode };
      if (cfg.vpcSubnetIds || cfg.vpcSecurityGroupIds) {
        configBody['VpcConfig'] = {
          SubnetIds: cfg.vpcSubnetIds || [],
          SecurityGroupIds: cfg.vpcSecurityGroupIds || [],
        };
      }

      if (Object.keys(configBody).length === 0) {
        throw new Error('At least one configuration field must be provided to update.');
      }

      let result = await client.request({
        service: 'lambda',
        method: 'PUT',
        path: `/2015-03-31/functions/${encodedName}/configuration`,
        body: JSON.stringify(configBody),
        headers: { 'Content-Type': 'application/json' },
      });

      let updatedFields = Object.keys(cfg).filter((k) => (cfg as any)[k] !== undefined);

      return {
        output: {
          operation: 'updateConfiguration',
          updatedConfiguration: {
            functionName: result.FunctionName,
            functionArn: result.FunctionArn,
            runtime: result.Runtime,
            role: result.Role,
            handler: result.Handler,
            codeSize: result.CodeSize,
            description: result.Description,
            timeout: result.Timeout,
            memorySize: result.MemorySize,
            lastModified: result.LastModified,
            version: result.Version,
            state: result.State,
            packageType: result.PackageType,
            architectures: result.Architectures,
          },
        },
        message: `Updated **${updatedFields.length}** configuration field(s) for function **${result.FunctionName || ctx.input.functionName}**: ${updatedFields.join(', ')}.`,
      };
    }

    // ── Delete function ──
    if (operation === 'delete') {
      let path = `/2015-03-31/functions/${encodedName}`;
      if (ctx.input.qualifier) {
        path += `?Qualifier=${encodeURIComponent(ctx.input.qualifier)}`;
      }

      await client.request({
        service: 'lambda',
        method: 'DELETE',
        path,
        headers: { 'Content-Type': 'application/json' },
      });

      let msg = ctx.input.qualifier
        ? `Deleted version **${ctx.input.qualifier}** of function **${ctx.input.functionName}**.`
        : `Deleted function **${ctx.input.functionName}** and all its versions/aliases.`;

      return {
        output: {
          operation: 'delete',
          deleted: true,
        },
        message: msg,
      };
    }

    throw new Error(`Unknown operation: "${operation}". Expected one of: list, get, invoke, updateConfiguration, delete.`);
  })
  .build();
