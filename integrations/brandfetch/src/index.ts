import { Slate } from 'slates';
import { spec } from './spec';
import { getBrand, searchBrands, enrichTransaction, getLogoUrl } from './tools';
import { brandUpdated } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [getBrand, searchBrands, enrichTransaction, getLogoUrl],
  triggers: [brandUpdated]
});
