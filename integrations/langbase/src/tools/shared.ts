import { z } from 'zod';

export let functionToolSchema = z.object({
  name: z.string().describe('Function name exposed to the model'),
  description: z.string().optional().describe('Function description exposed to the model'),
  parameters: z
    .record(z.string(), z.any())
    .optional()
    .describe('JSON Schema parameters for the function')
});

export let mapFunctionTools = (
  tools: Array<z.infer<typeof functionToolSchema>> | undefined
) =>
  tools?.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      ...(tool.description !== undefined ? { description: tool.description } : {}),
      ...(tool.parameters !== undefined ? { parameters: tool.parameters } : {})
    }
  }));

export let mapMemoryNames = (memoryNames: string[] | undefined) =>
  memoryNames?.map(name => ({ name }));
