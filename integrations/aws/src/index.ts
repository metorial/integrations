import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  manageEc2InstancesTool,
  manageS3Tool,
  manageLambdaTool,
  manageDynamoDbTool,
  manageIamTool,
  manageCloudWatchTool,
  manageSnsTool,
  manageSqsTool,
} from './tools';
import {
  cloudwatchAlarmChangesTrigger,
  ec2InstanceStateChangesTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageEc2InstancesTool,
    manageS3Tool,
    manageLambdaTool,
    manageDynamoDbTool,
    manageIamTool,
    manageCloudWatchTool,
    manageSnsTool,
    manageSqsTool,
  ],
  triggers: [
    inboundWebhook,
    cloudwatchAlarmChangesTrigger,
    ec2InstanceStateChangesTrigger,
  ],
});
