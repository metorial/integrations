import { describeMcpCompatibleToolSchemas } from '@slates/test';
import { provider } from './index';

describeMcpCompatibleToolSchemas('Dynamics 365 Commerce tool input schemas', provider.actions);
