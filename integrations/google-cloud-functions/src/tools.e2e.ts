import { Buffer } from 'node:buffer';
import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { provider } from './index';

type GoogleCloudFunctionsConfig = {
  region?: string;
};

type GoogleCloudFunctionsFunction = {
  functionName?: string;
  name?: string;
  description?: string;
  location?: string;
  operationName?: string;
};

let sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let crc32Table = (() => {
  let table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 0 ? value >>> 1 : (value >>> 1) ^ 0xedb88320;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

let crc32 = (value: Uint8Array) => {
  let checksum = 0xffffffff;
  for (let byte of value) {
    checksum = (checksum >>> 8) ^ (crc32Table[(checksum ^ byte) & 0xff] ?? 0);
  }
  return (checksum ^ 0xffffffff) >>> 0;
};

let toDosDateTime = (value = new Date()) => ({
  date:
    ((Math.max(value.getUTCFullYear(), 1980) - 1980) << 9) |
    ((value.getUTCMonth() + 1) << 5) |
    value.getUTCDate(),
  time:
    (value.getUTCHours() << 11) |
    (value.getUTCMinutes() << 5) |
    Math.floor(value.getUTCSeconds() / 2)
});

let createZipArchive = (files: Record<string, string>) => {
  let { date, time } = toDosDateTime();
  let localParts: Buffer[] = [];
  let centralParts: Buffer[] = [];
  let offset = 0;

  for (let [path, content] of Object.entries(files)) {
    let pathBytes = Buffer.from(path, 'utf8');
    let data = Buffer.from(content, 'utf8');
    let checksum = crc32(data);

    let localHeader = Buffer.alloc(30 + pathBytes.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(pathBytes.length, 26);
    localHeader.writeUInt16LE(0, 28);
    pathBytes.copy(localHeader, 30);

    let centralHeader = Buffer.alloc(46 + pathBytes.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(pathBytes.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    pathBytes.copy(centralHeader, 46);

    localParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  let centralDirectory = Buffer.concat(centralParts);
  let endOfCentralDirectory = Buffer.alloc(22);
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(centralParts.length, 8);
  endOfCentralDirectory.writeUInt16LE(centralParts.length, 10);
  endOfCentralDirectory.writeUInt32LE(centralDirectory.length, 12);
  endOfCentralDirectory.writeUInt32LE(offset, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endOfCentralDirectory]);
};

let createFunctionArchive = () =>
  createZipArchive({
    'index.js': `exports.helloHttp = (_req, res) => {
  res.status(200).send('ok');
};
`,
    'package.json': JSON.stringify(
      {
        name: 'slates-e2e-function',
        private: true,
        main: 'index.js'
      },
      null,
      2
    )
  });

let getLocation = (ctx: ToolE2EContext) => {
  let config = ctx.profile.config as GoogleCloudFunctionsConfig | null;
  return typeof config?.region === 'string' && config.region.length > 0
    ? config.region
    : 'us-central1';
};

let createFunctionId = (ctx: ToolE2EContext, label: string) => {
  let labelToken =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 6) || 'func';
  let runToken = crc32(Buffer.from(ctx.runId, 'utf8')).toString(16).padStart(8, '0');
  let randomToken = Math.random().toString(36).slice(2, 8);
  let value = `${labelToken}-${runToken}-${randomToken}`;

  if (!/^[a-z]/.test(value)) {
    value = `f-${value}`;
  }

  while (value.length < 4) {
    value = `${value}x`;
  }

  return value;
};

let uploadFunctionArchive = async (uploadUrl: string) => {
  let response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/zip'
    },
    body: createFunctionArchive()
  });

  if (!response.ok) {
    throw new Error(
      `Source upload failed with ${response.status}: ${await response.text()}`
    );
  }
};

let waitForOperation = async (
  ctx: ToolE2EContext,
  operationName: string,
  label: string
) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    let result = await ctx.invokeTool('get_operation', { operationName });
    if (result.output.done) {
      let errorMessage = result.output.error?.message;
      if (errorMessage) {
        throw new Error(`${label} failed: ${errorMessage}`);
      }
      return result.output;
    }

    await sleep(5000);
  }

  throw new Error(`Timed out waiting for ${label}.`);
};

let waitForFunction = async (
  ctx: ToolE2EContext,
  functionName: string,
  location: string
) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      return await ctx.invokeTool('get_function', { functionName, location });
    } catch (error) {
      if (attempt === 29) {
        throw error;
      }
      await sleep(2000);
    }
  }

  throw new Error(`Timed out waiting for function ${functionName}.`);
};

let isCreateNameConflict = (error: unknown) => {
  let message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Cloud Run service with this name already exists') ||
    message.includes('already exists. Please redeploy the function with a different name')
  );
};

