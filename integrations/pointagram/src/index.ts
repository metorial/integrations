import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPlayer,
  listPlayers,
  removePlayer,
  createTeam,
  listTeams,
  manageTeamMembership,
  addScore,
  listScoreSeries,
  listScoreHistory,
  listCompetitions
} from './tools';
import { newPlayer, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPlayer,
    listPlayers,
    removePlayer,
    createTeam,
    listTeams,
    manageTeamMembership,
    addScore,
    listScoreSeries,
    listScoreHistory,
    listCompetitions
  ],
  triggers: [inboundWebhook, newPlayer]
});
