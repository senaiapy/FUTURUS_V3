import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  email: string;
};

type Response = {
  success: boolean;
  message: string;
};

export const useForgotPassword = createMutation<Response, Variables, AxiosError>({
  mutationFn: async variables =>
    client.post(`/auth/forgot-password`, variables).then(response => response.data),
});

export const useResetPassword = createMutation<Response, any, AxiosError>({
  mutationFn: async variables =>
    client.post(`/auth/reset-password`, variables).then(response => response.data),
});
