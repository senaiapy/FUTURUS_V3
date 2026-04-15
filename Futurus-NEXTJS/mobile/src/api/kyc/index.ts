import { createMutation } from 'react-query-kit';
import { client } from '@/api/common';

export const useSubmitKYC = createMutation<{ url: string }, FormData>({
  mutationFn: async (formData) => {
    const response = await client.post('/users/kyc-submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
});
