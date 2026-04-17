import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { z } from 'zod';
import { provider } from './index';

type GoogleSlidesFixtures = {
  spreadsheetId?: string;
  chartId?: number;
};

type GoogleSlidesContext = ToolE2EContext<GoogleSlidesFixtures>;

let imageUrl = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';

let sanitizeToken = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(-40) || 'e2e';

let createObjectId = (runId: string, label: string) =>
  `slates_${sanitizeToken(label).slice(0, 12)}_${sanitizeToken(runId).slice(-30)}`.slice(0, 50);

let createPresentationTitle = (runId: string) =>
  `slates-e2e-google-slides-${sanitizeToken(runId).toLowerCase()}`;

let ptToEmu = (value: number) => value * 12700;

let deleteDriveFile = async (token: string, fileId: string) => {
  let response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error(
      `Drive file delete failed with ${response.status}: ${await response.text()}`
    );
  }
};

let getPresentation = async (ctx: GoogleSlidesContext, presentationId: string) => {
  let result = await ctx.invokeTool('get_presentation', { presentationId });
  return result.output;
};

let findSlide = (slides: Array<Record<string, any>>, slideObjectId: string) => {
  let slide = slides.find(candidate => candidate.objectId === slideObjectId);
  if (!slide) {
    throw new Error(`Expected slide ${slideObjectId} to exist in the presentation.`);
  }
  return slide;
};

let findElement = (slide: Record<string, any>, elementObjectId: string) => {
  let element = slide.pageElements?.find(
    (candidate: { objectId?: string }) => candidate.objectId === elementObjectId
  );
  if (!element) {
    throw new Error(`Expected element ${elementObjectId} to exist on slide ${slide.objectId}.`);
  }
  return element;
};

let getElementText = (element: Record<string, any>) =>
  (
    element.shape?.text?.textElements
      ?.map((textElement: { textRun?: { content?: string } }) => textElement.textRun?.content ?? '')
      .join('') ?? ''
  ).trim();

let getChartSourceOrSkip = (
  ctx: GoogleSlidesContext,
  scenarioName: string
): { spreadsheetId: string; chartId: number } | null => {
  let { spreadsheetId, chartId } = ctx.fixtures;

  if (typeof spreadsheetId !== 'string' || !spreadsheetId || typeof chartId !== 'number') {
    console.log(
      `[google-slides e2e] Skipping ${scenarioName}: embed_sheets_chart requires ` +
        `SLATES_E2E_FIXTURES with spreadsheetId and chartId.`
    );
    return null;
  }

  return {
    spreadsheetId,
    chartId
  };
};

let createBlankSlide = async (ctx: GoogleSlidesContext, presentationId: string) => {
  let result = await ctx.invokeTool('manage_slides', {
    presentationId,
    action: 'create',
    predefinedLayout: 'BLANK'
  });

  let slideObjectId = result.output.createdSlideId;
  if (typeof slideObjectId !== 'string') {
    throw new Error('manage_slides create did not return a createdSlideId.');
  }

  return slideObjectId;
};

let addTextBox = async (
  ctx: GoogleSlidesContext,
  presentationId: string,
  slideObjectId: string,
  options?: {
    widthPt?: number;
    heightPt?: number;
    translateXPt?: number;
    translateYPt?: number;
  }
) => {
  let result = await ctx.invokeTool('add_shape', {
    presentationId,
    slideObjectId,
    shapeType: 'TEXT_BOX',
    widthPt: options?.widthPt ?? 240,
    heightPt: options?.heightPt ?? 80,
    translateXPt: options?.translateXPt ?? 36,
    translateYPt: options?.translateYPt ?? 36
  });

  let createdShapeId = result.output.createdShapeId;
  if (typeof createdShapeId !== 'string') {
    throw new Error('add_shape did not return a createdShapeId.');
  }

  return createdShapeId;
};

