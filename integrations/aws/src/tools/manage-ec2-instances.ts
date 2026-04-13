import { SlateTool } from 'slates';
import { spec } from '../spec';
import { z } from 'zod';
import { clientFromContext, flattenList } from '../lib/helpers';
import { extractXmlValue, extractXmlBlocks } from '../lib/xml';

let EC2_VERSION = '2016-11-15';
let EC2_SERVICE = 'ec2';

let tagSchema = z.object({
  key: z.string().describe('Tag key'),
  value: z.string().describe('Tag value'),
});

let instanceSchema = z.object({
  instanceId: z.string().describe('EC2 instance ID (e.g., i-0abcd1234efgh5678)'),
  instanceType: z.string().optional().describe('Instance type (e.g., t3.micro, m5.large)'),
  state: z.string().optional().describe('Current instance state (pending, running, shutting-down, terminated, stopping, stopped)'),
  stateCode: z.number().optional().describe('Numeric state code (0=pending, 16=running, 32=shutting-down, 48=terminated, 64=stopping, 80=stopped)'),
  publicIpAddress: z.string().optional().describe('Public IPv4 address, if assigned'),
  privateIpAddress: z.string().optional().describe('Private IPv4 address'),
  publicDnsName: z.string().optional().describe('Public DNS hostname'),
  privateDnsName: z.string().optional().describe('Private DNS hostname'),
  vpcId: z.string().optional().describe('VPC ID the instance is running in'),
  subnetId: z.string().optional().describe('Subnet ID the instance is running in'),
  availabilityZone: z.string().optional().describe('Availability zone (e.g., us-east-1a)'),
  imageId: z.string().optional().describe('AMI ID used to launch the instance'),
  keyName: z.string().optional().describe('Name of the key pair used at launch'),
  launchTime: z.string().optional().describe('Timestamp when the instance was launched'),
  platform: z.string().optional().describe('Platform (windows or empty for Linux)'),
  architecture: z.string().optional().describe('Instance architecture (x86_64, arm64)'),
  securityGroups: z.array(z.object({
    groupId: z.string().describe('Security group ID'),
    groupName: z.string().describe('Security group name'),
  })).optional().describe('Security groups attached to the instance'),
  tags: z.array(tagSchema).optional().describe('Tags assigned to the instance'),
  iamInstanceProfile: z.string().optional().describe('ARN of the IAM instance profile'),
  ebsOptimized: z.boolean().optional().describe('Whether the instance is EBS-optimized'),
});

let actionResultSchema = z.object({
  instanceId: z.string().describe('EC2 instance ID'),
  previousState: z.string().optional().describe('State before the action'),
  currentState: z.string().optional().describe('State after the action'),
});

