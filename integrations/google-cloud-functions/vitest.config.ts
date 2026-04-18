import { createSlatesVitestConfig } from '@slates/test/config';

export default createSlatesVitestConfig({
  test: {
    testTimeout: 10 * 60 * 1000,
    hookTimeout: 10 * 60 * 1000,
    include: ['src/**/*.test.ts', 'src/**/*.e2e.ts']
  }
});
