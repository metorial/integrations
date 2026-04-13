import { Slate } from 'slates';
import { spec } from './spec';
import {
  launchAgent,
  getAgent,
  listAgents,
  followUpAgent,
  stopAgent,
  deleteAgent,
  getConversation,
  listAgentArtifacts,
  downloadArtifact,
  listRepositories,
  listModels,
  getApiKeyInfo,
  getTeamMembers,
  removeTeamMember,
  setSpendLimit,
  getDailyUsage,
  getSpend,
  getUsageEvents,
  getAuditLogs,
  getRepoBlocklists,
  upsertRepoBlocklists,
  deleteRepoBlocklist
} from './tools';
import { agentStatusChange } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    launchAgent,
    getAgent,
    listAgents,
    followUpAgent,
    stopAgent,
    deleteAgent,
    getConversation,
    listAgentArtifacts,
    downloadArtifact,
    listRepositories,
    listModels,
    getApiKeyInfo,
    getTeamMembers,
    removeTeamMember,
    setSpendLimit,
    getDailyUsage,
    getSpend,
    getUsageEvents,
    getAuditLogs,
    getRepoBlocklists,
    upsertRepoBlocklists,
    deleteRepoBlocklist
  ],
  triggers: [agentStatusChange]
});
