import { describeMcpCompatibleToolSchemas } from '@slates/test';
import { provider } from './index';

describeMcpCompatibleToolSchemas(
  'Dynamics 365 Project Operations tool input schemas',
  provider.actions
);
