import type { AppSettings } from './types';
import { client } from '../common';

export const settingsApi = {
  getSettings: async (): Promise<AppSettings> => {
    const { data } = await client.get<AppSettings>('/settings');
    return data;
  },
};

export * from './types';
export * from './use-2fa';
