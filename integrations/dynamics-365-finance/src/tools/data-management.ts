import {
  createDynamicsFinOpsClient,
  createFinOpsExecutionId,
  dataManagementPackageOperationInputSchema,
  dynamicsFinOpsServiceError,
  validateDataManagementPackageOperationInput
} from '@slates/dynamics-finops-recipes';
import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import type { FinOpsToolContext } from './shared';

let connectionInputFields = {
  baseUrl: z
    .string()
    .optional()
    .describe('Override Finance and Operations environment URL for this request.'),
  environmentUrl: z.string().optional().describe('Alias for baseUrl.')
};

let resolveBaseUrl = (ctx: FinOpsToolContext) => {
  let baseUrl =
    ctx.input.baseUrl ??
    ctx.input.environmentUrl ??
    ctx.config?.baseUrl ??
    ctx.config?.environmentUrl ??
    ctx.auth.environmentUrl;

  if (!baseUrl) {
    throw dynamicsFinOpsServiceError(
      'Finance and Operations baseUrl or environmentUrl is required.'
    );
  }

  return baseUrl;
};

let createClient = (ctx: FinOpsToolContext) =>
  createDynamicsFinOpsClient({
    auth: {
      token: ctx.auth.token
    },
    config: {
      baseUrl: resolveBaseUrl(ctx),
      defaultLegalEntity: ctx.config?.defaultLegalEntity
    }
  });

let stringResult = (value: unknown) => (typeof value === 'string' ? value : undefined);

export let runDataManagementPackageOperation = SlateTool.create(spec, {
  name: 'Run Finance Data Management Package Operation',
  key: 'run_data_management_package_operation',
  description:
    'Start or inspect Dynamics 365 Finance Data Management package export/import workflows. File bytes are not returned in JSON output.',
  instructions: [
    'Use export_to_package or import_from_package to start package workflows, then poll get_execution_summary_status with the returned executionId.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(dataManagementPackageOperationInputSchema.extend(connectionInputFields))
  .output(
    z.object({
      action: z.string(),
      executionId: z.string().optional(),
      status: z.string().optional(),
      isTerminal: z.boolean().optional(),
      isSuccess: z.boolean().optional(),
      url: z.string().optional(),
      result: z.unknown().optional()
    })
  )
  .handleInvocation(async rawCtx => {
    let ctx = rawCtx as FinOpsToolContext & {
      input: FinOpsToolContext['input'] &
        z.infer<typeof dataManagementPackageOperationInputSchema>;
    };
    let input = validateDataManagementPackageOperationInput(ctx.input);
    let client = createClient(ctx);

    if (input.action === 'export_to_package') {
      let executionId = input.executionId ?? createFinOpsExecutionId('finance-export');
      let result = await client.exportToPackage({
        definitionGroupId: input.definitionGroupId ?? '',
        packageName: input.packageName ?? '',
        executionId,
        reExecute: input.reExecute,
        legalEntityId: input.legalEntityId
      });

      return {
        output: {
          action: input.action,
          executionId,
          result
        },
        message: `Started Finance Data Management export **${executionId}**.`
      };
    }

    if (input.action === 'import_from_package') {
      let executionId = input.executionId ?? createFinOpsExecutionId('finance-import');
      let result = await client.importFromPackage({
        definitionGroupId: input.definitionGroupId ?? '',
        packageUrl: input.packageUrl ?? '',
        executionId,
        execute: input.execute,
        overwrite: input.overwrite,
        legalEntityId: input.legalEntityId
      });

      return {
        output: {
          action: input.action,
          executionId,
          result
        },
        message: `Started Finance Data Management import **${executionId}**.`
      };
    }

    if (input.action === 'get_execution_summary_status') {
      let status = await client.getExecutionSummaryStatus({
        executionId: input.executionId ?? ''
      });

      return {
        output: {
          action: input.action,
          executionId: input.executionId,
          status: status.status,
          isTerminal: status.isTerminal,
          isSuccess: status.isSuccess,
          result: status.rawStatus
        },
        message: `Finance Data Management execution **${input.executionId}** is **${status.status}**.`
      };
    }

    let result =
      input.action === 'get_execution_summary_page_url'
        ? await client.getExecutionSummaryPageUrl({ executionId: input.executionId ?? '' })
        : input.action === 'get_exported_package_url'
          ? await client.getExportedPackageUrl({ executionId: input.executionId ?? '' })
          : await client.getImportStagingErrorFileUrl({
              executionId: input.executionId ?? ''
            });

    return {
      output: {
        action: input.action,
        executionId: input.executionId,
        url: stringResult(result),
        result
      },
      message: `Retrieved Finance Data Management ${input.action.replace(/_/g, ' ')} result.`
    };
  })
  .build();
