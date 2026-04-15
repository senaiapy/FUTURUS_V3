import type { AxiosError } from 'axios';
import type { AuthResponse, RegisterRequest } from './types';

import { createMutation } from 'react-query-kit';
import { client } from '../common';

type Variables = RegisterRequest;
type Response = AuthResponse;

export const useRegister = createMutation<Response, Variables, AxiosError>({
  mutationFn: async variables =>
    client.post(`/auth/register`, variables).then(response => response.data),
});
