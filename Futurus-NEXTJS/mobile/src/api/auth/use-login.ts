import type { AxiosError } from 'axios';
import type { AuthResponse, LoginRequest } from './types';

import { createMutation } from 'react-query-kit';
import { client } from '../common';

type Variables = LoginRequest;
type Response = AuthResponse;

export const useLogin = createMutation<Response, Variables, AxiosError>({
  mutationFn: async variables =>
    client.post(`/auth/login`, variables).then(response => response.data),
});
