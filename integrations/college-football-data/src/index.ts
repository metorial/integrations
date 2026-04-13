import { Slate } from 'slates';
import { spec } from './spec';
import {
  getGames,
  getGameStats,
  getTeamInfo,
  getMatchupHistory,
  searchPlayers,
  getTeamStats,
  getPlayerStats,
  getRankingsRatings,
  getRecruiting,
  getBettingLines,
  getPlays,
  getWinProbability,
  getCoaches,
  getDraftPicks,
  getConferencesVenues,
  getTransferPortal,
  getLiveScoreboard,
  getAdjustedMetrics
} from './tools';
import { gameScoreUpdates, bettingLineUpdates, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getGames,
    getGameStats,
    getTeamInfo,
    getMatchupHistory,
    searchPlayers,
    getTeamStats,
    getPlayerStats,
    getRankingsRatings,
    getRecruiting,
    getBettingLines,
    getPlays,
    getWinProbability,
    getCoaches,
    getDraftPicks,
    getConferencesVenues,
    getTransferPortal,
    getLiveScoreboard,
    getAdjustedMetrics
  ],
  triggers: [inboundWebhook, gameScoreUpdates, bettingLineUpdates]
});