let parseInstance = (instanceBlock: string): z.infer<typeof instanceSchema> => {
  let instanceId = extractXmlValue(instanceBlock, 'instanceId') ?? '';
  let instanceType = extractXmlValue(instanceBlock, 'instanceType');
  let imageId = extractXmlValue(instanceBlock, 'imageId');
  let keyName = extractXmlValue(instanceBlock, 'keyName');
  let launchTime = extractXmlValue(instanceBlock, 'launchTime');
  let platform = extractXmlValue(instanceBlock, 'platform');
  let architecture = extractXmlValue(instanceBlock, 'architecture');
  let privateDnsName = extractXmlValue(instanceBlock, 'privateDnsName');
  let publicDnsName = extractXmlValue(instanceBlock, 'dnsName');
  let privateIpAddress = extractXmlValue(instanceBlock, 'privateIpAddress');
  let publicIpAddress = extractXmlValue(instanceBlock, 'ipAddress');
  let vpcId = extractXmlValue(instanceBlock, 'vpcId');
  let subnetId = extractXmlValue(instanceBlock, 'subnetId');
  let ebsOptimizedStr = extractXmlValue(instanceBlock, 'ebsOptimized');

  // Parse instance state
  let stateBlock = extractXmlBlocks(instanceBlock, 'instanceState')[0];
  let stateName = stateBlock ? extractXmlValue(stateBlock, 'name') : undefined;
  let stateCodeStr = stateBlock ? extractXmlValue(stateBlock, 'code') : undefined;
  let stateCode = stateCodeStr ? parseInt(stateCodeStr, 10) : undefined;

  // Parse placement for availability zone
  let placementBlock = extractXmlBlocks(instanceBlock, 'placement')[0];
  let availabilityZone = placementBlock ? extractXmlValue(placementBlock, 'availabilityZone') : undefined;

  // Parse security groups
  let securityGroups: { groupId: string; groupName: string }[] = [];
  // Security groups are inside <groupSet><item>...</item></groupSet>
  let groupSetBlock = extractXmlBlocks(instanceBlock, 'groupSet')[0];
  if (groupSetBlock) {
    let sgItems = extractXmlBlocks(groupSetBlock, 'item');
    securityGroups = sgItems
      .filter((item) => extractXmlValue(item, 'groupId'))
      .map((item) => ({
        groupId: extractXmlValue(item, 'groupId') ?? '',
        groupName: extractXmlValue(item, 'groupName') ?? '',
      }));
  }

  // Parse tags
  let tags: { key: string; value: string }[] = [];
  let tagSetBlock = extractXmlBlocks(instanceBlock, 'tagSet')[0];
  if (tagSetBlock) {
    let tagItems = extractXmlBlocks(tagSetBlock, 'item');
    tags = tagItems
      .filter((item) => extractXmlValue(item, 'key'))
      .map((item) => ({
        key: extractXmlValue(item, 'key') ?? '',
        value: extractXmlValue(item, 'value') ?? '',
      }));
  }

  // Parse IAM instance profile
  let iamBlock = extractXmlBlocks(instanceBlock, 'iamInstanceProfile')[0];
  let iamInstanceProfile = iamBlock ? extractXmlValue(iamBlock, 'arn') : undefined;

  return {
    instanceId,
    instanceType,
    state: stateName,
    stateCode,
    publicIpAddress,
    privateIpAddress,
    publicDnsName: publicDnsName || undefined,
    privateDnsName: privateDnsName || undefined,
    vpcId,
    subnetId,
    availabilityZone,
    imageId,
    keyName: keyName || undefined,
    launchTime,
    platform,
    architecture,
    securityGroups: securityGroups.length > 0 ? securityGroups : undefined,
    tags: tags.length > 0 ? tags : undefined,
    iamInstanceProfile,
    ebsOptimized: ebsOptimizedStr ? ebsOptimizedStr === 'true' : undefined,
  };
};

let parseStateChange = (itemBlock: string): z.infer<typeof actionResultSchema> => {
  let instanceId = extractXmlValue(itemBlock, 'instanceId') ?? '';

  let previousStateBlock = extractXmlBlocks(itemBlock, 'previousState')[0];
  let previousState = previousStateBlock ? extractXmlValue(previousStateBlock, 'name') : undefined;

  let currentStateBlock = extractXmlBlocks(itemBlock, 'currentState')[0];
  let currentState = currentStateBlock ? extractXmlValue(currentStateBlock, 'name') : undefined;

  return { instanceId, previousState, currentState };
};