let createFunctionResource = async (
  ctx: ToolE2EContext,
  label: string
): Promise<GoogleCloudFunctionsFunction> => {
  let location = getLocation(ctx);
  let description = ctx.namespaced(label);
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let functionName = createFunctionId(ctx, label);
    let upload = await ctx.invokeTool('generate_upload_url', {
      location,
      environment: 'GEN_2'
    });

    let sourceStorageBucket = upload.output.storageSource?.bucket;
    let sourceStorageObject = upload.output.storageSource?.object;
    if (!sourceStorageBucket || !sourceStorageObject) {
      throw new Error('generate_upload_url did not return a storage source.');
    }

    await uploadFunctionArchive(String(upload.output.uploadUrl));

    try {
      let created = await ctx.invokeTool('create_function', {
        functionId: functionName,
        location,
        description,
        environment: 'GEN_2',
        runtime: 'nodejs20',
        entryPoint: 'helloHttp',
        sourceStorageBucket,
        sourceStorageObject
      });

      await waitForOperation(
        ctx,
        String(created.output.operationName),
        `create ${functionName}`
      );
      let details = await waitForFunction(ctx, functionName, location);

      return {
        ...details.output,
        location,
        operationName: String(created.output.operationName)
      };
    } catch (error) {
      lastError = error;
      if (!isCreateNameConflict(error) || attempt === 2) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Function creation failed for an unknown reason.');
};

let cleanupFunctionResource = async (
  ctx: ToolE2EContext,
  value: Record<string, any>
) => {
  if (typeof value.functionName !== 'string' || value.functionName.length === 0) {
    return;
  }

  try {
    let deleted = await ctx.invokeTool('delete_function', {
      functionName: value.functionName,
      location: typeof value.location === 'string' ? value.location : undefined
    });
    await waitForOperation(ctx, String(deleted.output.operationName), `delete ${value.functionName}`);
  } catch (error) {
    let message = error instanceof Error ? error.message : String(error);
    if (message.includes('404') || message.includes('NOT_FOUND')) {
      return;
    }
    throw error;
  }
};

export let googleCloudFunctionsToolE2E = defineSlateToolE2EIntegration({
  beforeSuite: async ctx => {
    if (typeof ctx.auth.token !== 'string' || ctx.auth.token.length === 0) {
      throw new Error(
        'The selected profile must include a Google Cloud access token for Cloud Functions live E2E.'
      );
    }
  },
  resources: {
    function: {
      create: async ctx => await createFunctionResource(ctx, 'function'),
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          await cleanupFunctionResource(ctx, value);
        }
      }
    },
    created_function: {
      create: async ctx => await createFunctionResource(ctx, 'create-function'),
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          await cleanupFunctionResource(ctx, value);
        }
      }
    }
  },
  scenarioOverrides: {
    create_function: {
      name: 'create_function deploys a disposable function',
      use: ['created_function'],
      run: async () => {}
    },
    generate_upload_url: {
      name: 'generate_upload_url returns a storage-backed upload target',
      run: async ctx => {
        let result = await ctx.invokeTool('generate_upload_url', {
          location: getLocation(ctx),
          environment: 'GEN_2'
        });

        if (!result.output.uploadUrl.startsWith('https://')) {
          throw new Error('generate_upload_url did not return an HTTPS upload URL.');
        }

        if (
          !result.output.storageSource?.bucket ||
          !result.output.storageSource?.object
        ) {
          throw new Error('generate_upload_url did not return a usable storage source.');
        }
      }
    },
    generate_download_url: {
      name: 'generate_download_url returns a source download URL for the function',
      use: ['function'],
      run: async ctx => {
        let fn = ctx.resource('function');
        let result = await ctx.invokeTool('generate_download_url', {
          functionName: String(fn.functionName),
          location: String(fn.location)
        });

        if (!result.output.downloadUrl.startsWith('https://')) {
          throw new Error('generate_download_url did not return an HTTPS download URL.');
        }
      }
    },
    manage_iam_policy: {
      name: 'manage_iam_policy gets and sets the current policy',
      use: ['function'],
      run: async ctx => {
        let fn = ctx.resource('function');
        let current = await ctx.invokeTool('manage_iam_policy', {
          action: 'get',
          functionName: String(fn.functionName),
          location: String(fn.location)
        });

        let updated = await ctx.invokeTool('manage_iam_policy', {
          action: 'set',
          functionName: String(fn.functionName),
          location: String(fn.location),
          bindings: current.output.bindings,
          etag: current.output.etag
        });

        if (!Array.isArray(updated.output.bindings)) {
          throw new Error('manage_iam_policy did not return bindings after set.');
        }
      }
    },
    get_operation: {
      name: 'get_operation returns the create operation for the function',
      use: ['function'],
      run: async ctx => {
        let fn = ctx.resource('function');
        await ctx.invokeTool('get_operation', {
          operationName: String(fn.operationName)
        });
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleCloudFunctionsToolE2E,
  timeoutMs: 10 * 60 * 1000
});
