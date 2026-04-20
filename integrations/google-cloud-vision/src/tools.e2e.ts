import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { provider } from './index';

let testImage = {
  base64Content:
    'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAtElEQVR4nO3QwQ3DIBQDUMZgnq7S/Y89pwskAhGQo/As+caXzCu/7+fYuSU9IF0A6QHpAkgPSBdAekC65dg8AFoPaq2nnX139b7VuwEw+yOjdwAAANgbYPZ9bwCsGgIAAAAAAAAAAADgrQCj7Q0AAAAAAAAA4LkAq+5m3fcGwKohAAAAAAAAAAAAAAD03V29b/VuAMz+yOgdAAAAngnw9gBID0gHQHpAOgDSA9IBkB6QzvYAf2af69cKWKQLAAAAAElFTkSuQmCC'
};

let createImageInput = () => ({
  image: { ...testImage }
});

let expectArrayField = (output: Record<string, any>, field: string) => {
  if (!Array.isArray(output[field])) {
    throw new Error(`Expected ${field} to be an array.`);
  }
};

let createScenario = (
  toolId: string,
  name: string,
  createInput: () => Record<string, any>,
  assertOutput: (output: Record<string, any>) => void
) => ({
  name,
  run: async (ctx: ToolE2EContext) => {
    let result = await ctx.invokeTool(toolId, createInput());
    assertOutput(result.output);
  }
});

export let googleCloudVisionToolE2E = defineSlateToolE2EIntegration({
  scenarioOverrides: {
    analyze_image: createScenario(
      'analyze_image',
      'analyze_image runs a multi-feature analysis for an inline image',
      () => ({
        ...createImageInput(),
        features: [
          { type: 'LABEL_DETECTION', maxResults: 3 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 3 },
          { type: 'FACE_DETECTION', maxResults: 3 },
          { type: 'LANDMARK_DETECTION', maxResults: 3 },
          { type: 'LOGO_DETECTION', maxResults: 3 },
          { type: 'TEXT_DETECTION' },
          { type: 'SAFE_SEARCH_DETECTION' },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'CROP_HINTS' },
          { type: 'WEB_DETECTION', maxResults: 3 }
        ],
        languageHints: ['en'],
        cropAspectRatios: [1, 1.5],
        includeGeoResults: true
      }),
      output => {
        if (!output.safeSearch || typeof output.safeSearch !== 'object') {
          throw new Error('Expected analyze_image to return safeSearch results.');
        }
        expectArrayField(output, 'dominantColors');
      }
    ),
    detect_labels: createScenario(
      'detect_labels',
      'detect_labels analyzes an inline image',
      () => ({
        ...createImageInput(),
        maxResults: 3
      }),
      output => expectArrayField(output, 'labels')
    ),
    detect_objects: createScenario(
      'detect_objects',
      'detect_objects analyzes an inline image',
      () => ({
        ...createImageInput(),
        maxResults: 3
      }),
      output => expectArrayField(output, 'objects')
    ),
    detect_faces: createScenario(
      'detect_faces',
      'detect_faces analyzes an inline image',
      () => ({
        ...createImageInput(),
        maxResults: 3
      }),
      output => expectArrayField(output, 'faces')
    ),
    detect_landmarks: createScenario(
      'detect_landmarks',
      'detect_landmarks analyzes an inline image',
      () => ({
        ...createImageInput(),
        maxResults: 3
      }),
      output => expectArrayField(output, 'landmarks')
    ),
    detect_logos: createScenario(
      'detect_logos',
      'detect_logos analyzes an inline image',
      () => ({
        ...createImageInput(),
        maxResults: 3
      }),
      output => expectArrayField(output, 'logos')
    ),
    detect_text: createScenario(
      'detect_text',
      'detect_text runs OCR against an inline image',
      () => ({
        ...createImageInput(),
        mode: 'text',
        languageHints: ['en']
      }),
      output => {
        if (typeof output.fullText !== 'string') {
          throw new Error('Expected detect_text to return fullText.');
        }
        expectArrayField(output, 'textBlocks');
      }
    ),
    detect_safe_search: createScenario(
      'detect_safe_search',
      'detect_safe_search analyzes an inline image',
      createImageInput,
      output => {
        for (let field of ['adult', 'spoof', 'medical', 'violence', 'racy']) {
          if (typeof output[field] !== 'string') {
            throw new Error(`Expected detect_safe_search to return ${field}.`);
          }
        }
      }
    ),
    detect_image_properties: createScenario(
      'detect_image_properties',
      'detect_image_properties analyzes an inline image',
      createImageInput,
      output => expectArrayField(output, 'dominantColors')
    ),
    get_crop_hints: createScenario(
      'get_crop_hints',
      'get_crop_hints analyzes an inline image',
      () => ({
        ...createImageInput(),
        aspectRatios: [1, 1.5]
      }),
      output => expectArrayField(output, 'cropHints')
    ),
    detect_web: createScenario(
      'detect_web',
      'detect_web analyzes an inline image',
      () => ({
        ...createImageInput(),
        maxResults: 3,
        includeGeoResults: true
      }),
      output => {
        for (let field of [
          'bestGuessLabels',
          'webEntities',
          'matchingPages',
          'fullMatchingImageUrls',
          'partialMatchingImageUrls',
          'visuallySimilarImageUrls'
        ]) {
          expectArrayField(output, field);
        }
      }
    )
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleCloudVisionToolE2E
});
