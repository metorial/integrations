import {
  SlatesNotifications,
  SlatesParticipant,
  SlatesRequests,
  SlatesResponses
} from '@slates/proto';

export type SlatesJsonObject = Record<string, any>;
export type SlatesProtocolMessage = SlatesNotifications | SlatesRequests;
export type SlatesProtocolResponse = SlatesNotifications | SlatesResponses;

export interface SlatesClientState {
  protocol: 'slates@2026-01-01';
  participants: SlatesParticipant[];
  config: SlatesJsonObject | null;
  auth: {
    authenticationMethodId: string;
    output: SlatesJsonObject;
  } | null;
  session: {
    id: string;
    state: SlatesJsonObject;
  } | null;
}

export interface SlatesMessageTransport {
  send(messages: SlatesProtocolMessage[]): Promise<SlatesProtocolResponse[]>;
  close?(): Promise<void> | void;
}

export interface SlatesProtocolClientOptions {
  transport: SlatesMessageTransport;
  participants?: SlatesParticipant[];
  state?: Partial<SlatesClientState>;
}
