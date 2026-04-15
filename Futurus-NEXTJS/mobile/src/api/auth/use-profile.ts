import type { User } from './types';

import { createQuery } from 'react-query-kit';
import { client } from '../common';

type Response = User;

export const useProfile = createQuery<Response>({
  queryKey: ['profile'],
  fetcher: () => client.get(`/auth/profile`).then(response => response.data),
});
