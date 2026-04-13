import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchLeaguesTool,
  searchTeamsTool,
  getFixturesTool,
  getStandingsTool,
  getMatchDetailsTool,
  getPlayerStatsTool,
  getOddsTool,
  getPredictionsTool,
  getInjuriesTool,
  getTeamStatisticsTool,
  getTransfersTool,
  getCoachesTool,
  getCountriesTool
} from './tools';
import { fixtureStatusChangeTrigger, fixtureResultsTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchLeaguesTool,
    searchTeamsTool,
    getFixturesTool,
    getStandingsTool,
    getMatchDetailsTool,
    getPlayerStatsTool,
    getOddsTool,
    getPredictionsTool,
    getInjuriesTool,
    getTeamStatisticsTool,
    getTransfersTool,
    getCoachesTool,
    getCountriesTool
  ],
  triggers: [inboundWebhook, fixtureStatusChangeTrigger, fixtureResultsTrigger]
});
