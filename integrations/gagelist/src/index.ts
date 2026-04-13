import { Slate } from 'slates';
import { spec } from './spec';
import {
  createGage,
  getGage,
  updateGage,
  deleteGage,
  listGages,
  createCalibration,
  getCalibration,
  updateCalibration,
  deleteCalibration,
  listCalibrations,
  generateCalibrationCertificate,
  listManufacturers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  getAccountStatus,
  getAccountSettings,
  updateAccountSettings,
  getCustomFields,
  getCustomFieldValues,
  updateCustomFieldValues
} from './tools';
import { newGage, newCalibration, newManufacturer, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createGage,
    getGage,
    updateGage,
    deleteGage,
    listGages,
    createCalibration,
    getCalibration,
    updateCalibration,
    deleteCalibration,
    listCalibrations,
    generateCalibrationCertificate,
    listManufacturers,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
    getAccountStatus,
    getAccountSettings,
    updateAccountSettings,
    getCustomFields,
    getCustomFieldValues,
    updateCustomFieldValues
  ],
  triggers: [inboundWebhook, newGage, newCalibration, newManufacturer]
});
