import en from '@/translations/en.json';
import es from '@/translations/es.json';
import pt from '@/translations/pt.json';

export const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  pt: {
    translation: pt,
  },
};

export type Language = keyof typeof resources;
