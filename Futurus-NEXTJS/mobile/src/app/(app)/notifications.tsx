import type { Notification } from '@/api/notifications';
import { useRouter } from 'expo-router';
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  Users,
  X,
} from 'lucide-react-native';
import * as React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {

  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/api/notifications';
import { THEME } from '@/lib/theme';

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case 'group_approved':
      return <Check color={THEME.success} size={18} />;
    case 'group_rejected':
      return <X color={THEME.danger} size={18} />;
    case 'group_invite':
      return <Users color={THEME.primary} size={18} />;
    default:
      return <Info color={THEME.textSecondary} size={18} />;
  }
}

function formatTime(dateStr: string, t: (key: string) => string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1)
    return t('notifications.just_now');
  if (diffMins < 60)
    return `${diffMins}m`;
  if (diffHours < 24)
    return `${diffHours}h`;
  if (diffDays < 7)
    return `${diffDays}d`;
  return date.toLocaleDateString();
}

function NotificationItem({
  notification,
  onPress,
  onMarkRead,
}: {
  notification: Notification;
  onPress: () => void;
  onMarkRead: () => void;
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.isRead && styles.notificationUnread,
      ]}
      onPress={() => {
        if (!notification.isRead) {
          onMarkRead();
        }
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <NotificationIcon type={notification.type} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(notification.createdAt, t)}
          </Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useNotifications({ variables: { limit: 50 } });

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (notification.clickUrl) {
        // Parse the URL and navigate appropriately
        if (notification.clickUrl.includes('/groups/')) {
          const slug = notification.clickUrl.split('/groups/')[1];
          router.push(`/groups/${slug}`);
        }
        else if (notification.clickUrl.includes('/dashboard/groups')) {
          router.push('/groups');
        }
      }
    },
    [router],
  );

  const handleMarkAsRead = useCallback(
    (notificationId: number) => {
      markAsRead(
        { notificationId },
        {
          onSuccess: () => {
            refetch();
          },
        },
      );
    },
    [markAsRead, refetch],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        refetch();
      },
    });
  }, [markAllAsRead, refetch]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Bell color={THEME.textMuted} size={48} />
      <Text style={styles.emptyTitle}>{t('notifications.no_notifications')}</Text>
      <Text style={styles.emptySubtitle}>
        {t('notifications.no_notifications_desc')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <CheckCheck color={THEME.primary} size={16} />
            <Text style={styles.markAllText}>
              {t('notifications.mark_all_read')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoading
        ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          )
        : (
            <FlatList
              data={notifications}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <NotificationItem
                  notification={item}
                  onPress={() => handleNotificationPress(item)}
                  onMarkRead={() => handleMarkAsRead(item.id)}
                />
              )}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={
                notifications.length === 0 ? styles.emptyContainer : styles.listContent
              }
              refreshControl={(
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor={THEME.primary}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(19, 142, 255, 0.1)',
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  notificationUnread: {
    backgroundColor: 'rgba(19, 142, 255, 0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 11,
    color: THEME.textMuted,
  },
  notificationMessage: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.primary,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.border,
    marginLeft: 68,
  },
});
