import { useEffect, useState } from 'react'
import { AdminNav, PageHeading, StatusBadge, type Translator } from './components'
import type { MessageKey } from './i18n'
import type { Language, Navigate, NotificationCategory, NotificationFeedEntry, PortalNotice, PortalNotification, View } from './types'

type NoticeDataProps = {
  language: Language
  text: Translator
  notices: PortalNotice[]
  readNoticeIds: string[]
  now: number
}

type NoticeCenterProps = {
  language: Language
  text: Translator
  feed: NotificationFeedEntry[]
  focusedNoticeId: string | null
  onMarkNoticeRead: (noticeId: string) => void
  onMarkNotificationRead: (notificationId: string) => void
  onOpenAnnouncement: (noticeId: string) => void
  onOpenNotification: (notification: PortalNotification) => void
}

type AdminNoticeProps = NoticeDataProps & {
  view: View
  navigate: Navigate
  onSaveNotice: (notice: PortalNotice) => void
}

const notificationCategoryKeys: Record<NotificationCategory, MessageKey> = {
  payment: 'notificationPayment',
  registration: 'notificationRegistration',
  sitting: 'notificationSitting',
  result: 'notificationResult',
  incident: 'notificationIncident',
}

function dateInputValue(isoDate: string) {
  return isoDate.slice(0, 16)
}

function getStatusLabel(notice: PortalNotice, now: number, text: Translator) {
  if (Date.parse(notice.expiresAt) <= now) return text('expired')
  return notice.status === 'published' ? text('published') : text('draft')
}

