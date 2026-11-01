import type { NotificationFeedEntry, PortalNotice, PortalNotification } from './types'

export function buildNotificationFeed(
  notices: PortalNotice[],
  notifications: PortalNotification[],
  readNoticeIds: string[],
  now: number,
): NotificationFeedEntry[] {
  const announcements = notices
    .filter((notice) => notice.status === 'published' && notice.publishedAt && Date.parse(notice.expiresAt) > now)
    .map<NotificationFeedEntry>((notice) => ({
      id: `announcement-${notice.id}`,
      source: 'announcement',
      category: 'announcement',
      title: notice.title,
      body: notice.body,
      createdAt: notice.publishedAt ?? '',
      isRead: readNoticeIds.includes(notice.id),
      noticeId: notice.id,
    }))
  const accountNotifications = notifications.map<NotificationFeedEntry>((notification) => ({
    id: `account-${notification.id}`,
    source: 'account',
    category: notification.category,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt,
    isRead: notification.readAt !== null,
    notification,
  }))
  return [...announcements, ...accountNotifications]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
}
