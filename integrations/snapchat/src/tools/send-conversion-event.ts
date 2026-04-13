import { SlateTool } from 'slates';
import { SnapchatClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let userDataSchema = z.object({
  hashedEmail: z.string().optional().describe('SHA-256 hashed email address'),
  hashedPhone: z.string().optional().describe('SHA-256 hashed phone number'),
  hashedIpAddress: z.string().optional().describe('SHA-256 hashed IP address'),
  userAgent: z.string().optional().describe('User agent string'),
  hashedMobileAdId: z.string().optional().describe('SHA-256 hashed mobile advertising ID'),
  clickId: z.string().optional().describe('Snap click ID from URL parameter'),
  cookie1: z.string().optional().describe('Snap cookie 1 (_scid)')
}).describe('User matching parameters for attribution');

let customDataSchema = z.object({
  currency: z.string().optional().describe('Currency code (e.g., USD)'),
  price: z.number().optional().describe('Price/value of the conversion'),
  transactionId: z.string().optional().describe('Unique transaction identifier'),
  itemCategory: z.string().optional().describe('Item category'),
  itemIds: z.array(z.string()).optional().describe('List of item IDs'),
  numberOfItems: z.number().optional().describe('Number of items'),
  searchString: z.string().optional().describe('Search query string')
}).describe('Custom event data for richer attribution');

export let sendConversionEvent = SlateTool.create(
  spec,
  {
    name: 'Send Conversion Event',
    key: 'send_conversion_event',
    description: `Send web, app, or offline conversion events to Snapchat via the Conversions API (CAPI). Supports standard event types like purchases, add-to-cart, page views, sign-ups, and custom events. Events are used for ad attribution and optimization.`,
    instructions: [
      'At least one user matching parameter is required for attribution (email, phone, IP, click ID, etc.).',
      'Email and phone identifiers must be SHA-256 hashed.',
      'Use clientDedupId to deduplicate with Snap Pixel events (48-hour window).',
      'Events can be sent up to 37 days after they occur.'
    ]
  }
)
  .input(z.object({
    pixelOrAppId: z.string().describe('Snap Pixel ID (for web/offline events) or Snap App ID (for mobile events)'),
    events: z.array(z.object({
      eventName: z.string().describe('Event type (PURCHASE, ADD_CART, PAGE_VIEW, SIGN_UP, VIEW_CONTENT, ADD_BILLING, SEARCH, START_CHECKOUT, ADD_TO_WISHLIST, SUBSCRIBE, AD_CLICK, AD_VIEW, COMPLETE_TUTORIAL, LEVEL_COMPLETE, SPENT_CREDITS, LIST_VIEW, CUSTOM_EVENT_1 through CUSTOM_EVENT_5)'),
      eventTime: z.string().describe('Event timestamp in ISO 8601 format or Unix epoch milliseconds'),
      eventSourceUrl: z.string().optional().describe('URL where the event occurred'),
      actionSource: z.enum(['WEB', 'MOBILE_APP', 'OFFLINE']).describe('Source of the event'),
      userData: userDataSchema,
      customData: customDataSchema.optional(),
      clientDedupId: z.string().optional().describe('Deduplication ID to prevent duplicate counting with Snap Pixel')
    })).describe('Array of conversion events to send')
  }))
  .output(z.object({
    status: z.string().describe('Response status from Snapchat'),
    response: z.any().optional().describe('Full response from the Conversions API')
  }))
  .handleInvocation(async (ctx) => {
    let client = new SnapchatClient(ctx.auth.token);

    let formattedEvents = ctx.input.events.map((event) => {
      let formatted: Record<string, any> = {
        event_name: event.eventName,
        event_time: event.eventTime,
        action_source: event.actionSource
      };
      if (event.eventSourceUrl) formatted.event_source_url = event.eventSourceUrl;
      if (event.clientDedupId) formatted.event_id = event.clientDedupId;

      let userData: Record<string, any> = {};
      if (event.userData.hashedEmail) userData.em = [event.userData.hashedEmail];
      if (event.userData.hashedPhone) userData.ph = [event.userData.hashedPhone];
      if (event.userData.hashedIpAddress) userData.hashed_ip = event.userData.hashedIpAddress;
      if (event.userData.userAgent) userData.client_user_agent = event.userData.userAgent;
      if (event.userData.hashedMobileAdId) userData.hashed_maids = event.userData.hashedMobileAdId;
      if (event.userData.clickId) userData.sc_click_id = event.userData.clickId;
      if (event.userData.cookie1) userData.sc_cookie1 = event.userData.cookie1;
      formatted.user_data = userData;

      if (event.customData) {
        let customData: Record<string, any> = {};
        if (event.customData.currency) customData.currency = event.customData.currency;
        if (event.customData.price !== undefined) customData.price = event.customData.price;
        if (event.customData.transactionId) customData.transaction_id = event.customData.transactionId;
        if (event.customData.itemCategory) customData.item_category = event.customData.itemCategory;
        if (event.customData.itemIds) customData.item_ids = event.customData.itemIds;
        if (event.customData.numberOfItems !== undefined) customData.number_items = event.customData.numberOfItems;
        if (event.customData.searchString) customData.search_string = event.customData.searchString;
        formatted.custom_data = customData;
      }

      return formatted;
    });

    let result = await client.sendConversionEvents(ctx.input.pixelOrAppId, formattedEvents);

    return {
      output: {
        status: result.status || 'SUCCESS',
        response: result
      },
      message: `Sent **${ctx.input.events.length}** conversion event(s) to Snapchat.`
    };
  })
  .build();
