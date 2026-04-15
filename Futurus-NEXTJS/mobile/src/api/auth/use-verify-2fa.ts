import type { AxiosError } from 'axios';
import type { AuthResponse } from './types';

import { createMutation } from 'react-query-kit';
import { client } from '../common';

type Variables = {
  userId: number;
  code: string;
};

type Response = AuthResponse;

export const useVerify2fa = createMutation<Response, Variables, AxiosError>({
  mutationFn: async variables =>
    client.post('/auth/verify-2fa', variables).then(response => response.data),
});
