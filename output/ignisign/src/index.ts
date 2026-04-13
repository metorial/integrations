import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSignatureRequest,
  getSignatureRequest,
  listSignatureRequests,
  manageSignatureRequest,
  createSigner,
  getSigner,
  listSigners,
  updateSigner,
  manageDocument,
  uploadDocumentContent,
  getSignatureProof,
  listSignatureProfiles,
  listSignerProfiles,
  sealDocument,
  getApplicationContext,
} from './tools';
import {
  signatureRequestEvents,
  signatureEvents,
  signerEvents,
  signatureProofEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSignatureRequest,
    getSignatureRequest,
    listSignatureRequests,
    manageSignatureRequest,
    createSigner,
    getSigner,
    listSigners,
    updateSigner,
    manageDocument,
    uploadDocumentContent,
    getSignatureProof,
    listSignatureProfiles,
    listSignerProfiles,
    sealDocument,
    getApplicationContext,
  ],
  triggers: [
    signatureRequestEvents,
    signatureEvents,
    signerEvents,
    signatureProofEvents,
  ],
});
