import { useEffect, useState, type ReactNode } from 'react'
import { AdminDashboardPage, AdminPaperPage, AdminResultsPage, AdminSittingPage } from './AdminPages'
import { Footer, Header, PageHeading, type Translator } from './components'
import { LoginPage, RegisterPage, VerifyEmailPage, VerificationSuccessPage, ForgotPasswordPage, ResetPasswordPage } from './AuthPages'
import { notices as noticeFixtures, portalNotifications as notificationFixtures, sessions } from './data'
import { t } from './i18n'
import './App.css'
import { AdminNoticesPage, NoticeCenterPage } from './NoticePages'
import { buildNotificationFeed } from './notificationFeed'
import {
  AccountPage,
  CheckoutPage,
  DashboardPage,
  DemoPage,
  ExamPage,
  HomePage,
  ResultsPage,
  SessionDetailPage,
  SessionsPage,
} from './StudentPages'
import type { CheckoutPhase, Language, PaymentMethod, PortalNotice, PortalNotification, Session, View } from './types'

type PurchaseType = 'single' | 'subscription'
type SaveStatus = 'saved' | 'saving' | 'failed'

function getInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem('portal-language')
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    // The default language remains available when browser storage is disabled.
  }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function App() {
  const [view, setView] = useState<View>('adminDashboard')
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [verifiedEmails, setVerifiedEmails] = useState<string[]>(['student@example.test'])
  const [pendingAuthEmail, setPendingAuthEmail] = useState('')
  const [currentEmail, setCurrentEmail] = useState('student@example.test')
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<number | null>(null)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLinkExpiresAt, setResetLinkExpiresAt] = useState<number | null>(null)
  const [resetLinkUsed, setResetLinkUsed] = useState(false)
  const [loginFeedback, setLoginFeedback] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('single')
  const [selectedSession, setSelectedSession] = useState<Session>(sessions[0])
  const [paymentSession, setPaymentSession] = useState<Session>(sessions[0])
  const [selectedPaperLanguage, setSelectedPaperLanguage] = useState<Language>('zh')
  const [paymentPaperLanguage, setPaymentPaperLanguage] = useState<Language>('zh')
  const [notificationLanguage, setNotificationLanguage] = useState<Language>('zh')
  const [registeredSessionIds, setRegisteredSessionIds] = useState<string[]>([])
  const [registeredSources, setRegisteredSources] = useState<Record<string, PurchaseType>>({})
  const [registeredLanguages, setRegisteredLanguages] = useState<Record<string, Language>>({})
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('selecting')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payme')
  const [postLoginView, setPostLoginView] = useState<View>('dashboard')
  const [examIndex, setExamIndex] = useState(0)
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [offline, setOffline] = useState(false)
  const [gradeAvailable, setGradeAvailable] = useState(true)
  const [remainingSeconds, setRemainingSeconds] = useState(75 * 60)
  const [notices, setNotices] = useState<PortalNotice[]>(noticeFixtures)
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>([])
  const [portalNotifications, setPortalNotifications] = useState(notificationFixtures)
  const [focusedNoticeId, setFocusedNoticeId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [selectedAdminSittingId, setSelectedAdminSittingId] = useState('math-p2-101')

  const text: Translator = (key) => t(language, key)

  useEffect(() => {
    try {
      window.localStorage.setItem('portal-language', language)
    } catch {
      // Remembering the interface language is optional.
    }
  }, [language])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en'
    document.title = language === 'zh' ? '模擬考試平台｜HKDSE' : 'Mock Examination Portal | HKDSE'
  }, [language])

  useEffect(() => {
    if (Object.keys(examAnswers).length === 0) return
    if (offline) return
    const timer = window.setTimeout(() => setSaveStatus('saved'), 650)
    return () => window.clearTimeout(timer)
  }, [examAnswers, offline])

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (view !== 'exam') return
    let remaining = 75 * 60
    const timer = window.setInterval(() => {
      remaining = Math.max(0, remaining - 1)
      setRemainingSeconds(remaining)
      if (remaining === 0) {
        setOffline(false)
        setSaveStatus('saved')
        setView('result')
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [view])

  const navigate = (target: View) => {
    if (pendingAuthEmail && !verifiedEmails.includes(pendingAuthEmail.toLowerCase()) && target !== 'verifyEmail' && target !== 'verificationSuccess') {
      setView('verifyEmail')
      return
    }
    if (['dashboard', 'checkout', 'exam', 'result', 'account', 'noticeCenter'].includes(target) && !isSignedIn) {
      setPostLoginView(target)
      setView('login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setView(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSignIn = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!verifiedEmails.includes(normalizedEmail)) {
      setPendingAuthEmail(normalizedEmail)
      setVerificationExpiresAt(Date.now() + 60 * 60 * 1000)
      setLoginFeedback(null)
      setView('verifyEmail')
      return
    }
    setCurrentEmail(normalizedEmail)
    setPendingAuthEmail('')
    setIsSignedIn(true)
    setLoginFeedback(null)
    setView(postLoginView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRegister = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    setPendingAuthEmail(normalizedEmail)
    setVerificationExpiresAt(Date.now() + 60 * 60 * 1000)
    setLoginFeedback(null)
    setView('verifyEmail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const simulateVerification = () => {
    if (!pendingAuthEmail || (verificationExpiresAt !== null && verificationExpiresAt <= Date.now())) return
    setVerifiedEmails((current) => current.includes(pendingAuthEmail) ? current : [...current, pendingAuthEmail])
    setView('verificationSuccess')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resendVerification = () => {
    setVerificationExpiresAt(Date.now() + 60 * 60 * 1000)
  }

  const requestPasswordReset = (email: string) => {
    setResetEmail(email.trim().toLowerCase())
    setResetLinkExpiresAt(Date.now() + 60 * 60 * 1000)
    setResetLinkUsed(false)
  }

  const openPasswordResetLink = () => {
    if (!resetEmail || resetLinkUsed || resetLinkExpiresAt === null || resetLinkExpiresAt <= Date.now()) {
      setLoginFeedback({ message: text('resetLinkExpiredOrUsed'), tone: 'danger' })
      setView('login')
      return
    }
    setView('resetPassword')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const completePasswordReset = () => {
    setResetLinkUsed(true)
    setCurrentEmail(resetEmail)
    setLoginFeedback({ message: text('passwordResetSuccess'), tone: 'success' })
    setView('login')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openSession = (session: Session) => {
    setSelectedSession(session)
    navigate('sessionDetail')
  }

  const beginPurchase = (type: PurchaseType) => {
    if (checkoutPhase === 'pending') {
      navigate('checkout')
      return
    }
    setPurchaseType(type)
    setPaymentSession(selectedSession)
    setPaymentPaperLanguage(selectedPaperLanguage)
    setCheckoutPhase('selecting')
    if (!isSignedIn) {
      setPostLoginView('checkout')
      navigate('login')
      return
    }
    navigate('checkout')
  }

  const confirmMockPayment = () => {
    setCheckoutPhase('selecting')
    if (purchaseType === 'subscription') {
      setHasSubscription(true)
    } else {
      setRegisteredSessionIds((current) => current.includes(paymentSession.id) ? current : [...current, paymentSession.id])
      setRegisteredLanguages((current) => ({ ...current, [paymentSession.id]: paymentPaperLanguage }))
      setRegisteredSources((current) => ({ ...current, [paymentSession.id]: 'single' }))
    }
    navigate('dashboard')
  }

  const bookWithSubscription = () => {
    if (!hasSubscription || selectedSession.status !== 'open') return
    setRegisteredSessionIds((current) => current.includes(selectedSession.id) ? current : [...current, selectedSession.id])
    setRegisteredLanguages((current) => ({ ...current, [selectedSession.id]: selectedPaperLanguage }))
    setRegisteredSources((current) => ({ ...current, [selectedSession.id]: 'subscription' }))
    navigate('dashboard')
  }

  const cancelRegistration = (session: Session) => {
    setRegisteredSessionIds((current) => current.filter((id) => id !== session.id))
    setRegisteredLanguages((current) => {
      const next = { ...current }
      delete next[session.id]
      return next
    })
    setRegisteredSources((current) => {
      const next = { ...current }
      delete next[session.id]
      return next
    })
  }

  const startSession = (session: Session) => {
    setSelectedSession(session)
    setSelectedPaperLanguage(registeredLanguages[session.id] ?? 'zh')
    setExamIndex(0)
    setExamAnswers({})
    setMarkedQuestions(new Set())
    setSaveStatus('saved')
    setOffline(false)
    setRemainingSeconds(75 * 60)
    navigate('exam')
  }

  const submitAttempt = () => {
    setOffline(false)
    setSaveStatus('saved')
    navigate('result')
  }

  const saveAnswer = (questionId: number, answer: number) => {
    setSaveStatus(offline ? 'failed' : 'saving')
    setExamAnswers((current) => ({ ...current, [questionId]: answer }))
  }

  const toggleMarked = (questionId: number) => {
    setMarkedQuestions((current) => {
      const next = new Set(current)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const registeredSessions = sessions.filter((session) => registeredSessionIds.includes(session.id))
  const notificationFeed = buildNotificationFeed(notices, portalNotifications, readNoticeIds, currentTime)
  const unreadNotificationCount = notificationFeed.filter((entry) => !entry.isRead).length
  const saveNotice = (notice: PortalNotice) => {
    setNotices((current) => current.some((existing) => existing.id === notice.id)
      ? current.map((existing) => existing.id === notice.id ? notice : existing)
      : [notice, ...current])
  }
  const markNoticeRead = (noticeId: string) => {
    setReadNoticeIds((current) => current.includes(noticeId) ? current : [...current, noticeId])
  }
  const markNotificationRead = (notificationId: string) => {
    setPortalNotifications((current) => current.map((notification) => notification.id === notificationId && !notification.readAt
      ? { ...notification, readAt: new Date(currentTime).toISOString() }
      : notification))
  }
  const openAnnouncement = (noticeId: string) => {
    markNoticeRead(noticeId)
    setFocusedNoticeId(noticeId)
    navigate('noticeCenter')
  }
  const openNotification = (notification: PortalNotification) => {
    markNotificationRead(notification.id)
    if (notification.targetSessionId) {
      const targetSession = sessions.find((session) => session.id === notification.targetSessionId)
      if (targetSession) {
        setSelectedSession(targetSession)
        setSelectedPaperLanguage(registeredLanguages[targetSession.id] ?? 'zh')
      }
    }
    navigate(notification.destination)
  }
  const signOut = () => {
    setIsSignedIn(false)
    setPendingAuthEmail('')
    setView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const simulatePasswordChange = () => {
    setIsSignedIn(true)
  }
  const adminProps = { language, text, navigate, view }

  let content: ReactNode
  switch (view) {
    case 'home':
      content = <HomePage language={language} text={text} navigate={navigate} onSelectSession={openSession} />
      break
    case 'sessions':
      content = <SessionsPage language={language} text={text} navigate={navigate} onSelectSession={openSession} />
      break
    case 'sessionDetail':
      content = <SessionDetailPage
        language={language}
        text={text}
        navigate={navigate}
        session={selectedSession}
        selectedLanguage={selectedPaperLanguage}
        setSelectedLanguage={setSelectedPaperLanguage}
        onPurchase={beginPurchase}
        hasSubscription={hasSubscription}
        isRegistered={registeredSessionIds.includes(selectedSession.id)}
        onBookWithSubscription={bookWithSubscription}
      />
      break
    case 'demo':
      content = <DemoPage language={language} text={text} navigate={navigate} />
      break
    case 'login':
      content = <LoginPage language={language} text={text} navigate={navigate} onSignIn={handleSignIn} feedback={loginFeedback} initialEmail={pendingAuthEmail || currentEmail} />
      break
    case 'register':
      content = <RegisterPage language={language} text={text} navigate={navigate} onRegister={handleRegister} />
      break
    case 'verifyEmail':
      content = pendingAuthEmail
        ? <VerifyEmailPage
          language={language}
          text={text}
          navigate={navigate}
          email={pendingAuthEmail}
          linkExpired={verificationExpiresAt !== null && verificationExpiresAt <= currentTime}
          onResend={resendVerification}
          onSimulateVerification={simulateVerification}
        />
        : <LoginPage language={language} text={text} navigate={navigate} onSignIn={handleSignIn} initialEmail={pendingAuthEmail || currentEmail} />
      break
    case 'verificationSuccess':
      content = <VerificationSuccessPage language={language} text={text} navigate={navigate} />
      break
    case 'forgotPassword':
      content = <ForgotPasswordPage language={language} text={text} navigate={navigate} onRequestReset={requestPasswordReset} onOpenResetLink={openPasswordResetLink} />
      break
    case 'resetPassword':
      content = <ResetPasswordPage
        language={language}
        text={text}
        navigate={navigate}
        onResetComplete={completePasswordReset}
        linkExpired={resetLinkUsed || resetLinkExpiresAt === null || resetLinkExpiresAt <= currentTime}
      />
      break
    case 'dashboard':
      content = <DashboardPage
        language={language}
        text={text}
        navigate={navigate}
        isSignedIn={isSignedIn}
        hasSubscription={hasSubscription}
        registeredSessions={registeredSessions}
        registrationSources={registeredSources}
        onStartSession={startSession}
        onSelectSession={openSession}
        onCancelSession={cancelRegistration}
        latestUpdates={notificationFeed}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNoticeCenter={() => navigate('noticeCenter')}
      />
      break
    case 'checkout':
      content = <CheckoutPage
        language={language}
        text={text}
        navigate={navigate}
        purchaseType={purchaseType}
        hasSubscription={hasSubscription}
        session={paymentSession}
        selectedLanguage={paymentPaperLanguage}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        checkoutPhase={checkoutPhase}
        onStartPayment={() => setCheckoutPhase('pending')}
        onConfirmPaid={confirmMockPayment}
        onConfirmUnpaid={() => setCheckoutPhase('unpaid')}
      />
      break
    case 'exam':
      content = <ExamPage
        language={language}
        paperLanguage={selectedPaperLanguage}
        text={text}
        navigate={navigate}
        index={examIndex}
        answers={examAnswers}
        marked={markedQuestions}
        saveStatus={saveStatus}
        offline={offline}
        onAnswer={saveAnswer}
        onIndex={setExamIndex}
        onToggleMarked={toggleMarked}
        onToggleOffline={() => { setOffline((current) => !current); setSaveStatus(offline ? 'saved' : 'failed') }}
        onSubmit={submitAttempt}
        remainingSeconds={remainingSeconds}
      />
      break
    case 'result':
      content = <ResultsPage
        language={language}
        paperLanguage={selectedPaperLanguage}
        text={text}
        navigate={navigate}
        session={selectedSession}
        answers={examAnswers}
        hasSubscription={hasSubscription}
        gradeAvailable={gradeAvailable}
        onToggleGrade={() => setGradeAvailable((current) => !current)}
        onSelectSession={openSession}
      />
      break
    case 'account':
      content = <AccountPage
        language={language}
        text={text}
        navigate={navigate}
        notificationLanguage={notificationLanguage}
        setNotificationLanguage={setNotificationLanguage}
        email={currentEmail}
        onPasswordChange={simulatePasswordChange}
      />
      break
    case 'noticeCenter':
      content = isSignedIn
        ? <NoticeCenterPage
          language={language}
          text={text}
          feed={notificationFeed}
          focusedNoticeId={focusedNoticeId}
          onMarkNoticeRead={markNoticeRead}
          onMarkNotificationRead={markNotificationRead}
          onOpenAnnouncement={openAnnouncement}
          onOpenNotification={openNotification}
        />
        : <LoginPage language={language} text={text} navigate={navigate} onSignIn={handleSignIn} initialEmail={pendingAuthEmail || currentEmail} />
      break
    case 'adminDashboard':
      content = <AdminDashboardPage
        {...adminProps}
        onViewSitting={(sittingId) => {
          setSelectedAdminSittingId(sittingId)
          navigate('adminResults')
        }}
      />
      break
    case 'adminPaper':
      content = <AdminPaperPage {...adminProps} />
      break
    case 'adminSitting':
      content = <AdminSittingPage {...adminProps} />
      break
    case 'adminResults':
      content = <AdminResultsPage
        {...adminProps}
        selectedSittingId={selectedAdminSittingId}
        onSelectedSittingChange={setSelectedAdminSittingId}
      />
      break
    case 'adminNotices':
      content = <AdminNoticesPage
        language={language}
        text={text}
        notices={notices}
        readNoticeIds={readNoticeIds}
        now={currentTime}
        view={view}
        navigate={navigate}
        onSaveNotice={saveNotice}
      />
      break
  }

  return (
    <div className="app-shell">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        view={view}
        onNavigate={navigate}
        isSignedIn={isSignedIn}
        onSignOut={signOut}
        notificationFeed={notificationFeed}
        unreadCount={unreadNotificationCount}
        onOpenAnnouncement={openAnnouncement}
        onOpenNotification={openNotification}
      />
      <main className={view.startsWith('admin') ? 'main-content main-admin' : 'main-content'}>
        {view.startsWith('admin') && <div className="admin-mobile-heading"><PageHeading eyebrow="ADMINISTRATOR" title={text('admin')} /></div>}
        {content}
      </main>
      <Footer language={language} />
    </div>
  )
}

export default App
