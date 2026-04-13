import { SlateTool } from 'slates';
import { createClient } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let generateImage = SlateTool.create(spec, {
  name: 'Generate Image',
  key: 'generate_image',
  description: `Generate or edit images using Gemini's native image generation capabilities or Imagen models. Supports text-to-image generation and image editing with text prompts. Returns generated images as base64-encoded data.`,
  instructions: [
    'Use "gemini-2.0-flash-exp" or "imagen-3.0-generate-002" as the model for image generation.',
    'Set responseMimeType to "image/png" or "image/jpeg" for the desired output format.',
    'For image editing, provide an existing image via referenceImageBase64 along with your text prompt describing the desired changes.'
  ],
  constraints: [
    'Image generation capabilities vary by model. Not all models support image output.',
    'Generated images are subject to safety filters and content policies.'
  ],
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      model: z
        .string()
        .describe(
          'Model ID for image generation (e.g. "gemini-2.0-flash-exp", "imagen-3.0-generate-002")'
        ),
      prompt: z
        .string()
        .describe('Text prompt describing the image to generate or edits to make'),
      referenceImageBase64: z
        .string()
        .optional()
        .describe('Base64-encoded reference image for editing tasks'),
      referenceImageMimeType: z
        .string()
        .optional()
        .describe('MIME type of the reference image (e.g. "image/png", "image/jpeg")'),
      responseMimeType: z
        .enum(['image/png', 'image/jpeg'])
        .optional()
        .describe('Desired output image format'),
      numberOfImages: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe('Number of images to generate'),
      aspectRatio: z
        .string()
        .optional()
        .describe('Aspect ratio (e.g. "1:1", "16:9", "4:3", "3:4", "9:16")'),
      negativePrompt: z
        .string()
        .optional()
        .describe('Description of what to avoid in the generated image (Imagen models only)')
    })
  )
  .output(
    z.object({
      images: z
        .array(
          z.object({
            base64Data: z.string().describe('Base64-encoded image data'),
            mimeType: z.string().describe('MIME type of the generated image')
          })
        )
        .describe('Generated images')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);

    let parts: Array<any> = [{ text: ctx.input.prompt }];

    if (ctx.input.referenceImageBase64 && ctx.input.referenceImageMimeType) {
      parts.unshift({
        inlineData: {
          mimeType: ctx.input.referenceImageMimeType,
          data: ctx.input.referenceImageBase64
        }
      });
    }

    let generationConfig: Record<string, any> = {};
    if (ctx.input.responseMimeType)
      generationConfig.responseMimeType = ctx.input.responseMimeType;
    if (ctx.input.numberOfImages) generationConfig.candidateCount = ctx.input.numberOfImages;
    if (ctx.input.aspectRatio) generationConfig.aspectRatio = ctx.input.aspectRatio;
    if (ctx.input.negativePrompt) generationConfig.negativePrompt = ctx.input.negativePrompt;

    let result = await client.generateContent(ctx.input.model, {
      contents: [{ role: 'user', parts }],
      generationConfig: Object.keys(generationConfig).length > 0 ? generationConfig : undefined
    });

    let images: Array<{ base64Data: string; mimeType: string }> = [];

    for (let candidate of result.candidates ?? []) {
      for (let part of candidate.content?.parts ?? []) {
        if (part.inlineData) {
          images.push({
            base64Data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
          });
        }
      }
    }

    return {
      output: { images },
      message: `Generated ${images.length} image(s) using **${ctx.input.model}**.`
    };
  })
  .build();
