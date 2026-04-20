import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { provider } from './index';

type SheetSummary = {
  sheetId: number;
  title: string;
  index: number;
};

type SpreadsheetResource = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: SheetSummary[];
  dataSheetId: number;
  dataSheetTitle: string;
  workspaceSheetId: number;
  workspaceSheetTitle: string;
  pivotSheetId: number;
  pivotSheetTitle: string;
  dataRange: string;
};

let baseSheets = {
  data: 'Data',
  workspace: 'Workspace',
  pivot: 'Pivot'
} as const;

let seedData = [
  ['Region', 'Product', 'Amount'],
  ['East', 'Widget', 10],
  ['West', 'Widget', 20],
  ['East', 'Gadget', 15],
  ['West', 'Gadget', 30]
];

let runToken = (runId: string) =>
  runId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(-24) || 'google_sheets_e2e';

let sheetTitleForRun = (runId: string, label: string) =>
  `${label}_${runToken(runId)}`.slice(0, 80);

let namedRangeForRun = (runId: string, label: string) =>
  `slates_${label}_${runToken(runId)}`
    .replace(/[^a-z0-9_]+/gi, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 80);

let requireSheet = (
  spreadsheet: { sheets?: SheetSummary[] },
  title: string
): SheetSummary => {
  let sheet = spreadsheet.sheets?.find(candidate => candidate.title === title);
  if (!sheet) {
    throw new Error(`Expected spreadsheet to include sheet "${title}".`);
  }
  return sheet;
};

let getSpreadsheet = (ctx: { resource(name: string): Record<string, any> }) =>
  ctx.resource('spreadsheet') as SpreadsheetResource;

