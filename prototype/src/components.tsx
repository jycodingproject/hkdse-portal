import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Language, Navigate, NotificationCategory, NotificationFeedEntry, PortalNotification, Session, View } from './types'
import { t, type MessageKey } from './i18n'

export type Translator = (key: MessageKey) => string

type HeaderProps = {
  language: Language
  onLanguageChange: (language: Language) => void
  view: View
  onNavigate: Navigate
  isSignedIn: boolean
  onSignOut: () => void
  notificationFeed: NotificationFeedEntry[]
  unreadCount: number
  onOpenAnnouncement: (noticeId: string) => void
  onOpenNotification: (notification: PortalNotification) => void
}

export function Header({
  language,
  onLanguageChange,
  view,
  onNavigate,
  isSignedIn,
  onSignOut,
  notificationFeed,
  unreadCount,
  onOpenAnnouncement,
  onOpenNotification,
}: HeaderProps) {
  const text = (key: MessageKey) => t(language, key)
  const adminView = view.startsWith('admin')
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const languageRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const notificationCategoryKeys: Record<NotificationCategory, MessageKey> = {
    payment: 'notificationPayment',
    registration: 'notificationRegistration',
    sitting: 'notificationSitting',
    result: 'notificationResult',
    incident: 'notificationIncident',
  }

  useEffect(() => {
    if (!notificationOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !notificationRef.current?.contains(event.target)) setNotificationOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotificationOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [notificationOpen])

  useEffect(() => {
    if (!languageOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageRef.current?.contains(event.target)) setLanguageOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLanguageOpen(false)
        languageButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [languageOpen])

  const openFeedEntry = (entry: NotificationFeedEntry) => {
    setNotificationOpen(false)
    if (entry.source === 'announcement') onOpenAnnouncement(entry.noticeId)
    else onOpenNotification(entry.notification)
  }
  const categoryLabel = (entry: NotificationFeedEntry) => {
    if (entry.category === 'announcement') return text('notificationAnnouncement')
    return text(notificationCategoryKeys[entry.category])
  }

  return (
    <>
      <div className="prototype-banner">{text('prototype')}</div>
      <header className="site-header">
        <button className="brand" onClick={() => onNavigate('home')} aria-label={text('home')}>
          <span className="brand-mark">DSE</span>
          <span className="brand-copy">
            <strong>{text('brand')}</strong>
            <small>{text('brandSub')}</small>
          </span>
        </button>
        <nav className="desktop-nav" aria-label={language === 'zh' ? '主導覽' : 'Main navigation'}>
          <button className={view === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('home')}>{text('home')}</button>
          <button className={view === 'sessions' || view === 'sessionDetail' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('sessions')}>{text('sittings')}</button>
          <button className={view === 'demo' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('demo')}>{text('freeDemo')}</button>
          {isSignedIn && <button className={view === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('dashboard')}>{text('dashboard')}</button>}
        </nav>
        <div className="header-actions">
          <div className="language-control" ref={languageRef}>
            <button
              className="language-trigger"
              type="button"
              ref={languageButtonRef}
              aria-label={`${text('language')}: ${text(language === 'zh' ? 'chinese' : 'english')}`}
              aria-expanded={languageOpen}
              aria-controls="language-switcher-options"
              onClick={() => setLanguageOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
              <span>{text(language === 'zh' ? 'chinese' : 'english')}</span>
              <svg className="language-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            <div className="language-popover" id="language-switcher-options" role="group" aria-label={text('language')} hidden={!languageOpen}>
              {(['zh', 'en'] as const).map((option) => (
                <button
                  className="language-option"
                  type="button"
                  key={option}
                  aria-pressed={language === option}
                  onClick={() => { onLanguageChange(option); setLanguageOpen(false) }}
                >
                  <span>{text(option === 'zh' ? 'chinese' : 'english')}</span>
                  {language === option && <span className="language-option-check" aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          </div>
          {adminView ? (
            <button className="button button-outline admin-switch" onClick={() => onNavigate('dashboard')}>{text('dashboard')}</button>
          ) : isSignedIn ? (
            <>
              <div className="notification-control" ref={notificationRef}>
                <button
                  className="header-icon-button"
                  aria-label={unreadCount ? `${text('notifications')}, ${unreadCount} ${text('unread')}` : text('notifications')}
                  aria-expanded={notificationOpen}
                  aria-haspopup="dialog"
                  aria-controls="header-notification-popover"
                  onClick={() => setNotificationOpen((open) => !open)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
                  {unreadCount > 0 && <span className="notification-badge" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </button>
                {notificationOpen && <div className="notification-popover" id="header-notification-popover" role="dialog" aria-label={text('notifications')}>
                  <div className="notification-popover-heading"><strong>{text('notifications')}</strong><span>{unreadCount} · {text('unread')}</span></div>
                  {notificationFeed.slice(0, 3).map((entry) => (
                    <button className={`notification-item${entry.isRead ? '' : ' is-unread'}`} key={entry.id} onClick={() => openFeedEntry(entry)}>
                      <span className="notification-item-meta"><span>{categoryLabel(entry)}</span><time>{new Date(entry.createdAt).toLocaleDateString(language === 'zh' ? 'zh-HK' : 'en-HK', { timeZone: 'Asia/Hong_Kong' })}</time></span>
                      <strong>{entry.title[language]}</strong>
                      <span>{entry.body[language]}</span>
                    </button>
                  ))}
                  {notificationFeed.length === 0 && <p className="notification-empty">{text('noNotifications')}</p>}
                  <button className="notification-view-all" onClick={() => { setNotificationOpen(false); onNavigate('noticeCenter') }}>{text('viewAllNotifications')} →</button>
                </div>}
              </div>
              <button className="header-icon-button" aria-label={text('accountSettings')} title={text('accountSettings')} onClick={() => onNavigate('account')}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .8v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.8l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.8-3h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .8-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.8v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .8l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .8 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.8 3Z" /></svg>
              </button>
            </>
          ) : (
            <button className="button button-primary header-login" onClick={() => onNavigate('login')}>{text('signIn')}</button>
          )}
          <button className="admin-shortcut" onClick={() => onNavigate(adminView ? 'dashboard' : 'adminDashboard')}>{text('admin')}</button>
          {isSignedIn && <button className="signout-link" onClick={onSignOut}>{text('signOut')}</button>}
        </div>
      </header>
    </>
  )
}

export function Footer({ language }: { language: Language }) {
  return (
    <footer className="site-footer">
      <span>{t(language, 'brand')} · 2026</span>
      <span>{language === 'zh' ? '原型示例，不代表正式考試或成績' : 'Prototype sample; not an official exam or result'}</span>
    </footer>
  )
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p className="muted intro-copy">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'neutral' | 'danger' }) {
  return <span className={`status-badge status-${tone}`}><span className="status-dot" aria-hidden="true" />{children}</span>
}

export function SessionCard({
  session,
  language,
  onDetails,
}: {
  session: Session
  language: Language
  onDetails: () => void
}) {
  const statusKey = session.status === 'open' ? 'open' : session.status === 'scheduled' ? 'notOpenYet' : session.status === 'closed' ? 'closed' : 'cancelled'
  const subject = language === 'zh'
    ? session.subject === 'Mathematics' ? '數學' : session.subject === 'Chemistry' ? '化學' : session.subject
    : session.subject
  const paper = language === 'zh'
    ? session.paper.replace('Compulsory Part', '必修部分').replace('Paper', '卷').replace('Section A', '甲部').replace(/ · Set ([A-D])$/, ' · $1 版')
    : session.paper
  const duration = language === 'zh' ? session.duration.replace(' minutes', ' 分鐘') : session.duration

  return (
    <article className="session-card">
      <div className="session-card-top">
        <div>
          <div className="eyebrow">{subject}</div>
          <h3>{paper}</h3>
        </div>
        <StatusBadge tone={session.status === 'open' ? 'success' : session.status === 'scheduled' ? 'neutral' : session.status === 'closed' ? 'warning' : 'danger'}>
          {t(language, statusKey)}
        </StatusBadge>
      </div>
      <div className="session-meta-grid">
        <div><span>{t(language, 'starts')}</span><strong>{session.date} · {session.time}</strong></div>
        <div><span>{t(language, 'duration')}</span><strong>{duration}</strong></div>
        <div><span>{t(language, 'paperQuestions')}</span><strong>{session.questionCount}</strong></div>
        <div><span>{t(language, 'cutoff')}</span><strong>{session.cutoff}</strong></div>
      </div>
      <div className="session-card-bottom">
        <div><small>{t(language, 'price')}</small><strong>{session.price}</strong></div>
        <button className="button button-outline" onClick={onDetails} disabled={session.status === 'cancelled'}>
          {t(language, 'details')}
        </button>
      </div>
    </article>
  )
}

export function AdminNav({ view, onNavigate, language }: { view: View; onNavigate: Navigate; language: Language }) {
  const items: { key: MessageKey; view: View; icon: string }[] = [
    { key: 'opsDashboard', view: 'adminDashboard', icon: '▦' },
    { key: 'paperManagement', view: 'adminPaper', icon: '▤' },
    { key: 'sittingManagement', view: 'adminSitting', icon: '◷' },
    { key: 'registrationResults', view: 'adminResults', icon: '▧' },
    { key: 'noticeManagement', view: 'adminNotices', icon: '▣' },
  ]
  return (
    <aside className="admin-sidebar" aria-label={language === 'zh' ? '管理導覽' : 'Admin navigation'}>
      <div className="admin-sidebar-label">{language === 'zh' ? '管理工具' : 'ADMIN TOOLS'}</div>
      {items.map((item) => (
        <button
          key={item.view}
          className={view === item.view ? 'admin-nav-item selected' : 'admin-nav-item'}
          onClick={() => onNavigate(item.view)}
        >
          <span aria-hidden="true">{item.icon}</span>{t(language, item.key)}
        </button>
      ))}
    </aside>
  )
}
