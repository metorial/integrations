import { createOpenConversationTool } from '@slates/slack-tools';
import { SlackClient } from '../lib/client';
import { spec } from '../spec';

export let openConversation = createOpenConversationTool({ spec, SlackClient });
