import { createAxios } from 'slates';
import { hotjarApiError, hotjarServiceError } from './errors';

export type HotjarToken = {
  accessToken: string;
  expiresAt: string;
};

export let requestHotjarAccessToken = async (
  clientId: string,
  clientSecret: string
): Promise<HotjarToken> => {
  try {
    let http = createAxios({
      baseURL: 'https://api.hotjar.io'
    });

    let params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    let response = await http.post('/v1/oauth/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    let data = response.data;
    if (!data?.access_token || typeof data.expires_in !== 'number') {
      throw hotjarServiceError(
        'Hotjar OAuth token response did not include access_token and expires_in.'
      );
    }

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
    };
  } catch (error) {
    throw hotjarApiError(error, 'OAuth token exchange');
  }
};
