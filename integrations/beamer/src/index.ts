import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPostTool,
  updatePostTool,
  getPostTool,
  listPostsTool,
  deletePostTool,
  addCommentTool,
  addReactionTool,
  createFeatureRequestTool,
  updateFeatureRequestTool,
  listFeatureRequestsTool,
  deleteFeatureRequestTool,
  voteFeatureRequestTool,
  getUnreadCountTool,
  checkNpsTool,
  listNpsResponsesTool
} from './tools';
import {
  newPostTrigger,
  newCommentTrigger,
  newReactionTrigger,
  newNpsScoreTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPostTool,
    updatePostTool,
    getPostTool,
    listPostsTool,
    deletePostTool,
    addCommentTool,
    addReactionTool,
    createFeatureRequestTool,
    updateFeatureRequestTool,
    listFeatureRequestsTool,
    deleteFeatureRequestTool,
    voteFeatureRequestTool,
    getUnreadCountTool,
    checkNpsTool,
    listNpsResponsesTool
  ],
  triggers: [newPostTrigger, newCommentTrigger, newReactionTrigger, newNpsScoreTrigger]
});