export let googleSlidesToolE2E = defineSlateToolE2EIntegration<GoogleSlidesFixtures>({
  fixturesSchema: z.object({
    spreadsheetId: z.string().optional(),
    chartId: z.coerce.number().optional()
  }),
  resources: {
    presentation: {
      create: async ctx => {
        let title = createPresentationTitle(ctx.runId);
        let result = await ctx.invokeTool('create_presentation', { title });
        return {
          ...result.output,
          title
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.presentationId !== 'string') {
            return;
          }

          await deleteDriveFile(String(ctx.auth.token), value.presentationId);
        }
      }
    }
  },
  scenarioOverrides: {
    create_presentation: {
      name: 'create_presentation creates the shared disposable presentation',
      use: ['presentation'],
      run: async () => {}
    },
    get_presentation: {
      name: 'get_presentation returns the disposable presentation structure',
      use: ['presentation'],
      run: async ctx => {
        let presentation = ctx.resource('presentation');
        let readBack = await ctx.invokeTool('get_presentation', {
          presentationId: String(presentation.presentationId)
        });

        if (readBack.output.presentationId !== String(presentation.presentationId)) {
          throw new Error('get_presentation did not return the tracked presentation.');
        }

        if ((readBack.output.slideCount ?? 0) < 1) {
          throw new Error('get_presentation did not return any slides.');
        }
      }
    },
    manage_slides: {
      name: 'manage_slides creates, duplicates, moves, and deletes suite-owned slides',
      use: ['presentation'],
      run: async ctx => {
        let presentationId = String(ctx.resource('presentation').presentationId);

        let created = await ctx.invokeTool('manage_slides', {
          presentationId,
          action: 'create',
          predefinedLayout: 'BLANK'
        });
        let createdSlideId = created.output.createdSlideId;
        if (typeof createdSlideId !== 'string') {
          throw new Error('manage_slides create did not return a createdSlideId.');
        }

        let duplicated = await ctx.invokeTool('manage_slides', {
          presentationId,
          action: 'duplicate',
          slideObjectId: createdSlideId
        });
        let duplicatedSlideId = duplicated.output.createdSlideId;
        if (typeof duplicatedSlideId !== 'string') {
          throw new Error('manage_slides duplicate did not return a createdSlideId.');
        }

        await ctx.invokeTool('manage_slides', {
          presentationId,
          action: 'move',
          slideObjectId: duplicatedSlideId,
          insertionIndex: 0
        });

        await ctx.invokeTool('manage_slides', {
          presentationId,
          action: 'delete',
          slideObjectId: duplicatedSlideId
        });

        let readBack = await getPresentation(ctx, presentationId);
        let slideIds = readBack.slides.map((slide: { objectId: string }) => slide.objectId);

        if (!slideIds.includes(createdSlideId)) {
          throw new Error('manage_slides did not leave the created slide in the presentation.');
        }

        if (slideIds.includes(duplicatedSlideId)) {
          throw new Error('manage_slides delete did not remove the duplicated slide.');
        }
      }
    },
    edit_text: {
      name: 'edit_text inserts, styles, bullets, and deletes text in a suite-owned shape',
      use: ['presentation'],
      run: async ctx => {
        let presentationId = String(ctx.resource('presentation').presentationId);
        let slideObjectId = await createBlankSlide(ctx, presentationId);
        let elementObjectId = await addTextBox(ctx, presentationId, slideObjectId, {
          widthPt: 280,
          heightPt: 120
        });
        let text = 'Alpha\nBeta\nGamma';

        await ctx.invokeTool('edit_text', {
          presentationId,
          elementObjectId,
          action: 'insert',
          text,
          insertionIndex: 0
        });

        await ctx.invokeTool('edit_text', {
          presentationId,
          elementObjectId,
          action: 'style',
          startIndex: 0,
          endIndex: 5,
          bold: true,
          fontSize: 18
        });

        await ctx.invokeTool('edit_text', {
          presentationId,
          elementObjectId,
          action: 'bullets',
          startIndex: 0,
          endIndex: text.length
        });

        await ctx.invokeTool('edit_text', {
          presentationId,
          elementObjectId,
          action: 'delete',
          startIndex: 6,
          endIndex: 11
        });

        let slide = findSlide((await getPresentation(ctx, presentationId)).slides, slideObjectId);
        let editedText = getElementText(findElement(slide, elementObjectId));

        if (!editedText.includes('Alpha') || !editedText.includes('Gamma')) {
          throw new Error('edit_text did not preserve the expected text content.');
        }

        if (editedText.includes('Beta')) {
          throw new Error('edit_text delete did not remove the targeted text.');
        }
      }
    },
    replace_text: {
      name: 'replace_text fills placeholders inside a suite-owned slide',
      use: ['presentation'],
      run: async ctx => {
        let presentationId = String(ctx.resource('presentation').presentationId);
        let slideObjectId = await createBlankSlide(ctx, presentationId);
        let elementObjectId = await addTextBox(ctx, presentationId, slideObjectId, {
          widthPt: 300,
          heightPt: 100
        });
        let customerName = ctx.namespaced('customer');
        let cityName = ctx.namespaced('city');

        await ctx.invokeTool('edit_text', {
          presentationId,
          elementObjectId,
          action: 'insert',
          text: 'Customer: {{customer_name}}\nCity: {{city_name}}',
          insertionIndex: 0
        });

        let replaced = await ctx.invokeTool('replace_text', {
          presentationId,
          replacements: [
            {
              findText: '{{customer_name}}',
              replaceText: customerName
            },
            {
              findText: '{{city_name}}',
              replaceText: cityName
            }
          ]
        });

        if ((replaced.output.replacementCount ?? 0) < 2) {
          throw new Error('replace_text did not report both placeholder replacements.');
        }

        let slide = findSlide((await getPresentation(ctx, presentationId)).slides, slideObjectId);
        let content = getElementText(findElement(slide, elementObjectId));

        if (!content.includes(customerName) || !content.includes(cityName)) {
          throw new Error('replace_text did not persist the replacement values.');
        }
      }
    },
    add_image: [
      {
        name: 'add_image inserts an image onto a suite-owned slide',
        use: ['presentation'],
        run: async ctx => {
          let presentationId = String(ctx.resource('presentation').presentationId);
          let slideObjectId = await createBlankSlide(ctx, presentationId);
          let inserted = await ctx.invokeTool('add_image', {
            presentationId,
            mode: 'insert',
            slideObjectId,
            imageUrl,
            widthPt: 120,
            heightPt: 40,
            translateXPt: 48,
            translateYPt: 48
          });
          let imageObjectId = inserted.output.createdImageId;
          if (typeof imageObjectId !== 'string') {
            throw new Error('add_image insert did not return a createdImageId.');
          }

          let slide = findSlide((await getPresentation(ctx, presentationId)).slides, slideObjectId);
          let image = findElement(slide, imageObjectId);
          if (!image.image) {
            throw new Error('add_image insert did not create an image element.');
          }
        }
      },
      {
        name: 'add_image replaces placeholder shapes with an image',
        use: ['presentation'],
        run: async ctx => {
          let presentationId = String(ctx.resource('presentation').presentationId);
          let slideObjectId = await createBlankSlide(ctx, presentationId);
          let placeholderId = await addTextBox(ctx, presentationId, slideObjectId);
          let placeholderText = ctx.namespaced('image-placeholder');

          await ctx.invokeTool('edit_text', {
            presentationId,
            elementObjectId: placeholderId,
            action: 'insert',
            text: placeholderText,
            insertionIndex: 0
          });

          let replaced = await ctx.invokeTool('add_image', {
            presentationId,
            mode: 'replace_shapes',
            imageUrl,
            findText: placeholderText,
            replaceMethod: 'CENTER_INSIDE'
          });

          if ((replaced.output.shapesReplaced ?? 0) < 1) {
            throw new Error('add_image replace_shapes did not replace the placeholder shape.');
          }
        }
      }
    ],
    add_shape: {
      name: 'add_shape creates a text box on a suite-owned slide',
      use: ['presentation'],
      run: async ctx => {
        let presentationId = String(ctx.resource('presentation').presentationId);
        let slideObjectId = await createBlankSlide(ctx, presentationId);
        let createdShapeId = await addTextBox(ctx, presentationId, slideObjectId);

        let slide = findSlide((await getPresentation(ctx, presentationId)).slides, slideObjectId);
        findElement(slide, createdShapeId);
      }
    },
    manage_speaker_notes: {
      name: 'manage_speaker_notes updates and reads notes on a suite-owned slide',
      use: ['presentation'],
      run: async ctx => {
        let presentationId = String(ctx.resource('presentation').presentationId);
        let slideObjectId = await createBlankSlide(ctx, presentationId);
        let notesText = ctx.namespaced('speaker notes');

        await ctx.invokeTool('manage_speaker_notes', {
          presentationId,
          slideObjectId,
          action: 'update',
          notesText
        });

        let readBack = await ctx.invokeTool('manage_speaker_notes', {
          presentationId,
          slideObjectId,
          action: 'read'
        });

        if (!String(readBack.output.notesText ?? '').includes(notesText)) {
          throw new Error('manage_speaker_notes did not return the updated notes text.');
        }
      }
    },
    embed_sheets_chart: {
      name: 'embed_sheets_chart embeds and refreshes a linked chart',
      use: ['presentation'],
      run: async ctx => {
        let chartSource = getChartSourceOrSkip(ctx, 'embed_sheets_chart');
        if (!chartSource) {
          return;
        }

        let presentationId = String(ctx.resource('presentation').presentationId);
        let slideObjectId = await createBlankSlide(ctx, presentationId);

        let embedded = await ctx.invokeTool('embed_sheets_chart', {
          presentationId,
          action: 'embed',
          spreadsheetId: String(chartSource.spreadsheetId),
          chartId: Number(chartSource.chartId),
          slideObjectId,
          widthPt: 320,
          heightPt: 180,
          linkingMode: 'LINKED'
        });
        let chartObjectId = embedded.output.chartObjectId;
        if (typeof chartObjectId !== 'string') {
          throw new Error('embed_sheets_chart embed did not return a chartObjectId.');
        }

        await ctx.invokeTool('embed_sheets_chart', {
          presentationId,
          action: 'refresh',
          chartObjectId
        });

        let slide = findSlide((await getPresentation(ctx, presentationId)).slides, slideObjectId);
        let chart = findElement(slide, chartObjectId);
        if (!chart.sheetsChart) {
          throw new Error('embed_sheets_chart did not create a Sheets chart element.');
        }
      }
    },
    batch_update: {
      name: 'batch_update applies multiple raw requests atomically',
      use: ['presentation'],
      run: async ctx => {
        let presentationId = String(ctx.resource('presentation').presentationId);
        let slideObjectId = createObjectId(ctx.runId, 'batch_slide');
        let shapeObjectId = createObjectId(ctx.runId, 'batch_shape');
        let text = ctx.namespaced('batch text');

        await ctx.invokeTool('batch_update', {
          presentationId,
          requests: [
            {
              createSlide: {
                objectId: slideObjectId,
                slideLayoutReference: {
                  predefinedLayout: 'BLANK'
                }
              }
            },
            {
              createShape: {
                objectId: shapeObjectId,
                shapeType: 'TEXT_BOX',
                elementProperties: {
                  pageObjectId: slideObjectId,
                  size: {
                    width: { magnitude: 260, unit: 'PT' },
                    height: { magnitude: 80, unit: 'PT' }
                  },
                  transform: {
                    scaleX: 1,
                    scaleY: 1,
                    translateX: ptToEmu(36),
                    translateY: ptToEmu(36),
                    unit: 'EMU'
                  }
                }
              }
            },
            {
              insertText: {
                objectId: shapeObjectId,
                insertionIndex: 0,
                text
              }
            }
          ]
        });

        let slide = findSlide((await getPresentation(ctx, presentationId)).slides, slideObjectId);
        let content = getElementText(findElement(slide, shapeObjectId));

        if (!content.includes(text)) {
          throw new Error('batch_update did not create the expected text box content.');
        }
      }
    },
    delete_element: {
      name: 'delete_element removes a suite-owned page element',
      use: ['presentation'],
      run: async ctx => {
        let presentationId = String(ctx.resource('presentation').presentationId);
        let slideObjectId = await createBlankSlide(ctx, presentationId);
        let elementObjectId = await addTextBox(ctx, presentationId, slideObjectId);

        await ctx.invokeTool('delete_element', {
          presentationId,
          elementObjectId
        });

        let slide = findSlide((await getPresentation(ctx, presentationId)).slides, slideObjectId);
        if (
          slide.pageElements?.some(
            (candidate: { objectId?: string }) => candidate.objectId === elementObjectId
          )
        ) {
          throw new Error('delete_element did not remove the targeted element.');
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleSlidesToolE2E
});
