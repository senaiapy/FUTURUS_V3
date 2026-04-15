import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {IntlErrorCode} from 'next-intl';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Missing translations are expected during development
        // Log only in development, silently ignore in production
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] ${error.message}`);
        }
      } else {
        // Log other i18n errors
        console.error(error);
      }
    },
    getMessageFallback({namespace, key}) {
      // Return the key itself as a fallback instead of crashing
      return namespace ? `${namespace}.${key}` : key;
    }
  };
});
