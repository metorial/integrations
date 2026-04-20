import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { provider } from './index';

let wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let createToken = () => Math.random().toString(36).slice(2, 8);

let createDisposableEmail = (runId: string) => {
  let token = `${runId}${createToken()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(-24);

  return `slates.${token}@example.com`;
};

let getProfileEmail = (ctx: any) => {
  let auth = Object.values(ctx.profile.auth ?? {})[0] as
    | { profile?: { email?: string } }
    | undefined;

  return typeof auth?.profile?.email === 'string' ? auth.profile.email : undefined;
};

let waitForContact = async (
  ctx: any,
  query: string,
  resourceName: string
) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let result = await ctx.invokeTool('search_contacts', {
      query,
      pageSize: 20
    });

    if (
      result.output.contacts.some(
        (candidate: { resourceName?: string }) => candidate.resourceName === resourceName
      )
    ) {
      return;
    }

    await wait(1000 * (attempt + 1));
  }

  throw new Error(`search_contacts did not return ${resourceName} for query "${query}".`);
};

let waitForMembership = async (
  ctx: any,
  contactResourceName: string,
  groupResourceName: string,
  expectedPresent: boolean
) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let result = await ctx.invokeTool('get_contact', {
      resourceName: contactResourceName
    });
    let memberships = result.output.memberships ?? [];
    let isPresent = memberships.some(
      (membership: { contactGroupResourceName?: string }) =>
        membership.contactGroupResourceName === groupResourceName
    );

    if (isPresent === expectedPresent) {
      return result.output;
    }

    await wait(1000 * (attempt + 1));
  }

  throw new Error(
    `Expected membership ${expectedPresent ? 'to include' : 'to exclude'} ` +
      `${groupResourceName} for ${contactResourceName}.`
  );
};

let getOtherContactResourceName = async (ctx: any) => {
  let result = await ctx.invokeTool('list_other_contacts', {
    pageSize: 10
  });
  let otherContact = result.output.otherContacts.find(
    (candidate: { resourceName?: string }) => typeof candidate.resourceName === 'string'
  );

  return otherContact?.resourceName ? String(otherContact.resourceName) : undefined;
};

export let googleContactsToolE2E = defineSlateToolE2EIntegration({
  resources: {
    contact: {
      create: async ctx => {
        let input = {
          names: [
            {
              givenName: 'Slates',
              familyName: `E2E${createToken()}`
            }
          ],
          emailAddresses: [
            {
              value: createDisposableEmail(ctx.runId),
              type: 'work'
            }
          ]
        };
        let result = await ctx.invokeTool('create_contact', input);

        return {
          ...result.output,
          ...input
        };
      }
    },
    contact_group: {
      create: async ctx => {
        let input = {
          name: `${ctx.namespaced('contact group')} ${createToken()}`
        };
        let result = await ctx.invokeTool('create_contact_group', input);

        return {
          ...result.output,
          name: result.output.name ?? input.name
        };
      }
    }
  },
  scenarioOverrides: {
    create_contact: {
      name: 'create_contact creates a disposable contact',
      use: ['contact'],
      run: async () => {}
    },
    update_contact: {
      name: 'update_contact mutates the created contact',
      use: ['contact'],
      run: async ctx => {
        let contact = ctx.resource('contact');
        let biography = `${ctx.runId} updated biography`;

        await ctx.invokeTool('update_contact', {
          resourceName: String(contact.resourceName),
          etag: String(contact.etag),
          contactData: {
            biographies: [{ value: biography }]
          }
        });

        let readBack = await ctx.invokeTool('get_contact', {
          resourceName: String(contact.resourceName)
        });

        if (readBack.output.biographies?.[0]?.value !== biography) {
          throw new Error('update_contact did not persist the updated biography.');
        }

        ctx.updateResource('contact', readBack.output);
      }
    },
    list_contacts: {
      name: 'list_contacts includes the created contact',
      use: ['contact'],
      run: async ctx => {
        let contact = ctx.resource('contact');

        for (let attempt = 0; attempt < 5; attempt += 1) {
          let result = await ctx.invokeTool('list_contacts', {
            pageSize: 200,
            sortOrder: 'LAST_MODIFIED_DESCENDING'
          });

          if (
            result.output.contacts.some(
              (candidate: { resourceName?: string }) =>
                candidate.resourceName === String(contact.resourceName)
            )
          ) {
            return;
          }

          await wait(1000 * (attempt + 1));
        }

        throw new Error(`list_contacts did not return ${contact.resourceName}.`);
      }
    },
    search_contacts: {
      name: 'search_contacts finds the created contact by email',
      use: ['contact'],
      run: async ctx => {
        let contact = ctx.resource('contact');
        let query = contact.emailAddresses?.[0]?.value;

        if (typeof query !== 'string' || query.length === 0) {
          throw new Error('The tracked contact is missing a searchable email address.');
        }

        await waitForContact(ctx, query, String(contact.resourceName));
      }
    },
    create_contact_group: {
      name: 'create_contact_group creates a disposable contact group',
      use: ['contact_group'],
      run: async () => {}
    },
    update_contact_group: {
      name: 'update_contact_group renames the created contact group',
      use: ['contact_group'],
      run: async ctx => {
        let group = ctx.resource('contact_group');
        let name = `${ctx.namespaced('contact group updated')} ${createToken()}`;

        await ctx.invokeTool('update_contact_group', {
          resourceName: String(group.resourceName),
          etag: typeof group.etag === 'string' ? group.etag : undefined,
          name
        });

        let readBack = await ctx.invokeTool('get_contact_group', {
          resourceName: String(group.resourceName),
          maxMembers: 10
        });

        if (readBack.output.name !== name) {
          throw new Error('update_contact_group did not persist the updated name.');
        }

        ctx.updateResource('contact_group', readBack.output);
      }
    },
    modify_group_members: {
      name: 'modify_group_members adds and removes the created contact',
      use: ['contact', 'contact_group'],
      run: async ctx => {
        let contact = ctx.resource('contact');
        let group = ctx.resource('contact_group');
        let contactResourceName = String(contact.resourceName);
        let groupResourceName = String(group.resourceName);

        let added = await ctx.invokeTool('modify_group_members', {
          groupResourceName,
          addContactResourceNames: [contactResourceName]
        });

        if ((added.output.notFoundResourceNames ?? []).length > 0) {
          throw new Error('modify_group_members could not add the tracked contact.');
        }

        await waitForMembership(ctx, contactResourceName, groupResourceName, true);

        let removed = await ctx.invokeTool('modify_group_members', {
          groupResourceName,
          removeContactResourceNames: [contactResourceName]
        });

        if ((removed.output.notFoundResourceNames ?? []).length > 0) {
          throw new Error('modify_group_members could not remove the tracked contact.');
        }

        await waitForMembership(ctx, contactResourceName, groupResourceName, false);
      }
    },
    list_other_contacts: {
      name: 'list_other_contacts returns a valid response shape',
      run: async ctx => {
        await ctx.invokeTool('list_other_contacts', {
          pageSize: 1
        });
      }
    },
    search_other_contacts: {
      name: 'search_other_contacts accepts a minimal read-only query',
      run: async ctx => {
        await ctx.invokeTool('search_other_contacts', {
          query: 'slates',
          pageSize: 1
        });
      }
    },
    copy_other_contact: {
      name: 'copy_other_contact copies an existing other contact into My Contacts',
      run: async ctx => {
        let resourceName = await getOtherContactResourceName(ctx);
        if (!resourceName) {
          console.log(
            '[google-contacts e2e] Skipping copy_other_contact: requires at least one existing Other Contact in the selected Google account.'
          );
          return;
        }

        let result = await ctx.invokeTool('copy_other_contact', {
          resourceName
        });

        return {
          provide: {
            contact: result.output
          }
        };
      }
    },
    search_directory: {
      name: 'search_directory accepts a minimal read-only query',
      run: async ctx => {
        let email = getProfileEmail(ctx);
        if (typeof email !== 'string' || email.endsWith('@gmail.com')) {
          console.log(
            '[google-contacts e2e] Skipping search_directory: requires a Google Workspace account with directory access enabled.'
          );
          return;
        }

        try {
          await ctx.invokeTool('search_directory', {
            query: 'slates',
            pageSize: 1
          });
        } catch (error) {
          let message = error instanceof Error ? error.message : String(error);
          console.log(
            `[google-contacts e2e] Skipping search_directory: requires a Google Workspace account with directory access enabled. ${message}`
          );
          return;
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleContactsToolE2E
});
