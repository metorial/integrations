import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageProduct,
  listProducts,
  getProduct,
  manageProductModule,
  listProductModules,
  manageLicenseTemplate,
  listLicenseTemplates,
  manageLicensee,
  listLicensees,
  validateLicensee,
  transferLicenses,
  manageLicense,
  listLicenses,
  manageBundle,
  obtainBundle,
  createToken,
  listTokens,
  listTransactions,
  getTransaction
} from './tools';
import { licensingEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageProduct,
    listProducts,
    getProduct,
    manageProductModule,
    listProductModules,
    manageLicenseTemplate,
    listLicenseTemplates,
    manageLicensee,
    listLicensees,
    validateLicensee,
    transferLicenses,
    manageLicense,
    listLicenses,
    manageBundle,
    obtainBundle,
    createToken,
    listTokens,
    listTransactions,
    getTransaction
  ],
  triggers: [licensingEvents]
});
