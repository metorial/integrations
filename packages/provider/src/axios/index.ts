import type { AxiosInstance, CreateAxiosDefaults } from 'axios';
import baseAxios from 'axios';
import { getCurrentContext } from '../context/hook';
import type { SlateAxiosErrorOptions } from '../error';
import { SlateError } from '../error';

export interface SlateAxiosDefaults extends CreateAxiosDefaults {
  errorMapping?: SlateAxiosErrorOptions;
}

let applySlateInterceptors = (
  instance: AxiosInstance,
  errorMapping?: SlateAxiosErrorOptions
) => {
  instance.interceptors.request.use(
    request => {
      // Has to be called in the context of an action execution
      let ctx = getCurrentContext();
      let spec = ctx.specification;

      request.headers.set('User-Agent', `slates.dev@1.0.0/${spec.key}`);
      request.headers.set('X-Slates-Provider', spec.key);

      return request;
    },
    error => Promise.reject(error)
  );

  instance.interceptors.response.use(
    response => response,
    error => Promise.reject(SlateError.fromAxios(error, errorMapping))
  );
};

applySlateInterceptors(baseAxios);

export let createAxios = (config?: SlateAxiosDefaults) => {
  let { errorMapping, ...axiosConfig } = config ?? {};
  let instance = baseAxios.create({
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers
    }
  });

  applySlateInterceptors(instance, errorMapping);
  return instance;
};

export let axios = createAxios();
