import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let updateFormTool = SlateTool.create(spec, {
  name: 'Update Form',
  key: 'update_form',
  description: `Update an existing JotForm form's properties, add new questions, or modify existing questions. Combines property updates, question additions, and question management in one tool.`,
  instructions: [
    'To update form-level settings (title, height, styles, etc.), use the "properties" field.',
    'To add a new question, use "newQuestion" with at least "type" and "text".',
    'To delete a question, provide "deleteQuestionId".'
  ]
})
  .input(
    z.object({
      formId: z.string().describe('ID of the form to update'),
      properties: z
        .record(z.string(), z.any())
        .optional()
        .describe('Form-level properties to update (e.g., title, height, thankurl)'),
      newQuestion: z
        .record(z.string(), z.any())
        .optional()
        .describe('A new question to add to the form. Must include "type" and "text".'),
      deleteQuestionId: z
        .string()
        .optional()
        .describe('ID of a question to remove from the form')
    })
  )
  .output(
    z.object({
      formId: z.string().describe('ID of the updated form'),
      propertiesUpdated: z.boolean().describe('Whether properties were updated'),
      questionAdded: z.boolean().describe('Whether a new question was added'),
      questionDeleted: z.boolean().describe('Whether a question was deleted')
    })
  )
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      apiDomain: ctx.config.apiDomain
    });

    let propertiesUpdated = false;
    let questionAdded = false;
    let questionDeleted = false;

    if (ctx.input.properties && Object.keys(ctx.input.properties).length > 0) {
      await client.updateFormProperties(ctx.input.formId, ctx.input.properties);
      propertiesUpdated = true;
    }

    if (ctx.input.newQuestion && Object.keys(ctx.input.newQuestion).length > 0) {
      await client.addFormQuestion(ctx.input.formId, ctx.input.newQuestion);
      questionAdded = true;
    }

    if (ctx.input.deleteQuestionId) {
      await client.deleteFormQuestion(ctx.input.formId, ctx.input.deleteQuestionId);
      questionDeleted = true;
    }

    let actions: string[] = [];
    if (propertiesUpdated) actions.push('updated properties');
    if (questionAdded) actions.push('added a question');
    if (questionDeleted) actions.push('deleted a question');

    return {
      output: {
        formId: ctx.input.formId,
        propertiesUpdated,
        questionAdded,
        questionDeleted
      },
      message: actions.length > 0
        ? `Form ${ctx.input.formId}: ${actions.join(', ')}.`
        : `No changes made to form ${ctx.input.formId}.`
    };
  })
  .build();
