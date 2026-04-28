import { createGetConversationInfoTool } from '@slates/slack-tools';
import { SlackClient } from '../lib/client';
import { spec } from '../spec';

export let getConversationInfo = createGetConversationInfoTool({ spec, SlackClient });
