import { Buffer } from 'node:buffer';
import { createBase64Attachment, createTextAttachment, SlateTool } from 'slates';
import { z } from 'zod';
import { SsbClient } from '../lib/client';
import { summarizeJsonData } from '../lib/metadata';
import { ssbServiceError } from '../lib/errors';
import { spec } from '../spec';

let languageSchema = z.enum(['en', 'no']);

let outputFormatSchema = z.enum(['json-stat2', 'json-px', 'csv', 'xlsx', 'html', 'px']);

let outputFormatParamSchema = z.enum([
  'UseCodes',
  'UseTexts',
  'UseCodesAndTexts',
  'IncludeTitle',
  'SeparatorTab',
  'SeparatorSpace',
  'SeparatorSemicolon',
  'ExcludeZerosAndMissingValues'
]);

let selectionSchema = z.object({
  variableCode: z.string().describe('Table variable code from metadata, for example Tid.'),
  valueCodes: z
    .array(z.string())
    .min(1)
    .describe('Value codes or SSB expressions such as *, ??, top(3), from(2024), or [range(a,b)].'),
  codelist: z
    .string()
    .optional()
    .describe('Optional codelist or grouping id to apply for this variable.'),
  outputValues: z
    .enum(['aggregated', 'single'])
    .optional()
    .describe('For grouping codelists, choose aggregated group values or matching single values.')
});

let placementSchema = z.object({
  heading: z
    .array(z.string())
    .optional()
    .describe('Variables to place in the table heading for csv, xlsx, html, or px output.'),
  stub: z
    .array(z.string())
    .optional()
    .describe('Variables to place in the table stub for csv, xlsx, html, or px output.')
});

let fallbackMimeType = (format: z.infer<typeof outputFormatSchema>) => {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'html':
      return 'text/html';
    case 'px':
      return 'text/plain';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json-px':
    case 'json-stat2':
      return 'application/json';
  }
};

let normalizeContentType = (
  contentType: string | undefined,
  format: z.infer<typeof outputFormatSchema>
) => {
  if (!contentType) return fallbackMimeType(format);

  return contentType.split(';')[0]?.trim() || fallbackMimeType(format);
};

let isJsonOutput = (format: z.infer<typeof outputFormatSchema>) =>
  format === 'json-stat2' || format === 'json-px';

let validateOutputParams = (
  outputFormat: z.infer<typeof outputFormatSchema>,
  outputFormatParams: Array<z.infer<typeof outputFormatParamSchema>>
) => {
  let presentationParams = ['UseCodes', 'UseTexts', 'UseCodesAndTexts'];
  let separatorParams = ['SeparatorTab', 'SeparatorSpace', 'SeparatorSemicolon'];

  let selectedPresentation = outputFormatParams.filter(param => presentationParams.includes(param));
  if (selectedPresentation.length > 1) {
    throw ssbServiceError('Use only one of UseCodes, UseTexts, or UseCodesAndTexts.');
  }

  let selectedSeparators = outputFormatParams.filter(param => separatorParams.includes(param));
  if (selectedSeparators.length > 1) {
    throw ssbServiceError('Use only one CSV separator outputFormatParam.');
  }

  if (
    outputFormatParams.some(param => presentationParams.includes(param) || param === 'IncludeTitle') &&
    !['csv', 'xlsx', 'html'].includes(outputFormat)
  ) {
    throw ssbServiceError('UseCodes, UseTexts, UseCodesAndTexts, and IncludeTitle only apply to csv, xlsx, or html output.');
  }

  if (selectedSeparators.length > 0 && outputFormat !== 'csv') {
    throw ssbServiceError('CSV separator outputFormatParams only apply to csv output.');
  }
};