export let googleSheetsToolE2E = defineSlateToolE2EIntegration({
  resources: {
    spreadsheet: {
      create: async ctx => {
        let created = await ctx.invokeTool('create_spreadsheet', {
          title: ctx.namespaced('spreadsheet'),
          sheetTitles: [baseSheets.data, baseSheets.workspace, baseSheets.pivot]
        });

        await ctx.invokeTool('write_cells', {
          spreadsheetId: created.output.spreadsheetId,
          range: `${baseSheets.data}!A1:C5`,
          values: seedData,
          valueInputOption: 'RAW'
        });

        let dataSheet = requireSheet(created.output, baseSheets.data);
        let workspaceSheet = requireSheet(created.output, baseSheets.workspace);
        let pivotSheet = requireSheet(created.output, baseSheets.pivot);

        return {
          ...created.output,
          dataSheetId: dataSheet.sheetId,
          dataSheetTitle: dataSheet.title,
          workspaceSheetId: workspaceSheet.sheetId,
          workspaceSheetTitle: workspaceSheet.title,
          pivotSheetId: pivotSheet.sheetId,
          pivotSheetTitle: pivotSheet.title,
          dataRange: `${baseSheets.data}!A1:C5`
        };
      }
    }
  },
  scenarioOverrides: {
    create_spreadsheet: {
      name: 'create_spreadsheet creates the shared spreadsheet',
      use: ['spreadsheet'],
      run: async () => {}
    },
    delete_spreadsheet: {
      name: 'delete_spreadsheet deletes a disposable spreadsheet',
      run: async ctx => {
        let created = await ctx.invokeTool('create_spreadsheet', {
          title: ctx.namespaced('spreadsheet for delete')
        });
        let spreadsheetId = created.output.spreadsheetId;
        let deleted = false;

        ctx.registerCleanup(async () => {
          if (!deleted) {
            try {
              await ctx.invokeTool('delete_spreadsheet', { spreadsheetId });
            } catch {}
          }
        });

        await ctx.invokeTool('delete_spreadsheet', { spreadsheetId });
        deleted = true;
      }
    },
    read_cells: {
      name: 'read_cells reads seeded data from the shared spreadsheet',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        let result = await ctx.invokeTool('read_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          range: spreadsheet.dataRange
        });

        if (result.output.values?.[0]?.[0] !== 'Region') {
          throw new Error('read_cells did not return the seeded header row.');
        }
      }
    },
    write_cells: {
      name: 'write_cells writes values into the workspace sheet',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        let result = await ctx.invokeTool('write_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          range: `${spreadsheet.workspaceSheetTitle}!A1:B2`,
          values: [
            ['Status', 'Ready'],
            ['Count', 2]
          ],
          valueInputOption: 'RAW'
        });

        if ((result.output.updatedCells ?? 0) < 4) {
          throw new Error('write_cells did not report the expected cell updates.');
        }
      }
    },
    clear_cells: {
      name: 'clear_cells clears a range after writing values',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        let range = `${spreadsheet.workspaceSheetTitle}!D1:E2`;

        await ctx.invokeTool('write_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          range,
          values: [
            ['Clear', 'Me'],
            ['Soon', 'Now']
          ],
          valueInputOption: 'RAW'
        });

        await ctx.invokeTool('clear_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          range
        });
      }
    },
    manage_sheets: {
      name: 'manage_sheets adds, updates, duplicates, and deletes sheets',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        let added = await ctx.invokeTool('manage_sheets', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'add',
          title: sheetTitleForRun(ctx.runId, 'managed'),
          rowCount: 20,
          columnCount: 6
        });
        let addedSheetId = added.output.sheetId;

        if (addedSheetId === undefined) {
          throw new Error('manage_sheets add did not return a sheetId.');
        }

        await ctx.invokeTool('manage_sheets', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'update',
          sheetId: addedSheetId,
          title: sheetTitleForRun(ctx.runId, 'managed_updated'),
          frozenRowCount: 1
        });

        let duplicated = await ctx.invokeTool('manage_sheets', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'duplicate',
          sourceSheetId: addedSheetId,
          newSheetName: sheetTitleForRun(ctx.runId, 'managed_copy')
        });
        let duplicatedSheetId = duplicated.output.sheetId;

        if (duplicatedSheetId === undefined) {
          throw new Error('manage_sheets duplicate did not return a sheetId.');
        }

        await ctx.invokeTool('manage_sheets', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'delete',
          sheetId: duplicatedSheetId
        });
        await ctx.invokeTool('manage_sheets', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'delete',
          sheetId: addedSheetId
        });
      }
    },
    format_cells: {
      name: 'format_cells formats the shared data header row',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        await ctx.invokeTool('format_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          sheetId: spreadsheet.dataSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 3,
          bold: true,
          horizontalAlignment: 'CENTER',
          backgroundColor: {
            red: 0.9,
            green: 0.95,
            blue: 1
          }
        });
      }
    },
    batch_update: {
      name: 'batch_update applies a raw addSheet request',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        let result = await ctx.invokeTool('batch_update', {
          spreadsheetId: spreadsheet.spreadsheetId,
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitleForRun(ctx.runId, 'batch')
                }
              }
            }
          ]
        });

        if ((result.output.replies ?? []).length < 1) {
          throw new Error('batch_update did not return the addSheet reply.');
        }
      }
    },
    create_chart: {
      name: 'create_chart adds a chart backed by seeded product data',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        await ctx.invokeTool('create_chart', {
          spreadsheetId: spreadsheet.spreadsheetId,
          chartType: 'COLUMN',
          title: ctx.namespaced('product chart'),
          sourceRange: {
            sheetId: spreadsheet.dataSheetId,
            startRowIndex: 0,
            endRowIndex: 5,
            startColumnIndex: 1,
            endColumnIndex: 3
          },
          anchorSheetId: spreadsheet.workspaceSheetId,
          anchorRowIndex: 0,
          anchorColumnIndex: 4
        });
      }
    },
    create_pivot_table: {
      name: 'create_pivot_table summarizes seeded data into the pivot sheet',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        await ctx.invokeTool('create_pivot_table', {
          spreadsheetId: spreadsheet.spreadsheetId,
          sourceSheetId: spreadsheet.dataSheetId,
          sourceStartRowIndex: 0,
          sourceEndRowIndex: 5,
          sourceStartColumnIndex: 0,
          sourceEndColumnIndex: 3,
          targetSheetId: spreadsheet.pivotSheetId,
          targetRowIndex: 0,
          targetColumnIndex: 0,
          rows: [
            {
              sourceColumnOffset: 0
            }
          ],
          values: [
            {
              sourceColumnOffset: 2,
              summarizeFunction: 'SUM',
              name: 'Total Amount'
            }
          ]
        });
      }
    },
    set_data_validation: {
      name: 'set_data_validation applies a dropdown rule on workspace cells',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        await ctx.invokeTool('set_data_validation', {
          spreadsheetId: spreadsheet.spreadsheetId,
          sheetId: spreadsheet.workspaceSheetId,
          startRowIndex: 0,
          endRowIndex: 3,
          startColumnIndex: 2,
          endColumnIndex: 3,
          conditionType: 'ONE_OF_LIST',
          conditionValues: ['Open', 'Closed'],
          strict: true,
          inputMessage: 'Pick a status'
        });
      }
    },
    manage_protected_ranges: {
      name: 'manage_protected_ranges adds and removes a warning-only protection',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        let added = await ctx.invokeTool('manage_protected_ranges', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'add',
          sheetId: spreadsheet.workspaceSheetId,
          startRowIndex: 4,
          endRowIndex: 6,
          startColumnIndex: 0,
          endColumnIndex: 2,
          description: 'Suite protection',
          warningOnly: true
        });
        let protectedRangeId = added.output.protectedRangeId;

        if (protectedRangeId === undefined) {
          throw new Error('manage_protected_ranges add did not return an ID.');
        }

        await ctx.invokeTool('manage_protected_ranges', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'delete',
          protectedRangeId
        });
      }
    },
    manage_named_ranges: {
      name: 'manage_named_ranges adds, updates, and deletes a named range',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        let added = await ctx.invokeTool('manage_named_ranges', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'add',
          name: namedRangeForRun(ctx.runId, 'data'),
          sheetId: spreadsheet.dataSheetId,
          startRowIndex: 1,
          endRowIndex: 5,
          startColumnIndex: 0,
          endColumnIndex: 3
        });
        let namedRangeId = added.output.namedRangeId;

        if (!namedRangeId) {
          throw new Error('manage_named_ranges add did not return an ID.');
        }

        await ctx.invokeTool('manage_named_ranges', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'update',
          namedRangeId,
          name: namedRangeForRun(ctx.runId, 'data_updated')
        });
        await ctx.invokeTool('manage_named_ranges', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'delete',
          namedRangeId
        });
      }
    },
    create_filter_view: {
      name: 'create_filter_view creates a filter over the seeded dataset',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);
        await ctx.invokeTool('create_filter_view', {
          spreadsheetId: spreadsheet.spreadsheetId,
          title: sheetTitleForRun(ctx.runId, 'filter'),
          sheetId: spreadsheet.dataSheetId,
          startRowIndex: 0,
          endRowIndex: 5,
          startColumnIndex: 0,
          endColumnIndex: 3,
          criteria: [
            {
              columnIndex: 0,
              hiddenValues: ['West']
            }
          ],
          sortColumnIndex: 2,
          sortOrder: 'DESCENDING'
        });
      }
    },
    merge_cells: {
      name: 'merge_cells merges and unmerges a workspace range',
      use: ['spreadsheet'],
      run: async ctx => {
        let spreadsheet = getSpreadsheet(ctx);

        await ctx.invokeTool('write_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          range: `${spreadsheet.workspaceSheetTitle}!G1:H1`,
          values: [['Merge', 'Target']],
          valueInputOption: 'RAW'
        });

        await ctx.invokeTool('merge_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'merge',
          sheetId: spreadsheet.workspaceSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 6,
          endColumnIndex: 8,
          mergeType: 'MERGE_ALL'
        });
        await ctx.invokeTool('merge_cells', {
          spreadsheetId: spreadsheet.spreadsheetId,
          action: 'unmerge',
          sheetId: spreadsheet.workspaceSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 6,
          endColumnIndex: 8
        });
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleSheetsToolE2E
});
