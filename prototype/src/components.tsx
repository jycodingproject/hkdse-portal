import type { ReactNode } from 'react'
import type { Language, Navigate, Session, View } from './types'
import { t, type MessageKey } from './i18n'

export type Translator = (key: MessageKey) => string

type HeaderProps = {
  language: Language
  onLanguageChange: (language: Language) => void
  view: View
  onNavigate: Navigate
  isSignedIn: boolean
  onSignOut: () => void
}

export function Header({
  language,
  onLanguageChange,
  view,
  onNavigate,
  isSignedIn,
  onSignOut,
}: HeaderProps) {
  const text = (key: MessageKey) => t(language, key)
  const adminView = view.startsWith('admin')

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
          <label className="language-select">
            <span className="sr-only">{text('language')}</span>
            <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)} aria-label={text('language')}>
              <option value="zh">{text('chinese')}</option>
              <option value="en">{text('english')}</option>
            </select>
          </label>
          {adminView ? (
            <button className="button button-outline admin-switch" onClick={() => onNavigate('dashboard')}>{text('dashboard')}</button>
          ) : isSignedIn ? (
            <button className="button button-outline admin-switch" onClick={() => onNavigate('account')}>{text('accountSettings')}</button>
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
  const statusKey = session.status === 'open' ? 'open' : session.status === 'closed' ? 'closed' : 'cancelled'
  const subject = language === 'zh'
    ? session.subject === 'Mathematics' ? '數學' : session.subject === 'Chemistry' ? '化學' : session.subject
    : session.subject
  const paper = language === 'zh'
    ? session.paper.replace('Compulsory Part', '必修部分').replace('Paper', '卷').replace('Section A', '甲部')
    : session.paper

  return (
    <article className="session-card">
      <div className="session-card-top">
        <div>
          <div className="eyebrow">{subject}</div>
          <h3>{paper}</h3>
        </div>
        <StatusBadge tone={session.status === 'open' ? 'success' : session.status === 'closed' ? 'warning' : 'danger'}>
          {t(language, statusKey)}
        </StatusBadge>
      </div>
      <div className="session-meta-grid">
        <div><span>{t(language, 'starts')}</span><strong>{session.date} · {session.time}</strong></div>
        <div><span>{t(language, 'duration')}</span><strong>{session.duration}</strong></div>
        <div><span>{t(language, 'cutoff')}</span><strong>{session.cutoff}</strong></div>
      </div>
      <div className="session-card-bottom">
        <div><small>{t(language, 'price')}</small><strong>{session.price}</strong></div>
        <button className="button button-outline" onClick={onDetails} disabled={session.status !== 'open'}>
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
