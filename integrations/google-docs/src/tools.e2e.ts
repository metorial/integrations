import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { provider } from './index';

type NamedRangeSummary = {
  namedRangeId?: string;
  name?: string;
};

let wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let createDocumentTitle = (runId: string) =>
  `slates-e2e-google-docs-${runId.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

let deleteDriveFile = async (token: string, documentId: string) => {
  let response = await fetch(`https://www.googleapis.com/drive/v2/files/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error(
      `Drive file delete failed with ${response.status}: ${await response.text()}`
    );
  }
};

let documentContains = async (ctx: {
  invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
}, documentId: string, expected: string) => {
  let result = await ctx.invokeTool('get_document', {
    documentId,
    includeContent: true
  });

  if (!result.output.plainText?.includes(expected)) {
    throw new Error(`Expected document ${documentId} to contain "${expected}".`);
  }

  return result;
};

let waitForNamedRangeState = async (
  ctx: {
    invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
  },
  documentId: string,
  predicate: (namedRanges: NamedRangeSummary[] | undefined) => boolean,
  errorMessage: string
) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let result = await ctx.invokeTool('get_document', {
      documentId,
      includeContent: false
    });

    if (predicate(result.output.namedRanges as NamedRangeSummary[] | undefined)) {
      return result;
    }

    await wait(500 * (attempt + 1));
  }

  throw new Error(errorMessage);
};

export let googleDocsToolE2E = defineSlateToolE2EIntegration({
  resources: {
    document: {
      create: async ctx => {
        let title = createDocumentTitle(ctx.runId);
        let result = await ctx.invokeTool('create_document', {
          title
        });

        return {
          ...result.output,
          title
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.documentId !== 'string') {
            return;
          }

          await deleteDriveFile(ctx.auth.token, value.documentId);
        }
      }
    }
  },
  scenarioOverrides: {
    create_document: {
      name: 'create_document creates a disposable document',
      use: ['document'],
      run: async () => {}
    },
    edit_document: {
      name: 'edit_document inserts and replaces live content',
      use: ['document'],
      run: async ctx => {
        let document = ctx.resource('document');
        let documentId = String(document.documentId);
        let replacement = ctx.namespaced('edited');

        let edit = await ctx.invokeTool('edit_document', {
          documentId,
          operations: [
            {
              type: 'insertText',
              index: 1,
              text: `draft ${ctx.runId}\n`
            },
            {
              type: 'formatText',
              startIndex: 1,
              endIndex: 6,
              style: {
                bold: true
              }
            },
            {
              type: 'replaceAllText',
              searchText: 'draft',
              replaceText: replacement,
              matchCase: false
            }
          ]
        });

        if (edit.output.operationsExecuted !== 3) {
          throw new Error('edit_document did not report the expected operation count.');
        }

        await documentContains(ctx, documentId, replacement);
      }
    },
    merge_template: {
      name: 'merge_template replaces placeholders in the document',
      use: ['document'],
      run: async ctx => {
        let document = ctx.resource('document');
        let documentId = String(document.documentId);
        let customerName = ctx.namespaced('customer');
        let projectCode = `CODE-${ctx.runId.slice(-6).toUpperCase()}`;

        await ctx.invokeTool('edit_document', {
          documentId,
          operations: [
            {
              type: 'insertText',
              index: 1,
              text: 'Customer: {{customer_name}}\nProject: {{project_code}}\n'
            }
          ]
        });

        let merged = await ctx.invokeTool('merge_template', {
          documentId,
          replacements: [
            {
              placeholder: '{{customer_name}}',
              value: customerName
            },
            {
              placeholder: '{{project_code}}',
              value: projectCode
            }
          ]
        });

        if (merged.output.replacementsApplied !== 2) {
          throw new Error('merge_template did not apply both replacements.');
        }

        let readBack = await ctx.invokeTool('get_document', {
          documentId,
          includeContent: true
        });
        let plainText = readBack.output.plainText ?? '';

        if (!plainText.includes(customerName) || !plainText.includes(projectCode)) {
          throw new Error('merge_template did not persist the replacement values.');
        }

        if (plainText.includes('{{customer_name}}') || plainText.includes('{{project_code}}')) {
          throw new Error('merge_template left placeholder text behind.');
        }
      }
    },
    list_documents: {
      name: 'list_documents finds the disposable document by title',
      use: ['document'],
      run: async ctx => {
        let document = ctx.resource('document');
        let documentId = String(document.documentId);
        let searchQuery = String(document.title);

        for (let attempt = 0; attempt < 5; attempt += 1) {
          let result = await ctx.invokeTool('list_documents', {
            searchQuery,
            pageSize: 10,
            orderBy: 'modifiedTime desc'
          });

          if (
            result.output.documents.some(
              (candidate: { documentId?: string }) => candidate.documentId === documentId
            )
          ) {
            return;
          }

          await wait(1000 * (attempt + 1));
        }

        throw new Error(`list_documents did not return the expected document ${documentId}.`);
      }
    },
    manage_named_ranges: {
      name: 'manage_named_ranges creates and deletes a named range',
      use: ['document'],
      run: async ctx => {
        let document = ctx.resource('document');
        let documentId = String(document.documentId);
        let rangeName = ctx.namespaced('range');
        let rangeText = `Range target ${ctx.runId}`;

        await ctx.invokeTool('edit_document', {
          documentId,
          operations: [
            {
              type: 'insertText',
              index: 1,
              text: `${rangeText}\n`
            }
          ]
        });

        let created = await ctx.invokeTool('manage_named_ranges', {
          documentId,
          operations: [
            {
              action: 'create',
              name: rangeName,
              startIndex: 1,
              endIndex: rangeText.length + 1
            }
          ]
        });

        let namedRangeId = created.output.createdRangeIds?.[0];
        if (!namedRangeId) {
          throw new Error('manage_named_ranges did not return a namedRangeId.');
        }

        await waitForNamedRangeState(
          ctx,
          documentId,
          namedRanges =>
            namedRanges?.some(
              candidate =>
                candidate.namedRangeId === namedRangeId || candidate.name === rangeName
            ) ?? false,
          'get_document did not return the created named range.'
        );

        await ctx.invokeTool('manage_named_ranges', {
          documentId,
          operations: [
            {
              action: 'delete',
              namedRangeId
            }
          ]
        });

        await waitForNamedRangeState(
          ctx,
          documentId,
          namedRanges =>
            !(
              namedRanges?.some(
                candidate =>
                  candidate.namedRangeId === namedRangeId || candidate.name === rangeName
              ) ?? false
            ),
          'manage_named_ranges did not remove the named range.'
        );
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleDocsToolE2E
});
