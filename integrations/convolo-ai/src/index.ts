import { Slate } from 'slates';
import { spec } from './spec';
import { triggerCall, getSpeedToLeadReports, getDialerCallReports, getDialerStatistics } from './tools';
import { speedToLeadCallEvents, dialerCallEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [triggerCall, getSpeedToLeadReports, getDialerCallReports, getDialerStatistics],
  triggers: [speedToLeadCallEvents, dialerCallEvents],
});
