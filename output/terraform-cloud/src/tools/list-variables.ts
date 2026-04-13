import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { mapVariable } from '../lib/mappers';
import { z } from 'zod';

export let listVariablesTool = SlateTool.create(
  spec,
  {
    name: 'List Variables',
    key: 'list_variables',
    description: `List all Terraform and environment variables in a workspace. Returns the key, value, category, and whether each variable is sensitive or uses HCL syntax. Sensitive variable values are not returned.`,
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({
    workspaceId: z.string().describe('The workspace ID to list variables for')
  }))
  .output(z.object({
    variables: z.array(z.object({
      variableId: z.string(),
      key: z.string(),
      value: z.string(),
      description: z.string(),
      category: z.string(),
      hcl: z.boolean(),
      sensitive: z.boolean()
    }))
  }))
  .handleInvocation(async (ctx) => {
    let client = createClient(ctx);
    let response = await client.listWorkspaceVariables(ctx.input.workspaceId);
    let variables = (response.data || []).map(mapVariable);

    return {
      output: { variables },
      message: `Found **${variables.length}** variable(s) in workspace ${ctx.input.workspaceId}.`
    };
  })
  .build();
