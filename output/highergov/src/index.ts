import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchOpportunities,
  searchContractAwards,
  searchGrantAwards,
  searchAwardees,
  searchPeople,
  getDocuments,
  searchAgencies,
  searchContractVehicles,
  lookupCodes,
  searchStateLocalContracts,
} from './tools';
import { pursuitAdded } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchOpportunities,
    searchContractAwards,
    searchGrantAwards,
    searchAwardees,
    searchPeople,
    getDocuments,
    searchAgencies,
    searchContractVehicles,
    lookupCodes,
    searchStateLocalContracts,
  ],
  triggers: [
    pursuitAdded,
  ],
});
