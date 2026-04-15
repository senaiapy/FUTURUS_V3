import { createMutation, createQuery } from 'react-query-kit';

import { client } from '../common';

// Types
export type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  imageUrl?: string;
  clickUrl?: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UnreadCountResponse = {
  unreadCount: number;
};

// Queries
export const useNotifications = createQuery<
  NotificationsResponse,
  { page?: number; limit?: number; unreadOnly?: boolean }
>({
  queryKey: ['notifications'],
  fetcher: async (params) => {
    const response = await client.get('/notifications', { params });
    return response.data;
  },
});

export const useUnreadCount = createQuery<UnreadCountResponse, void>({
  queryKey: ['notifications-unread-count'],
  fetcher: async () => {
    const response = await client.get('/notifications/unread-count');
    return response.data;
  },
});

// Mutations
export const useMarkAsRead = createMutation<void, { notificationId: number }>({
  mutationFn: async ({ notificationId }) => {
    const response = await client.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
});

export const useMarkAllAsRead = createMutation<void, void>({
  mutationFn: async () => {
    const response = await client.patch('/notifications/read-all');
    return response.data;
  },
});

export const useDeleteNotification = createMutation<void, { notificationId: number }>({
  mutationFn: async ({ notificationId }) => {
    const response = await client.delete(`/notifications/${notificationId}`);
    return response.data;
  },
});
