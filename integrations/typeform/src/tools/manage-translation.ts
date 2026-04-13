import { SlateTool } from 'slates';
import { TypeformClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageTranslation = SlateTool.create(spec, {
  name: 'Manage Translation',
  key: 'manage_translation',
  description: `Manage form translations. Retrieve translation statuses, get translation payloads for specific languages, update translations, auto-translate a form, or delete translations.`,
  instructions: [
    'To **list statuses** of all translations, provide just the **formId**.',
    'To **retrieve** a translation, provide **formId** and **language**.',
    'To **update** a translation, provide **formId**, **language**, and **translationPayload**.',
    'To **auto-translate**, provide **formId**, **language**, and set **autoTranslate** to true.',
    'To **delete**, provide **formId**, **language**, and set **delete** to true.'
  ],
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      formId: z.string().describe('ID of the form to manage translations for'),
      language: z.string().optional().describe('Language code (e.g. "es", "fr", "de")'),
      translationPayload: z
        .any()
        .optional()
        .describe('Translation payload object to set for the language'),
      autoTranslate: z
        .boolean()
        .optional()
        .describe('Set to true to auto-translate the form into the specified language'),
      delete: z
        .boolean()
        .optional()
        .describe('Set to true to delete the translation for the specified language')
    })
  )
  .output(
    z.object({
      formId: z.string().describe('Form ID'),
      language: z.string().optional().describe('Language code'),
      statuses: z
        .array(
          z.object({
            language: z.string().describe('Language code'),
            status: z.string().optional().describe('Translation status')
          })
        )
        .optional()
        .describe('Translation statuses for all languages'),
      translation: z
        .any()
        .optional()
        .describe('Translation payload for the requested language'),
      deleted: z.boolean().optional().describe('Whether the translation was deleted'),
      autoTranslated: z.boolean().optional().describe('Whether auto-translation was triggered')
    })
  )
  .handleInvocation(async ctx => {
    let client = new TypeformClient({
      token: ctx.auth.token,
      baseUrl: ctx.config.baseUrl
    });

    // Delete
    if (ctx.input.delete && ctx.input.language) {
      await client.deleteTranslation(ctx.input.formId, ctx.input.language);
      return {
        output: {
          formId: ctx.input.formId,
          language: ctx.input.language,
          deleted: true
        },
        message: `Deleted **${ctx.input.language}** translation for form \`${ctx.input.formId}\`.`
      };
    }

    // Auto-translate
    if (ctx.input.autoTranslate && ctx.input.language) {
      await client.autoTranslate(ctx.input.formId, ctx.input.language);
      return {
        output: {
          formId: ctx.input.formId,
          language: ctx.input.language,
          autoTranslated: true
        },
        message: `Auto-translated form \`${ctx.input.formId}\` to **${ctx.input.language}**.`
      };
    }

    // Update translation
    if (ctx.input.translationPayload && ctx.input.language) {
      let result = await client.updateTranslation(
        ctx.input.formId,
        ctx.input.language,
        ctx.input.translationPayload
      );
      return {
        output: {
          formId: ctx.input.formId,
          language: ctx.input.language,
          translation: result
        },
        message: `Updated **${ctx.input.language}** translation for form \`${ctx.input.formId}\`.`
      };
    }

    // Retrieve specific translation
    if (ctx.input.language) {
      let result = await client.getTranslation(ctx.input.formId, ctx.input.language);
      return {
        output: {
          formId: ctx.input.formId,
          language: ctx.input.language,
          translation: result
        },
        message: `Retrieved **${ctx.input.language}** translation for form \`${ctx.input.formId}\`.`
      };
    }

    // List translation statuses
    let result = await client.getTranslationStatuses(ctx.input.formId);
    let statuses = (result.translations || result || []).map((t: any) => ({
      language: t.language || t.locale,
      status: t.status
    }));

    return {
      output: {
        formId: ctx.input.formId,
        statuses
      },
      message: `Found **${statuses.length}** translations for form \`${ctx.input.formId}\`.`
    };
  })
  .build();
