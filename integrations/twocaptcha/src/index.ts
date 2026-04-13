import { Slate } from 'slates';
import { spec } from './spec';
import {
  solveCaptcha,
  solveImageCaptcha,
  getTaskResult,
  reportSolution,
  getBalance
} from './tools';
import { captchaSolved } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [solveCaptcha, solveImageCaptcha, getTaskResult, reportSolution, getBalance],
  triggers: [captchaSolved]
});
