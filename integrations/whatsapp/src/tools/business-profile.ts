import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getBusinessProfile = SlateTool.create(
  spec,
  {
    name: 'Get Business Profile',
    key: 'get_business_profile',
    description: `Retrieve the WhatsApp Business profile information for your phone number, including description, address, email, websites, industry vertical, and profile picture.`,
    tags: {
      destructive: false,
      readOnly: true
    }
  }
)
  .input(z.object({}))
  .output(z.object({
    about: z.string().optional().describe('Short about text shown on the business profile'),
    address: z.string().optional().describe('Business address'),
    description: z.string().optional().describe('Business description'),
    email: z.string().optional().describe('Business email address'),
    websites: z.array(z.string()).optional().describe('Business website URLs (max 2)'),
    vertical: z.string().optional().describe('Industry vertical category'),
    profilePictureUrl: z.string().optional().describe('URL of the profile picture')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      phoneNumberId: ctx.config.phoneNumberId,
      wabaId: ctx.config.wabaId,
      apiVersion: ctx.config.apiVersion
    });

    let result = await client.getBusinessProfile();
    let profile = result.data?.[0] ?? {};

    return {
      output: {
        about: profile.about,
        address: profile.address,
        description: profile.description,
        email: profile.email,
        websites: profile.websites,
        vertical: profile.vertical,
        profilePictureUrl: profile.profile_picture_url
      },
      message: `Retrieved business profile.${profile.description ? ` Description: "${profile.description}"` : ''}`
    };
  })
  .build();

export let updateBusinessProfile = SlateTool.create(
  spec,
  {
    name: 'Update Business Profile',
    key: 'update_business_profile',
    description: `Update the WhatsApp Business profile for your phone number. Only the fields you provide will be updated; omitted fields remain unchanged.`,
    instructions: [
      'Maximum 2 websites allowed',
      'Vertical must be one of: AUTOMOTIVE, BEAUTY, APPAREL, EDU, ENTERTAIN, EVENT_PLAN, FINANCE, GROCERY, GOVT, HOTEL, HEALTH, NONPROFIT, PROF_SERVICES, RETAIL, TRAVEL, RESTAURANT, NOT_A_BIZ, OTHER'
    ],
    tags: {
      destructive: false,
      readOnly: false
    }
  }
)
  .input(z.object({
    about: z.string().optional().describe('Short about text (max 139 characters)'),
    address: z.string().optional().describe('Business address (max 256 characters)'),
    description: z.string().optional().describe('Business description (max 512 characters)'),
    email: z.string().optional().describe('Business email address (max 128 characters)'),
    websites: z.array(z.string()).max(2).optional().describe('Business website URLs (max 2)'),
    vertical: z.enum([
      'AUTOMOTIVE', 'BEAUTY', 'APPAREL', 'EDU', 'ENTERTAIN', 'EVENT_PLAN',
      'FINANCE', 'GROCERY', 'GOVT', 'HOTEL', 'HEALTH', 'NONPROFIT',
      'PROF_SERVICES', 'RETAIL', 'TRAVEL', 'RESTAURANT', 'NOT_A_BIZ', 'OTHER'
    ]).optional().describe('Industry vertical category'),
    profilePictureHandle: z.string().optional().describe('Handle of an uploaded profile picture')
  }))
  .output(z.object({
    success: z.boolean()
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      phoneNumberId: ctx.config.phoneNumberId,
      wabaId: ctx.config.wabaId,
      apiVersion: ctx.config.apiVersion
    });

    let result = await client.updateBusinessProfile({
      about: ctx.input.about,
      address: ctx.input.address,
      description: ctx.input.description,
      email: ctx.input.email,
      websites: ctx.input.websites,
      vertical: ctx.input.vertical,
      profilePictureHandle: ctx.input.profilePictureHandle
    });

    return {
      output: {
        success: result.success === true
      },
      message: `Updated business profile successfully.`
    };
  })
  .build();
