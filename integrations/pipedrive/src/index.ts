import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageDeals,
  getDeals,
  manageLeads,
  getLeads,
  managePersons,
  getPersons,
  manageOrganizations,
  getOrganizations,
  manageActivities,
  getActivities,
  manageProducts,
  getProducts,
  manageNotes,
  managePipelines,
  getPipelines,
  searchPipedrive,
  manageDealProducts,
  getUsers
} from './tools';
import {
  dealEvents,
  leadEvents,
  personEvents,
  organizationEvents,
  activityEvents,
  productEvents,
  noteEvents,
  pipelineEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageDeals.build(),
    getDeals.build(),
    manageLeads.build(),
    getLeads.build(),
    managePersons.build(),
    getPersons.build(),
    manageOrganizations.build(),
    getOrganizations.build(),
    manageActivities.build(),
    getActivities.build(),
    manageProducts.build(),
    getProducts.build(),
    manageNotes.build(),
    managePipelines.build(),
    getPipelines.build(),
    searchPipedrive.build(),
    manageDealProducts.build(),
    getUsers.build()
  ],
  triggers: [
    dealEvents.build(),
    leadEvents.build(),
    personEvents.build(),
    organizationEvents.build(),
    activityEvents.build(),
    productEvents.build(),
    noteEvents.build(),
    pipelineEvents.build()
  ]
});
