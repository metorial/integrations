import { z } from 'zod';

export let nameSchema = z
  .object({
    displayName: z.string().optional().describe('Full display name'),
    givenName: z.string().optional().describe('First/given name'),
    familyName: z.string().optional().describe('Last/family name'),
    middleName: z.string().optional().describe('Middle name'),
    prefix: z.string().optional().describe('Name prefix (e.g., Mr., Dr.)'),
    suffix: z.string().optional().describe('Name suffix (e.g., Jr., III)')
  })
  .describe('Name of the contact');

export let emailSchema = z
  .object({
    value: z.string().describe('Email address'),
    type: z.string().optional().describe('Type of email (e.g., home, work, other)')
  })
  .describe('Email address');

export let phoneSchema = z
  .object({
    value: z.string().describe('Phone number'),
    type: z.string().optional().describe('Type of phone (e.g., home, work, mobile)')
  })
  .describe('Phone number');

export let addressSchema = z
  .object({
    streetAddress: z.string().optional().describe('Street address'),
    city: z.string().optional().describe('City'),
    region: z.string().optional().describe('State or region'),
    postalCode: z.string().optional().describe('Postal/ZIP code'),
    country: z.string().optional().describe('Country'),
    type: z.string().optional().describe('Type of address (e.g., home, work)')
  })
  .describe('Physical address');

export let organizationSchema = z
  .object({
    name: z.string().optional().describe('Organization name'),
    title: z.string().optional().describe('Job title'),
    department: z.string().optional().describe('Department name')
  })
  .describe('Organization/company');

export let dateFieldSchema = z
  .object({
    year: z.number().optional().describe('Year (omit for recurring events)'),
    month: z.number().optional().describe('Month (1-12)'),
    day: z.number().optional().describe('Day of month (1-31)')
  })
  .describe('Date');

export let birthdaySchema = z
  .object({
    date: dateFieldSchema.optional()
  })
  .describe('Birthday');

export let urlSchema = z
  .object({
    value: z.string().describe('URL'),
    type: z.string().optional().describe('Type of URL (e.g., homePage, blog, profile)')
  })
  .describe('URL');

export let biographySchema = z
  .object({
    value: z.string().describe('Biography or notes text')
  })
  .describe('Biography/notes');

export let customFieldSchema = z
  .object({
    key: z.string().describe('Custom field label'),
    value: z.string().describe('Custom field value')
  })
  .describe('Custom field');

export let nicknameSchema = z
  .object({
    value: z.string().describe('Nickname')
  })
  .describe('Nickname');

export let relationSchema = z
  .object({
    person: z.string().describe('Name of the related person'),
    type: z
      .string()
      .optional()
      .describe('Relationship type (e.g., spouse, parent, child, friend)')
  })
  .describe('Relationship');

export let eventSchema = z
  .object({
    date: dateFieldSchema.optional(),
    type: z.string().optional().describe('Type of event (e.g., anniversary)')
  })
  .describe('Event/date');

export let occupationSchema = z
  .object({
    value: z.string().describe('Occupation')
  })
  .describe('Occupation');

export let membershipSchema = z
  .object({
    contactGroupResourceName: z
      .string()
      .optional()
      .describe('Resource name of the contact group')
  })
  .describe('Group membership');

export let contactInputSchema = z.object({
  names: z.array(nameSchema).optional().describe('Names for the contact'),
  emailAddresses: z.array(emailSchema).optional().describe('Email addresses'),
  phoneNumbers: z.array(phoneSchema).optional().describe('Phone numbers'),
  addresses: z.array(addressSchema).optional().describe('Physical addresses'),
  organizations: z.array(organizationSchema).optional().describe('Organizations/companies'),
  birthdays: z.array(birthdaySchema).optional().describe('Birthdays'),
  urls: z.array(urlSchema).optional().describe('URLs'),
  biographies: z.array(biographySchema).optional().describe('Biographies/notes'),
  userDefined: z.array(customFieldSchema).optional().describe('Custom fields'),
  nicknames: z.array(nicknameSchema).optional().describe('Nicknames'),
  relations: z.array(relationSchema).optional().describe('Relationships'),
  events: z.array(eventSchema).optional().describe('Events/dates'),
  occupations: z.array(occupationSchema).optional().describe('Occupations')
});

export let contactOutputSchema = z.object({
  resourceName: z.string().describe('Unique resource name (e.g., people/c12345)'),
  etag: z.string().optional().describe('ETag for concurrency control, required when updating'),
  names: z.array(nameSchema).optional(),
  emailAddresses: z.array(emailSchema).optional(),
  phoneNumbers: z.array(phoneSchema).optional(),
  addresses: z.array(addressSchema).optional(),
  organizations: z.array(organizationSchema).optional(),
  birthdays: z.array(birthdaySchema).optional(),
  urls: z.array(urlSchema).optional(),
  biographies: z.array(biographySchema).optional(),
  userDefined: z.array(customFieldSchema).optional(),
  nicknames: z.array(nicknameSchema).optional(),
  relations: z.array(relationSchema).optional(),
  events: z.array(eventSchema).optional(),
  occupations: z.array(occupationSchema).optional(),
  memberships: z.array(membershipSchema).optional()
});

export let contactGroupSchema = z.object({
  resourceName: z.string().describe('Unique resource name (e.g., contactGroups/abc123)'),
  etag: z
    .string()
    .optional()
    .describe('ETag/fingerprint for concurrency control, required when updating'),
  name: z.string().optional().describe('Display name of the group'),
  formattedName: z.string().optional().describe('Formatted name of the group'),
  groupType: z
    .string()
    .optional()
    .describe('GROUP_TYPE_UNSPECIFIED, USER_CONTACT_GROUP, or SYSTEM_CONTACT_GROUP'),
  memberCount: z.number().optional().describe('Number of members in the group'),
  memberResourceNames: z
    .array(z.string())
    .optional()
    .describe('Resource names of group members'),
  clientData: z.array(customFieldSchema).optional().describe('Client-specific key-value data')
});

export let formatContact = (person: any) => {
  return {
    resourceName: person.resourceName,
    etag: person.etag,
    names: person.names,
    emailAddresses: person.emailAddresses,
    phoneNumbers: person.phoneNumbers,
    addresses: person.addresses,
    organizations: person.organizations,
    birthdays: person.birthdays,
    urls: person.urls,
    biographies: person.biographies,
    userDefined: person.userDefined,
    nicknames: person.nicknames,
    relations: person.relations,
    events: person.events,
    occupations: person.occupations,
    memberships: person.memberships?.map((m: any) => ({
      contactGroupResourceName: m.contactGroupMembership?.contactGroupResourceName
    }))
  };
};

export let formatContactGroup = (group: any) => {
  return {
    resourceName: group.resourceName,
    etag: group.etag,
    name: group.name,
    formattedName: group.formattedName,
    groupType: group.groupType,
    memberCount: group.memberCount,
    memberResourceNames: group.memberResourceNames,
    clientData: group.clientData
  };
};
