import { useEffect, useState, type ReactNode } from 'react'
import { AdminDashboardPage, AdminPaperPage, AdminResultsPage, AdminSittingPage } from './AdminPages'
import { Footer, Header, PageHeading, type Translator } from './components'
import { sessions } from './data'
import { t } from './i18n'
import './App.css'
import {
  AccountPage,
  CheckoutPage,
  DashboardPage,
  DemoPage,
  ExamPage,
  HomePage,
  LoginPage,
  ResultsPage,
  SessionDetailPage,
  SessionsPage,
} from './StudentPages'
import type { Language, Session, View } from './types'

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
  const [view, setView] = useState<View>('home')
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('single')
  const [selectedSession, setSelectedSession] = useState<Session>(sessions[0])
  const [selectedPaperLanguage, setSelectedPaperLanguage] = useState<Language>('zh')
  const [subscriptionLanguage, setSubscriptionLanguage] = useState<Language>('zh')
  const [notificationLanguage, setNotificationLanguage] = useState<Language>('zh')
  const [examIndex, setExamIndex] = useState(0)
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [offline, setOffline] = useState(false)
  const [gradeAvailable, setGradeAvailable] = useState(true)
  const [purchaseError, setPurchaseError] = useState(false)

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

  const navigate = (target: View) => {
    setView(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openSession = (session: Session) => {
    setSelectedSession(session)
    navigate('sessionDetail')
  }

  const beginPurchase = (type: PurchaseType) => {
    setPurchaseType(type)
    setPurchaseError(false)
    if (!isSignedIn) {
      navigate('login')
      return
    }
    if (type === 'subscription') {
      setSelectedPaperLanguage(subscriptionLanguage)
    }
    navigate('checkout')
  }

  const verifySampleAccount = () => {
    setIsSignedIn(true)
    if (view === 'login') {
      navigate('sessionDetail')
    }
  }

  const submitMockPayment = () => {
    if (purchaseType === 'subscription') setHasSubscription(true)
    navigate('dashboard')
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
      />
      break
    case 'demo':
      content = <DemoPage language={language} text={text} navigate={navigate} isSignedIn={isSignedIn} onVerify={verifySampleAccount} />
      break
    case 'login':
      content = <LoginPage language={language} text={text} navigate={navigate} onVerify={verifySampleAccount} />
      break
    case 'dashboard':
      content = <DashboardPage language={language} text={text} navigate={navigate} hasSubscription={hasSubscription} />
      break
    case 'checkout':
      content = <CheckoutPage
        language={language}
        text={text}
        navigate={navigate}
        purchaseType={purchaseType}
        hasSubscription={hasSubscription}
        onSuccess={submitMockPayment}
        onFailure={() => setPurchaseError(true)}
      />
      break
    case 'exam':
      content = <ExamPage
        language={language}
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
        onSubmit={() => { setOffline(false); setSaveStatus('saved'); navigate('result') }}
      />
      break
    case 'result':
      content = <ResultsPage language={language} text={text} navigate={navigate} hasSubscription={hasSubscription} gradeAvailable={gradeAvailable} onToggleGrade={() => setGradeAvailable((current) => !current)} />
      break
    case 'account':
      content = <AccountPage
        language={language}
        text={text}
        navigate={navigate}
        examPreference={subscriptionLanguage}
        setExamPreference={setSubscriptionLanguage}
        notificationLanguage={notificationLanguage}
        setNotificationLanguage={setNotificationLanguage}
      />
      break
    case 'adminDashboard':
      content = <AdminDashboardPage {...adminProps} />
      break
    case 'adminPaper':
      content = <AdminPaperPage {...adminProps} />
      break
    case 'adminSitting':
      content = <AdminSittingPage {...adminProps} />
      break
    case 'adminResults':
      content = <AdminResultsPage {...adminProps} />
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
        onSignOut={() => { setIsSignedIn(false); navigate('home') }}
      />
      <main className={view.startsWith('admin') ? 'main-content main-admin' : 'main-content'}>
        {purchaseError && view !== 'checkout' && <div className="sr-only" role="status">{text('tryAgain')}</div>}
        {view.startsWith('admin') && <div className="admin-mobile-heading"><PageHeading eyebrow="ADMINISTRATOR" title={text('admin')} /></div>}
        {content}
      </main>
      <Footer language={language} />
    </div>
  )
}

export default App
