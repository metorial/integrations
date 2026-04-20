import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { provider } from './index';

let createValidationInput = () => ({
  addressLines: ['1600 Amphitheatre Parkway'],
  locality: 'Mountain View',
  administrativeArea: 'CA',
  postalCode: '94043',
  regionCode: 'US'
});

let validateCanonicalAddress = async (ctx: {
  invokeTool(toolId: string, input: Record<string, any>): Promise<{ output: Record<string, any> }>;
}) => {
  let result = await ctx.invokeTool('validate_address', createValidationInput());
  let responseId = result.output.responseId;

  if (typeof responseId !== 'string' || responseId.length === 0) {
    throw new Error('validate_address did not return a responseId.');
  }

  return result.output;
};

export let googleAddressValidationToolE2E = defineSlateToolE2EIntegration({
  scenarioOverrides: {
    validate_address: {
      name: 'validate_address validates a canonical US mailing address',
      run: async ctx => {
        let validation = await validateCanonicalAddress(ctx);

        if (!validation.verdict || typeof validation.verdict !== 'object') {
          throw new Error('validate_address did not return a verdict.');
        }
      }
    },
    provide_validation_feedback: {
      name: 'provide_validation_feedback submits feedback for the validated address',
      run: async ctx => {
        let validation = await validateCanonicalAddress(ctx);
        let result = await ctx.invokeTool('provide_validation_feedback', {
          responseId: String(validation.responseId),
          conclusion: 'VALIDATED_VERSION_USED'
        });

        if (!result.output.success) {
          throw new Error('provide_validation_feedback did not report success.');
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleAddressValidationToolE2E
});
