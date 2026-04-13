import { Slate } from 'slates';
import { spec } from './spec';
import {
  recognizePlate,
  blurImage,
  recognizeVin,
  recognizeTrailer,
  recognizeUsdot,
  recognizeContainer,
  recognizeBoat,
  getUsage
} from './tools';
import { plateRecognized } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    recognizePlate,
    blurImage,
    recognizeVin,
    recognizeTrailer,
    recognizeUsdot,
    recognizeContainer,
    recognizeBoat,
    getUsage
  ],
  triggers: [plateRecognized]
});