export let queryTable = SlateTool.create(spec, {
  name: 'Query Table',
  key: 'query_table',
  description:
    'Retrieve Statbank Norway – SSB table data with PxWebApi v2 selections and return JSON or file-format attachments.',
  instructions: [
    'Call get_tables with get_metadata first to discover variableCode and valueCodes.',
    'Variables marked elimination=true can be omitted; time and ContentsCode are usually not eliminable.',
    'Use POST unless you specifically need a shareable GET-style query URL.',
    'Use top(n), from(value), to(value), [range(from,to)], *, and ? expressions to keep selections robust.'
  ],
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      tableId: z.string().describe('Five digit SSB Statbank table id.'),
      language: languageSchema.optional().default('en').describe('Response language.'),
      method: z
        .enum(['post', 'get'])
        .optional()
        .default('post')
        .describe('HTTP method. POST is preferred for larger selections.'),
      selection: z
        .array(selectionSchema)
        .optional()
        .describe('Table selections. If omitted, SSB applies the table default selection.'),
      outputFormat: outputFormatSchema
        .optional()
        .default('json-stat2')
        .describe('Desired SSB output format.'),
      outputFormatParams: z
        .array(outputFormatParamSchema)
        .optional()
        .default([])
        .describe('Output formatting parameters for csv, xlsx, and html outputs.'),
      placement: placementSchema
        .optional()
        .describe('Heading and stub placement for table-like outputs.')
    })
  )
  .output(
    z.object({
      tableId: z.string().describe('Queried table id.'),
      language: z.string().describe('Response language.'),
      method: z.string().describe('HTTP method used.'),
      outputFormat: z.string().describe('SSB output format.'),
      contentType: z.string().optional().describe('MIME type returned as metadata or attachment MIME.'),
      attachmentCount: z.number().describe('Number of Slate attachments returned.'),
      label: z.string().optional().describe('JSON dataset label, when available.'),
      source: z.string().optional().describe('JSON dataset source, when available.'),
      updated: z.string().optional().describe('JSON dataset updated timestamp, when available.'),
      dimensions: z.array(z.string()).optional().describe('JSON dataset dimension ids, when available.'),
      cellCount: z.number().optional().describe('Calculated number of selected cells for JSON output.'),
      valueCount: z.number().optional().describe('Number of values in JSON output.'),
      data: z.any().optional().describe('Raw JSON data for json-stat2 or json-px output.')
    })
  )
  .handleInvocation(async ctx => {
    validateOutputParams(ctx.input.outputFormat, ctx.input.outputFormatParams);

    let client = new SsbClient();
    let result = await client.queryTable({
      tableId: ctx.input.tableId,
      language: ctx.input.language,
      method: ctx.input.method,
      selection: ctx.input.selection,
      outputFormat: ctx.input.outputFormat,
      outputFormatParams: ctx.input.outputFormatParams,
      placement: ctx.input.placement
    });
    let contentType = normalizeContentType(result.contentType, ctx.input.outputFormat);

    if (isJsonOutput(ctx.input.outputFormat)) {
      let summary = summarizeJsonData(result.data);

      return {
        output: {
          tableId: ctx.input.tableId,
          language: ctx.input.language,
          method: ctx.input.method,
          outputFormat: ctx.input.outputFormat,
          contentType,
          attachmentCount: 0,
          ...summary,
          data: result.data
        },
        message: `Retrieved **${ctx.input.outputFormat}** data for SSB table **${ctx.input.tableId}**.`
      };
    }

    if (ctx.input.outputFormat === 'xlsx') {
      let content =
        typeof result.data === 'string'
          ? Buffer.from(result.data).toString('base64')
          : Buffer.from(result.data as ArrayBuffer).toString('base64');

      return {
        output: {
          tableId: ctx.input.tableId,
          language: ctx.input.language,
          method: ctx.input.method,
          outputFormat: ctx.input.outputFormat,
          contentType,
          attachmentCount: 1
        },
        message: `Retrieved **xlsx** data for SSB table **${ctx.input.tableId}** as an attachment.`,
        attachments: [createBase64Attachment(content, contentType)]
      };
    }

    let textContent =
      typeof result.data === 'string'
        ? result.data
        : Buffer.from(result.data as ArrayBuffer).toString('utf8');

    return {
      output: {
        tableId: ctx.input.tableId,
        language: ctx.input.language,
        method: ctx.input.method,
        outputFormat: ctx.input.outputFormat,
        contentType,
        attachmentCount: 1
      },
      message: `Retrieved **${ctx.input.outputFormat}** data for SSB table **${ctx.input.tableId}** as an attachment.`,
      attachments: [createTextAttachment(textContent, contentType)]
    };
  })
  .build();
