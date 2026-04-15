/*
 * This file should not be modified; use `env.js` in the project root to add your client environment variables.
 * If you import `Env` from `@env`, this is the file that will be loaded.
 * You can only access the client environment variables here.
 * NOTE: We use js file so we can load the client env types
 */

import Constants from 'expo-constants';
/**
 *  @type {typeof import('../../env.js').ClientEnv}
 */
// @ts-ignore // Don't worry about TypeScript here; we know we're passing the correct environment variables to `extra` in `app.config.ts`.
const extra = Constants.expoConfig?.extra ?? {};

const _expoApiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://futurus-brasil.com/api';

const Env = {
  ...extra,
  API_URL: extra.API_URL || _expoApiUrl,
  EXPO_PUBLIC_API_URL: extra.EXPO_PUBLIC_API_URL || _expoApiUrl,
  SIMPLE_API_URL: extra.SIMPLE_API_URL || _expoApiUrl.replace(/\/api\/?$/, ''),
  IMAGE_BASE_URL: extra.IMAGE_BASE_URL || (`${_expoApiUrl.replace(/\/api\/?$/, '')}/assets/images`),
  EXPO_PUBLIC_API: extra.EXPO_PUBLIC_API || process.env.EXPO_PUBLIC_API || 'laravel',
  NAME: extra.NAME || 'FUTURUS',
  VERSION: extra.VERSION || process.env.EXPO_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_ZAP_PHONE: extra.NEXT_PUBLIC_ZAP_PHONE || '5511995009969',
};

export default Env;
