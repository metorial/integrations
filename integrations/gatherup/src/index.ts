import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  searchBusiness,
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomersBulk,
  sendFeedbackRequest,
  getFeedbacks,
  getOnlineReviews,
  replyToReview,
  getSurveyResults,
  getReviewWidget,
  getGoogleQA,
  getFacebookRecommendations,
  configureAutoFeedback,
  createUser
} from './tools';
import { newFeedback, newOnlineReview, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBusinesses,
    getBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    searchBusiness,
    listCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createCustomersBulk,
    sendFeedbackRequest,
    getFeedbacks,
    getOnlineReviews,
    replyToReview,
    getSurveyResults,
    getReviewWidget,
    getGoogleQA,
    getFacebookRecommendations,
    configureAutoFeedback,
    createUser
  ],
  triggers: [inboundWebhook, newFeedback, newOnlineReview]
});
