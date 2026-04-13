import { Slate } from 'slates';
import { spec } from './spec';
import {
  getViewer,
  createGraph,
  getGraph,
  deleteGraph,
  createBranch,
  getBranch,
  deleteBranch,
  publishSubgraph,
  checkSubgraph,
  listSubgraphs,
  getSchema,
  executeGraphQL
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getViewer,
    createGraph,
    getGraph,
    deleteGraph,
    createBranch,
    getBranch,
    deleteBranch,
    publishSubgraph,
    checkSubgraph,
    listSubgraphs,
    getSchema,
    executeGraphQL
  ],
  triggers: [inboundWebhook]
});
