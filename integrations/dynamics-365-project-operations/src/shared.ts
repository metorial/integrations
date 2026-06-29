import { createDynamicsFinOpsClient } from '@slates/dynamics-finops-recipes';
import { createDataverseClientFromContext } from '@slates/microsoft-dataverse-recipes';
import { projectOperationsValidationError } from './errors';

export type ProjectOperationsInvocationContext = {
  auth: {
    token?: string;
    instanceUrl?: string;
    finOpsToken?: string;
    finOpsBaseUrl?: string;
  };
  config: {
    dataverseInstanceUrl?: string;
    dataverseApiVersion?: string;
    finOpsBaseUrl?: string;
    defaultLegalEntity?: string;
    defaultPageSize?: number;
  };
};

export let createProjectOperationsDataverseClient = (
  ctx: ProjectOperationsInvocationContext,
  input: { instanceUrl?: string } = {}
) =>
  createDataverseClientFromContext(
    {
      auth: {
        token: ctx.auth.token,
        instanceUrl: ctx.auth.instanceUrl
      },
      config: {
        instanceUrl: ctx.config.dataverseInstanceUrl,
        apiVersion: ctx.config.dataverseApiVersion
      }
    },
    {
      instanceUrl: input.instanceUrl
    }
  );

export let createProjectOperationsFinOpsClient = (
  ctx: ProjectOperationsInvocationContext,
  input: {
    finOpsBaseUrl?: string;
    legalEntityId?: string;
  } = {}
) => {
  if (!ctx.auth.finOpsToken) {
    throw projectOperationsValidationError(
      'Finance handoff requires a Finance and Operations token. Reconnect with finOpsBaseUrl in auth, or use client credentials with finOpsBaseUrl.'
    );
  }

  let baseUrl = input.finOpsBaseUrl ?? ctx.auth.finOpsBaseUrl ?? ctx.config.finOpsBaseUrl;
  if (!baseUrl) {
    throw projectOperationsValidationError(
      'Finance handoff requires a Finance and Operations base URL.'
    );
  }

  return createDynamicsFinOpsClient({
    auth: {
      token: ctx.auth.finOpsToken
    },
    config: {
      baseUrl,
      defaultLegalEntity: input.legalEntityId ?? ctx.config.defaultLegalEntity
    }
  });
};
