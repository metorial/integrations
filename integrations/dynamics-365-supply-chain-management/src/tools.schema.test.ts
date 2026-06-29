import { describeMcpCompatibleToolSchemas } from '@slates/test';
import { provider } from './index';

describeMcpCompatibleToolSchemas(
  'Dynamics 365 Supply Chain Management tool input schemas',
  provider.actions
);
