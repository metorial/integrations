import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPrintJob,
  getPrintJob,
  listPrintJobs,
  updatePrintJob,
  cancelPrintJob,
  listBackgrounds,
  getBackground,
  deleteBackground,
  createMailingList,
  getMailingList,
  listMailingLists,
  updateMailingList,
  deleteMailingList,
  addRecipient,
  getRecipient,
  listRecipients,
  updateRecipient,
  deleteRecipient,
} from './tools';
import {
  letterUpdated,
  mailingListAddressesValidated,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPrintJob,
    getPrintJob,
    listPrintJobs,
    updatePrintJob,
    cancelPrintJob,
    listBackgrounds,
    getBackground,
    deleteBackground,
    createMailingList,
    getMailingList,
    listMailingLists,
    updateMailingList,
    deleteMailingList,
    addRecipient,
    getRecipient,
    listRecipients,
    updateRecipient,
    deleteRecipient,
  ],
  triggers: [
    letterUpdated,
    mailingListAddressesValidated,
  ],
});
