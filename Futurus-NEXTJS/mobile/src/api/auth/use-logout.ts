import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';

export const useLogout = createMutation<void, void, AxiosError>({
  mutationFn: async () =>
    client.post(`/auth/logout`).then(response => response.data),
});
