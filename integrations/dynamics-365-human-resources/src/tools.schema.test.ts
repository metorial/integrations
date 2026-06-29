import { describeMcpCompatibleToolSchemas } from '@slates/test';
import { provider } from './index';

describeMcpCompatibleToolSchemas(
  'Dynamics 365 Human Resources tool input schemas',
  provider.actions
);