export let manageEc2InstancesTool = SlateTool.create(
  spec,
  {
    name: 'Manage EC2 Instances',
    key: 'manage_ec2_instances',
    description: `List, start, stop, terminate, or reboot Amazon EC2 instances. Use the list operation to discover instances with filtering by IDs, states, or tags. Use action operations to control instance lifecycle.`,
    instructions: [
      'To **list** instances, set operation to "list". Optionally filter by instanceIds, states, or tagFilters.',
      'To **start** stopped instances, set operation to "start" and provide instanceIds.',
      'To **stop** running instances, set operation to "stop" and provide instanceIds. Use force to force stop if needed.',
      'To **terminate** instances permanently, set operation to "terminate" and provide instanceIds. This is irreversible.',
      'To **reboot** instances, set operation to "reboot" and provide instanceIds.',
      'The list operation supports pagination via nextToken and maxResults.',
      'Tag filters use the format { key: "Name", value: "my-server" } and match instances where the tag key has the given value.',
    ],
    constraints: [
      'Terminate is irreversible — all data on instance store volumes is lost.',
      'You can only start instances that are in the "stopped" state.',
      'You can only stop instances that are in the "running" state.',
      'You can list up to 1000 instances per request.',
    ],
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    operation: z.enum(['list', 'start', 'stop', 'terminate', 'reboot']).describe('The EC2 instance operation to perform'),
    instanceIds: z.array(z.string()).optional().describe('Instance IDs to target (required for start, stop, terminate, reboot; optional filter for list)'),
    states: z.array(z.enum([
      'pending',
      'running',
      'shutting-down',
      'terminated',
      'stopping',
      'stopped',
    ])).optional().describe('Filter instances by state (only for list operation)'),
    tagFilters: z.array(z.object({
      key: z.string().describe('Tag key to filter on'),
      value: z.string().describe('Tag value to match'),
    })).optional().describe('Filter instances by tags (only for list operation)'),
    maxResults: z.number().optional().describe('Maximum number of results to return for list operation (5-1000)'),
    nextToken: z.string().optional().describe('Pagination token from a previous list request'),
    force: z.boolean().optional().describe('Force stop the instance without waiting for graceful shutdown (only for stop operation)'),
    hibernate: z.boolean().optional().describe('Hibernate the instance instead of stopping it (only for stop operation, instance must support hibernation)'),
    additionalFilters: z.array(z.object({
      name: z.string().describe('Filter name (e.g., "vpc-id", "instance-type", "availability-zone")'),
      values: z.array(z.string()).describe('Filter values to match'),
    })).optional().describe('Additional EC2 API filters for the list operation (e.g., vpc-id, instance-type, availability-zone)'),
  }))
  .output(z.object({
    instances: z.array(instanceSchema).optional().describe('List of instances returned by the list operation'),
    actionResults: z.array(actionResultSchema).optional().describe('State change results for start, stop, terminate, or reboot operations'),
    nextToken: z.string().optional().describe('Pagination token for retrieving the next page of list results'),
    totalCount: z.number().optional().describe('Number of instances or results returned'),
  }))
  .handleInvocation(async (ctx) => {
    let client = clientFromContext(ctx);
    let { operation, instanceIds, states, tagFilters, maxResults, nextToken, force, hibernate, additionalFilters } = ctx.input;

    if (operation === 'list') {
      let params: Record<string, string> = {};

      // Add instance ID filters
      if (instanceIds && instanceIds.length > 0) {
        Object.assign(params, flattenList('InstanceId', instanceIds));
      }

      // Build filters
      let filterIndex = 1;

      // State filter
      if (states && states.length > 0) {
        params[`Filter.${filterIndex}.Name`] = 'instance-state-name';
        states.forEach((state, i) => {
          params[`Filter.${filterIndex}.Value.${i + 1}`] = state;
        });
        filterIndex++;
      }

      // Tag filters
      if (tagFilters && tagFilters.length > 0) {
        tagFilters.forEach((tag) => {
          params[`Filter.${filterIndex}.Name`] = `tag:${tag.key}`;
          params[`Filter.${filterIndex}.Value.1`] = tag.value;
          filterIndex++;
        });
      }

      // Additional filters
      if (additionalFilters && additionalFilters.length > 0) {
        additionalFilters.forEach((filter) => {
          params[`Filter.${filterIndex}.Name`] = filter.name;
          filter.values.forEach((value, i) => {
            params[`Filter.${filterIndex}.Value.${i + 1}`] = value;
          });
          filterIndex++;
        });
      }

      // Pagination
      if (maxResults) {
        params['MaxResults'] = String(maxResults);
      }
      if (nextToken) {
        params['NextToken'] = nextToken;
      }

      let response = await client.queryApi({
        service: EC2_SERVICE,
        action: 'DescribeInstances',
        params,
        version: EC2_VERSION,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let instances: z.infer<typeof instanceSchema>[] = [];

      // DescribeInstances wraps results in <reservationSet><item> which contains <instancesSet><item>
      let reservationSetBlock = extractXmlBlocks(xml, 'reservationSet')[0];
      if (reservationSetBlock) {
        let reservations = extractXmlBlocks(reservationSetBlock, 'item');
        reservations.forEach((reservation) => {
          let instancesSetBlock = extractXmlBlocks(reservation, 'instancesSet')[0];
          if (instancesSetBlock) {
            let instanceItems = extractXmlBlocks(instancesSetBlock, 'item');
            instanceItems.forEach((instanceBlock) => {
              instances.push(parseInstance(instanceBlock));
            });
          }
        });
      }

      let responseNextToken = extractXmlValue(xml, 'nextToken');

      let countMsg = instances.length === 0 ? 'No instances found' : `Found **${instances.length}** instance(s)`;
      let filterMsg = '';
      if (states && states.length > 0) {
        filterMsg += ` in state(s): ${states.join(', ')}`;
      }
      if (tagFilters && tagFilters.length > 0) {
        filterMsg += ` matching ${tagFilters.length} tag filter(s)`;
      }
      let paginationMsg = responseNextToken ? ' (more results available)' : '';

      return {
        output: {
          instances,
          nextToken: responseNextToken,
          totalCount: instances.length,
        },
        message: `${countMsg}${filterMsg}${paginationMsg}`,
      };
    }

    // Action operations require instanceIds
    if (!instanceIds || instanceIds.length === 0) {
      throw new Error(`instanceIds are required for the "${operation}" operation`);
    }

    let instanceIdParams = flattenList('InstanceId', instanceIds);

    if (operation === 'start') {
      let response = await client.postQueryApi({
        service: EC2_SERVICE,
        action: 'StartInstances',
        params: instanceIdParams,
        version: EC2_VERSION,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let itemBlocks = extractXmlBlocks(xml, 'item');
      let actionResults = itemBlocks.map(parseStateChange).filter((r) => r.instanceId);

      return {
        output: {
          actionResults,
          totalCount: actionResults.length,
        },
        message: `Started **${actionResults.length}** instance(s): ${instanceIds.join(', ')}`,
      };
    }

    if (operation === 'stop') {
      let params: Record<string, string> = { ...instanceIdParams };
      if (force) {
        params['Force'] = 'true';
      }
      if (hibernate) {
        params['Hibernate'] = 'true';
      }

      let response = await client.postQueryApi({
        service: EC2_SERVICE,
        action: 'StopInstances',
        params,
        version: EC2_VERSION,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let itemBlocks = extractXmlBlocks(xml, 'item');
      let actionResults = itemBlocks.map(parseStateChange).filter((r) => r.instanceId);

      let extraMsg = force ? ' (forced)' : '';
      extraMsg += hibernate ? ' (hibernate)' : '';

      return {
        output: {
          actionResults,
          totalCount: actionResults.length,
        },
        message: `Stopped **${actionResults.length}** instance(s)${extraMsg}: ${instanceIds.join(', ')}`,
      };
    }

    if (operation === 'terminate') {
      let response = await client.postQueryApi({
        service: EC2_SERVICE,
        action: 'TerminateInstances',
        params: instanceIdParams,
        version: EC2_VERSION,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let itemBlocks = extractXmlBlocks(xml, 'item');
      let actionResults = itemBlocks.map(parseStateChange).filter((r) => r.instanceId);

      return {
        output: {
          actionResults,
          totalCount: actionResults.length,
        },
        message: `Terminated **${actionResults.length}** instance(s): ${instanceIds.join(', ')}`,
      };
    }

    if (operation === 'reboot') {
      await client.postQueryApi({
        service: EC2_SERVICE,
        action: 'RebootInstances',
        params: instanceIdParams,
        version: EC2_VERSION,
      });

      // RebootInstances does not return state change info, just success/failure
      let actionResults = instanceIds.map((id) => ({
        instanceId: id,
        previousState: 'running',
        currentState: 'running',
      }));

      return {
        output: {
          actionResults,
          totalCount: actionResults.length,
        },
        message: `Rebooted **${actionResults.length}** instance(s): ${instanceIds.join(', ')}`,
      };
    }

    throw new Error(`Unknown operation: ${operation}`);
  }).build();
