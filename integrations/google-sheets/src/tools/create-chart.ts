import { SlateTool } from 'slates';
import { SheetsClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let sourceRangeSchema = z.object({
  sheetId: z.number().describe('Sheet ID containing the data'),
  startRowIndex: z.number().describe('Start row index (0-based, inclusive)'),
  endRowIndex: z.number().describe('End row index (0-based, exclusive)'),
  startColumnIndex: z.number().describe('Start column index (0-based, inclusive)'),
  endColumnIndex: z.number().describe('End column index (0-based, exclusive)')
});

export let createChart = SlateTool.create(spec, {
  name: 'Create Chart',
  key: 'create_chart',
  description: `Creates an embedded chart in a spreadsheet. Supports bar, line, pie, area, scatter, and column chart types. Configure the data source range, chart position, title, and axis labels.`,
  instructions: [
    'Provide the data source range using sheetId and 0-based row/column indices.',
    'The chart is anchored to a cell position on a sheet using anchorCell.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      spreadsheetId: z.string().describe('Unique ID of the spreadsheet'),
      chartType: z
        .enum(['BAR', 'LINE', 'PIE', 'AREA', 'SCATTER', 'COLUMN'])
        .describe('Type of chart to create'),
      title: z.string().optional().describe('Title displayed on the chart'),
      sourceRange: sourceRangeSchema.describe('Data source range for the chart'),
      anchorSheetId: z.number().describe('Sheet ID where the chart will be placed'),
      anchorRowIndex: z
        .number()
        .optional()
        .describe('Row index to anchor the chart (0-based). Defaults to 0.'),
      anchorColumnIndex: z
        .number()
        .optional()
        .describe('Column index to anchor the chart (0-based). Defaults to 0.'),
      legendPosition: z
        .enum(['BOTTOM_LEGEND', 'LEFT_LEGEND', 'RIGHT_LEGEND', 'TOP_LEGEND', 'NO_LEGEND'])
        .optional()
        .describe('Position of the chart legend')
    })
  )
  .output(
    z.object({
      chartId: z.number().optional().describe('ID of the created chart'),
      spreadsheetId: z.string().describe('ID of the spreadsheet')
    })
  )
  .handleInvocation(async ctx => {
    let client = new SheetsClient(ctx.auth.token);
    let input = ctx.input;

    let sourceRange = {
      sheetId: input.sourceRange.sheetId,
      startRowIndex: input.sourceRange.startRowIndex,
      endRowIndex: input.sourceRange.endRowIndex,
      startColumnIndex: input.sourceRange.startColumnIndex,
      endColumnIndex: input.sourceRange.endColumnIndex
    };

    let chartSpec: Record<string, any> = {
      title: input.title
    };

    if (input.chartType === 'PIE') {
      chartSpec.pieChart = {
        legendPosition: input.legendPosition ?? 'BOTTOM_LEGEND',
        domain: {
          sourceRange: { sources: [sourceRange] }
        },
        series: {
          sourceRange: {
            sources: [
              {
                ...sourceRange,
                startColumnIndex: sourceRange.startColumnIndex + 1,
                endColumnIndex: sourceRange.endColumnIndex
              }
            ]
          }
        }
      };
    } else {
      let basicChartType = input.chartType === 'COLUMN' ? 'COLUMN' : input.chartType;
      chartSpec.basicChart = {
        chartType: basicChartType,
        legendPosition: input.legendPosition ?? 'BOTTOM_LEGEND',
        domains: [
          {
            domain: {
              sourceRange: { sources: [sourceRange] }
            }
          }
        ],
        series: [
          {
            series: {
              sourceRange: {
                sources: [
                  {
                    ...sourceRange,
                    startColumnIndex: sourceRange.startColumnIndex + 1,
                    endColumnIndex: sourceRange.endColumnIndex
                  }
                ]
              }
            },
            targetAxis: 'LEFT_AXIS'
          }
        ]
      };
    }

    let request = {
      addChart: {
        chart: {
          spec: chartSpec,
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId: input.anchorSheetId,
                rowIndex: input.anchorRowIndex ?? 0,
                columnIndex: input.anchorColumnIndex ?? 0
              }
            }
          }
        }
      }
    };

    let result = await client.batchUpdate(input.spreadsheetId, [request]);
    let chartId = result.replies?.[0]?.addChart?.chart?.chartId;

    return {
      output: {
        chartId,
        spreadsheetId: input.spreadsheetId
      },
      message: `Created ${input.chartType.toLowerCase()} chart${input.title ? ` **"${input.title}"**` : ''} (ID: ${chartId}).`
    };
  })
  .build();
