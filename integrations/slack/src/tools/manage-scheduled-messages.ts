import { createManageScheduledMessagesTool } from '@slates/slack-tools';
import { SlackClient } from '../lib/client';
import { spec } from '../spec';

export let manageScheduledMessages = createManageScheduledMessagesTool({ spec, SlackClient });