export function NoticeCenterPage({
  language,
  text,
  feed,
  focusedNoticeId,
  onMarkNoticeRead,
  onMarkNotificationRead,
  onOpenAnnouncement,
  onOpenNotification,
}: NoticeCenterProps) {
  const [tab, setTab] = useState<'all' | 'announcements' | 'notifications'>('all')
  const unreadCount = feed.filter((entry) => !entry.isRead).length
  const visibleFeed = feed.filter((entry) => {
    if (tab === 'announcements') return entry.source === 'announcement'
    if (tab === 'notifications') return entry.source === 'account'
    return true
  })

  useEffect(() => {
    if (!focusedNoticeId) return
    const timer = window.setTimeout(() => {
      document.getElementById(`feed-announcement-${focusedNoticeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [focusedNoticeId])

  const categoryLabel = (entry: NotificationFeedEntry) => {
    if (entry.category === 'announcement') return text('notificationAnnouncement')
    return text(notificationCategoryKeys[entry.category])
  }

  return (
    <>
      <PageHeading
        eyebrow={language === 'zh' ? '已登入帳戶' : 'SIGNED-IN PORTAL'}
        title={text('notifications')}
        description={text('informationCentreIntro')}
      />
      <section className="panel notice-center">
        <div className="panel-heading">
          <h2>{text('allNotifications')}</h2>
          <StatusBadge tone={unreadCount ? 'warning' : 'success'}>{unreadCount} · {text('unread')}</StatusBadge>
        </div>
        <div className="notification-tabs" role="tablist" aria-label={text('notificationFilters')}>
          {([
            ['all', 'allNotifications'],
            ['announcements', 'announcements'],
            ['notifications', 'personalNotifications'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              id={`notification-tab-${value}`}
              className={tab === value ? 'notification-tab active' : 'notification-tab'}
              role="tab"
              aria-selected={tab === value}
              aria-controls="notification-feed-panel"
              onClick={() => setTab(value)}
            >
              {text(label)}
            </button>
          ))}
        </div>
        <div id="notification-feed-panel" role="tabpanel" aria-labelledby={`notification-tab-${tab}`}>
          {visibleFeed.length === 0
            ? <p className="muted">{text('noNotifications')}</p>
            : visibleFeed.map((entry) => {
              const isAnnouncement = entry.source === 'announcement'
              const itemId = isAnnouncement ? `feed-announcement-${entry.noticeId}` : `feed-notification-${entry.notification.id}`
              return (
                <article className={`notice-card notification-card${entry.isRead ? '' : ' is-unread'}`} id={itemId} key={entry.id}>
                  <div className="notice-card-heading">
                    <div>
                      <div className="notification-item-meta">
                        <span className="category-chip">{categoryLabel(entry)}</span>
                        <time>{new Date(entry.createdAt).toLocaleString(language === 'zh' ? 'zh-HK' : 'en-HK', { timeZone: 'Asia/Hong_Kong' })}</time>
                      </div>
                      <h2>
                        <button className="notification-title-button" onClick={() => isAnnouncement ? onOpenAnnouncement(entry.noticeId) : onOpenNotification(entry.notification)}>
                          {entry.title[language]}
                        </button>
                      </h2>
                    </div>
                    <StatusBadge tone={entry.isRead ? 'neutral' : 'warning'}>{entry.isRead ? text('read') : text('unread')}</StatusBadge>
                  </div>
                  <p>{entry.body[language]}</p>
                  {!entry.isRead && <button className="text-button" onClick={() => isAnnouncement ? onMarkNoticeRead(entry.noticeId) : onMarkNotificationRead(entry.notification.id)}>{text('markAsRead')}</button>}
                </article>
              )
            })}
        </div>
      </section>
    </>
  )
}

export function AdminNoticesPage({ language, text, notices, readNoticeIds, now, view, navigate, onSaveNotice }: AdminNoticeProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [titleZh, setTitleZh] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [bodyZh, setBodyZh] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [expiresAt, setExpiresAt] = useState('2026-12-31T23:59')
  const [formError, setFormError] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setTitleZh('')
    setTitleEn('')
    setBodyZh('')
    setBodyEn('')
    setExpiresAt('2026-12-31T23:59')
    setFormError('')
  }

  const editNotice = (notice: PortalNotice) => {
    setEditingId(notice.id)
    setTitleZh(notice.title.zh)
    setTitleEn(notice.title.en)
    setBodyZh(notice.body.zh)
    setBodyEn(notice.body.en)
    setExpiresAt(dateInputValue(notice.expiresAt))
    setFormError('')
  }

  const saveNotice = (status: PortalNotice['status']) => {
    if (![titleZh, titleEn, bodyZh, bodyEn].every((value) => value.trim())) {
      setFormError(text('noticeFieldsRequired'))
      return
    }
    const expiresAtMillis = Date.parse(`${expiresAt}:00+08:00`)
    if (!Number.isFinite(expiresAtMillis) || expiresAtMillis <= now) {
      setFormError(text('noticeExpiryMustBeFuture'))
      return
    }
    const previous = notices.find((notice) => notice.id === editingId)
    onSaveNotice({
      id: editingId ?? `notice-${now}`,
      title: { zh: titleZh.trim(), en: titleEn.trim() },
      body: { zh: bodyZh.trim(), en: bodyEn.trim() },
      status,
      publishedAt: status === 'published' ? new Date(now).toISOString() : previous?.publishedAt ?? null,
      expiresAt: `${expiresAt}:00+08:00`,
    })
    resetForm()
  }

  const updateStatus = (notice: PortalNotice, status: PortalNotice['status']) => {
    onSaveNotice({
      ...notice,
      status,
      publishedAt: status === 'published' ? new Date(now).toISOString() : null,
    })
  }

  return (
    <div className="admin-layout">
      <AdminNav view={view} onNavigate={navigate} language={language} />
      <div className="admin-content">
        <PageHeading eyebrow="ADMINISTRATOR" title={text('noticeManagement')} description={text('noticeManagementIntro')} />
        <div className="admin-form-grid">
          <section className="panel">
            <div className="panel-heading"><h2>{editingId ? text('editNotice') : text('createNotice')}</h2>{editingId && <button className="text-button" onClick={resetForm}>{text('cancel')}</button>}</div>
            <label className="field-label" htmlFor="notice-title-zh">{text('noticeTitleZh')}<input id="notice-title-zh" value={titleZh} onChange={(event) => setTitleZh(event.target.value)} /></label>
            <label className="field-label" htmlFor="notice-title-en">{text('noticeTitleEn')}<input id="notice-title-en" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} /></label>
            <label className="field-label" htmlFor="notice-body-zh">{text('noticeBodyZh')}<textarea id="notice-body-zh" value={bodyZh} onChange={(event) => setBodyZh(event.target.value)} /></label>
            <label className="field-label" htmlFor="notice-body-en">{text('noticeBodyEn')}<textarea id="notice-body-en" value={bodyEn} onChange={(event) => setBodyEn(event.target.value)} /></label>
            <label className="field-label" htmlFor="notice-expires">{text('noticeExpiry')}<input id="notice-expires" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
            {formError && <div className="field-error" role="alert">{formError}</div>}
            <div className="button-row">
              <button className="button button-outline" onClick={() => saveNotice('draft')}>{text('saveDraft')}</button>
              <button className="button button-primary" onClick={() => saveNotice('published')}>{text('publishNotice')}</button>
            </div>
          </section>
          <section className="panel notice-admin-list">
            <div className="panel-heading"><h2>{text('allNotices')}</h2><StatusBadge>{notices.length}</StatusBadge></div>
            {[...notices].sort((left, right) => Date.parse(right.publishedAt ?? '') - Date.parse(left.publishedAt ?? '')).map((notice) => {
              const expired = Date.parse(notice.expiresAt) <= now
              return (
                <article className="notice-card" key={notice.id}>
                  <div className="notice-card-heading">
                    <div><h3>{notice.title[language]}</h3><small>{text('expiresAt')}: {dateInputValue(notice.expiresAt).replace('T', ' ')}</small></div>
                    <StatusBadge tone={expired ? 'neutral' : notice.status === 'published' ? 'success' : 'warning'}>{getStatusLabel(notice, now, text)}</StatusBadge>
                  </div>
                  <p>{notice.body[language]}</p>
                  <div className="button-row">
                    <button className="text-button" onClick={() => editNotice(notice)}>{text('editNotice')}</button>
                    {notice.status === 'published'
                      ? <button className="text-button" onClick={() => updateStatus(notice, 'draft')}>{text('unpublishNotice')}</button>
                      : <button className="text-button" onClick={() => updateStatus(notice, 'published')} disabled={expired}>{text('publishNotice')}</button>}
                    <small>{readNoticeIds.includes(notice.id) ? text('hasBeenRead') : text('notYetRead')}</small>
                  </div>
                </article>
              )
            })}
          </section>
        </div>
      </div>
    </div>
  )
}
