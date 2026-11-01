import { useState, type FormEvent } from 'react'
import { questions, sessions } from './data'
import { PageHeading, SessionCard, StatusBadge, type Translator } from './components'
import { isPasswordValid } from './authValidation'
import type { CheckoutPhase, Language, Navigate, NotificationFeedEntry, PaymentMethod, Session } from './types'

type CommonProps = {
  language: Language
  text: Translator
  navigate: Navigate
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const remaining = (seconds % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${remaining}`
}

export function HomePage({ language, text, navigate, onSelectSession }: CommonProps & { onSelectSession: (session: Session) => void }) {
  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow">{text('heroEyebrow')}</div>
          <h1>{text('heroTitle')}</h1>
          <p>{text('heroBody')}</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => navigate('sessions')}>{text('viewSessions')} <span aria-hidden="true">→</span></button>
            <button className="button button-light" onClick={() => navigate('demo')}>{text('tryDemo')}</button>
          </div>
        </div>
        <div className="hero-document" aria-hidden="true">
          <div className="document-top"><span>DSE</span><span>MOCK EXAM</span></div>
          <div className="document-rule" />
          <div className="document-line wide" />
          <div className="document-line" />
          <div className="document-question"><b>01</b><span>2x + 3 = 11</span></div>
          <div className="document-option"><i /> x = 4</div>
          <div className="document-option checked"><i /> x = 6</div>
          <div className="document-option"><i /> x = 8</div>
          <div className="document-stamp">PRACTICE</div>
        </div>
      </section>
      <section className="home-proof-grid" aria-label={language === 'zh' ? '平台特色' : 'Portal features'}>
        <article className="home-proof-card">
          <span className="home-proof-icon" aria-hidden="true">文</span>
          <div><h2>{text('homeProofBilingualTitle')}</h2><p>{text('homeProofBilingualBody')}</p></div>
        </article>
        <article className="home-proof-card">
          <span className="home-proof-icon" aria-hidden="true">✓</span>
          <div><h2>{text('homeProofResultsTitle')}</h2><p>{text('homeProofResultsBody')}</p></div>
        </article>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{language === 'zh' ? '準備好再出發' : 'PLAN YOUR PRACTICE'}</div>
            <h2>{text('upcoming')}</h2>
          </div>
          <button className="text-button" onClick={() => navigate('sessions')}>{text('viewAll')} <span aria-hidden="true">→</span></button>
        </div>
        <div className="session-grid">
          {sessions.slice(0, 2).map((session) => (
            <SessionCard key={session.id} session={session} language={language} onDetails={() => onSelectSession(session)} />
          ))}
        </div>
      </section>
      <section className="info-strip">
        <div className="info-icon" aria-hidden="true">✓</div>
        <div>
          <strong>{language === 'zh' ? '熟悉考試節奏' : 'Build exam familiarity'}</strong>
          <p>{language === 'zh' ? '共同考試時間、即時保存提示，以及清晰的考後檢討。' : 'Shared exam schedules, clear save status, and structured post-exam review.'}</p>
        </div>
        <button className="text-button" onClick={() => navigate('demo')}>{text('tryDemo')} →</button>
      </section>
    </>
  )
}

export function SessionsPage({ language, text, onSelectSession }: CommonProps & { onSelectSession: (session: Session) => void }) {
  return (
    <>
      <PageHeading
        eyebrow={language === 'zh' ? '所有公開場次' : 'PUBLIC EXAM SITTINGS'}
        title={text('sittings')}
        description={language === 'zh' ? '選擇合適場次，並在報名截止前完成報名。所有資料均為示例。' : 'Choose a suitable sitting and register before the cutoff. All information is sample data.'}
      />
      <div className="filter-row">
        <span className="filter-chip selected">{language === 'zh' ? '全部科目' : 'All subjects'}</span>
        <span className="filter-chip">{language === 'zh' ? '數學' : 'Mathematics'}</span>
        <span className="filter-chip">{language === 'zh' ? '化學' : 'Chemistry'}</span>
        <span className="filter-note">{language === 'zh' ? '示例場次，不代表實際考試安排' : 'Sample sittings; not a real exam schedule'}</span>
      </div>
      <div className="session-grid">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} language={language} onDetails={() => onSelectSession(session)} />
        ))}
      </div>
    </>
  )
}

export function SessionDetailPage({
  language,
  text,
  session,
  selectedLanguage,
  setSelectedLanguage,
  onPurchase,
  hasSubscription,
  isRegistered,
  onBookWithSubscription,
  navigate,
}: CommonProps & {
  session: Session
  selectedLanguage: Language
  setSelectedLanguage: (language: Language) => void
  onPurchase: (type: 'single' | 'subscription') => void
  hasSubscription: boolean
  isRegistered: boolean
  onBookWithSubscription: () => void
}) {
  const paper = language === 'zh'
    ? session.paper.replace('Compulsory Part', '必修部分').replace('Paper', '卷').replace(/ · Set ([A-D])$/, ' · $1 版')
    : session.paper
  const sessionStatus = session.status === 'open' ? 'open' : session.status === 'scheduled' ? 'notOpenYet' : session.status
  return (
    <>
      <button className="back-link" onClick={() => navigate('sessions')}>← {text('back')}</button>
      <PageHeading eyebrow={session.subject} title={paper} description={language === 'zh' ? '考試資訊及報名方式（示例）' : 'Sitting information and registration options (sample)'} />
      <div className="detail-layout">
        <section className="panel detail-main">
          <div className="detail-status"><StatusBadge tone={session.status === 'open' ? 'success' : session.status === 'cancelled' ? 'danger' : 'warning'}>{text(sessionStatus)}</StatusBadge><span className="muted">{language === 'zh' ? '同一場次所有考生使用共同截止時間' : 'All candidates share the same deadline'}</span></div>
          <div className="detail-facts">
            <div><span>{text('starts')}</span><strong>{session.date} · {session.time}</strong></div>
            <div><span>{text('duration')}</span><strong>{language === 'zh' ? session.duration.replace(' minutes', ' 分鐘') : session.duration}</strong></div>
            <div><span>{text('paperQuestions')}</span><strong>{session.questionCount}</strong></div>
            <div><span>{text('cutoff')}</span><strong>{session.cutoff}</strong></div>
            <div><span>{text('availableLanguages')}</span><strong>{text('chinesePaper')} / {text('englishPaper')}</strong></div>
          </div>
          <div className="notice-box">{text('registrationWindow')} {text('lateStart')}</div>
          <div className="form-section">
            <h3>{text('chooseLanguage')}</h3>
            <div className="choice-grid">
              <button className={selectedLanguage === 'zh' ? 'choice-card chosen' : 'choice-card'} onClick={() => setSelectedLanguage('zh')}><span className="radio-dot" />{text('chinesePaper')}</button>
              <button className={selectedLanguage === 'en' ? 'choice-card chosen' : 'choice-card'} onClick={() => setSelectedLanguage('en')}><span className="radio-dot" />{text('englishPaper')}</button>
            </div>
          </div>
        </section>
        <aside className="panel purchase-panel">
          {isRegistered ? <StatusBadge tone="success">{text('alreadyRegistered')}</StatusBadge> : session.status !== 'open' ? <div className="alert alert-info">{session.status === 'scheduled' ? text('notOpenYet') : text('closed')}</div> : <>
            <div className="eyebrow">{text('oneOff')}</div>
            <div className="price-large">{text('oneOffPrice')}</div>
            <p className="fine-print">{text('priceNote')}</p>
            <p className="fine-print">{text('purchaseTerms')}</p>
            <button className="button button-primary full-width" onClick={() => onPurchase('single')}>{text('buyOneOff')}</button>
            <div className="divider-label"><span>{language === 'zh' ? '或' : 'OR'}</span></div>
            <div className="eyebrow">{text('subscription')}</div>
            <div className="price-medium">{text('subscriptionPrice')}</div>
            <p className="fine-print">{text('priceNote')}</p>
            <p className="fine-print">{text('subscriptionTerms')}</p>
            {hasSubscription
              ? <button className="button button-outline full-width" onClick={onBookWithSubscription}>{text('bookWithSubscription')}</button>
              : <button className="button button-outline full-width" onClick={() => onPurchase('subscription')}>{text('subscribe')}</button>}
          </>}
        </aside>
      </div>
    </>
  )
}

export function DashboardPage({
  language,
  text,
  navigate,
  isSignedIn,
  hasSubscription,
  registeredSessions,
  registrationSources,
  onStartSession,
  onSelectSession,
  onCancelSession,
  latestUpdates,
  unreadNotificationCount,
  onOpenNoticeCenter,
}: CommonProps & {
  isSignedIn: boolean
  hasSubscription: boolean
  registeredSessions: Session[]
  registrationSources: Record<string, 'single' | 'subscription'>
  onStartSession: (session: Session) => void
  onSelectSession: (session: Session) => void
  onCancelSession: (session: Session) => void
  latestUpdates: NotificationFeedEntry[]
  unreadNotificationCount: number
  onOpenNoticeCenter: () => void
}) {
  const [showRemedy, setShowRemedy] = useState(false)
  const [remedyChoice, setRemedyChoice] = useState<'refund' | 'voucher' | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Session | null>(null)
  const [cancelError, setCancelError] = useState(false)
  const requestCancellation = (session: Session) => {
    const startsAt = Date.parse(`${session.date}T${session.time.slice(0, 5)}:00+08:00`)
    if (startsAt <= Date.now()) {
      setCancelError(true)
      return
    }
    setCancelError(false)
    setCancelTarget(session)
  }
  return (
    <>
      <PageHeading eyebrow={language === 'zh' ? '考生個人中心' : 'CANDIDATE DASHBOARD'} title={text('studentDashboardTitle')} description={language === 'zh' ? '以下所有場次及成績均為原型示例。' : 'All sittings and results shown here are prototype samples.'} action={<button className="button button-outline" onClick={() => navigate('account')}>{text('accountSettings')}</button>} />
      <div className="dashboard-grid">
        <section className="panel upcoming-panel">
          <div className="panel-heading"><h2>{text('nextExam')}</h2><StatusBadge tone={registeredSessions.length ? 'success' : 'neutral'}>{registeredSessions.length}</StatusBadge></div>
          {registeredSessions.length === 0
            ? <p className="muted">{text('noRegisteredSessions')}</p>
            : registeredSessions.map((session) => <div className="registered-session" key={session.id}>
              <div><div className="eyebrow">{session.subject}</div><h3>{session.paper}</h3><p className="muted">{session.date} · {session.time} · {session.duration}</p></div>
              <div className="registered-session-actions">
                <button className="button button-primary" onClick={() => onStartSession(session)}>{text('startExam')}</button>
                <button className="text-button" onClick={() => requestCancellation(session)}>{text('cancelBooking')}</button>
              </div>
            </div>)}
          {cancelError && <div className="alert alert-danger" role="alert">{text('cancellationUnavailable')}</div>}
        </section>
        <section className="panel subscription-panel">
          <div className="panel-heading"><h2>{text('membership')}</h2><span className="card-icon" aria-hidden="true">◷</span></div>
          <StatusBadge tone={hasSubscription ? 'success' : 'neutral'}>{hasSubscription ? (language === 'zh' ? '有效' : 'Active') : (language === 'zh' ? '未訂閱' : 'Not subscribed')}</StatusBadge>
          <p className="muted">{hasSubscription ? `${text('activeUntil')} · ${text('manualBookings')}` : (language === 'zh' ? 'HK$99／30 日；手動付款，不會自動續訂。' : 'HK$99 for 30 days; paid manually with no auto-renewal.')}</p>
          <button className="button button-outline" onClick={() => navigate('sessions')}>{hasSubscription ? text('availableSittings') : text('subscribe')}</button>
        </section>
        <section className="panel result-summary">
          <div className="panel-heading"><h2>{text('recentResult')}</h2><span className="card-icon" aria-hidden="true">▤</span></div>
          <p className="eyebrow">{language === 'zh' ? '數學 · 示範卷' : 'Mathematics · Sample paper'}</p>
          <div className="score-line"><strong>{text('scoreValue')}</strong><span>{text('relativeGrade')} · 4</span></div>
          <button className="text-button" onClick={() => navigate('result')}>{text('viewResult')} →</button>
        </section>
        <section className="panel available-panel">
          <div className="panel-heading"><h2>{text('availableSittings')}</h2><button className="text-button" onClick={() => navigate('sessions')}>{text('viewAll')} →</button></div>
          {sessions.filter((session) => session.status === 'open' && !registeredSessions.some((registered) => registered.id === session.id)).slice(0, 3).map((session) => (
            <div className="compact-session" key={session.id}>
              <div className="date-square"><strong>{session.date.slice(8)}</strong><small>{session.date.slice(5, 7)}</small></div>
              <div><strong>{session.subject}</strong><small>{session.date} · {session.time}</small></div>
              <button className="icon-button" aria-label={text('details')} onClick={() => onSelectSession(session)}>→</button>
            </div>
          ))}
        </section>
        {isSignedIn && <section className="panel notice-preview-panel">
          <div className="panel-heading"><h2>{text('notifications')}</h2><StatusBadge tone={unreadNotificationCount ? 'warning' : 'success'}>{unreadNotificationCount} · {text('unread')}</StatusBadge></div>
          {latestUpdates.length
            ? latestUpdates.slice(0, 2).map((entry) => <article className="notice-preview-item" key={entry.id}><span className="category-chip">{text(entry.category === 'announcement' ? 'notificationAnnouncement' : ({
              payment: 'notificationPayment',
              registration: 'notificationRegistration',
              sitting: 'notificationSitting',
              result: 'notificationResult',
              incident: 'notificationIncident',
            } as const)[entry.category])}</span><strong>{entry.title[language]}</strong><p>{entry.body[language]}</p></article>)
            : <p className="muted">{text('noNotifications')}</p>}
          <button className="text-button" onClick={onOpenNoticeCenter}>{text('viewAllNotifications')} →</button>
        </section>}
      </div>
      <div className="info-strip remedy-preview-toggle">
        <div className="info-icon" aria-hidden="true">↺</div>
        <div><strong>{language === 'zh' ? '場次取消補救示例' : 'Sitting-cancellation remedy preview'}</strong><p>{language === 'zh' ? '查看現金付款單場考生的退款／代用券選擇。' : 'Preview the refund-or-voucher choice for a cash-paid single-sitting candidate.'}</p></div>
        <button className="text-button" onClick={() => { setShowRemedy((shown) => !shown); setRemedyChoice(null) }}>{showRemedy ? (language === 'zh' ? '收起' : 'Close') : (language === 'zh' ? '查看選項' : 'View options')}</button>
      </div>
      {showRemedy && <section className="panel remedy-panel">
        <div className="panel-heading"><div><div className="eyebrow">{language === 'zh' ? '示例情況' : 'SAMPLE SCENARIO'}</div><h2>{language === 'zh' ? '平台取消／改期' : 'Platform cancellation / reschedule'}</h2></div><StatusBadge tone="warning">{language === 'zh' ? '選擇待處理' : 'Choice pending'}</StatusBadge></div>
        <p className="muted">{language === 'zh' ? '通知電郵已成功送達，因此 14 日選擇期限已開始。個別事故申訴不適用退款。' : 'The notice email was successfully delivered, so the 14-day choice window has started. Individual incident appeals are not refundable.'}</p>
        <p className="fine-print">{text('refundWindow')}</p>
        <p className="fine-print">{text('refundExpiryRule')}</p>
        {!remedyChoice ? <div className="button-row">
          <button className="button button-primary" onClick={() => setRemedyChoice('refund')}>{text('refundChoice')}</button>
          <button className="button button-outline" onClick={() => setRemedyChoice('voucher')}>{text('voucherChoice')}</button>
        </div> : <div className="alert alert-info" role="status">{remedyChoice === 'refund'
          ? (language === 'zh' ? '示例：已提交一筆原付款方式全額退款；正式服務須核實退款狀態，失敗或不明確時交管理員處理。' : 'Sample: one full original-method refund was submitted. Production must verify the refund status and route failures or ambiguity to an administrator.')
          : (language === 'zh' ? '示例：已發出一張帳戶綁定代用券。' : 'Sample: an account-bound replacement voucher was issued.')}</div>}
      </section>}
      {cancelTarget && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelTarget(null) }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
            <h2 id="cancel-title">{text('cancelConfirm')}</h2>
            <p>{registrationSources[cancelTarget.id] === 'subscription' ? text('cancelMonthlyWarning') : text('cancelSingleWarning')}</p>
            <div className="button-row">
              <button className="button button-outline" onClick={() => setCancelTarget(null)}>{text('back')}</button>
              <button className="button button-danger-outline" onClick={() => { onCancelSession(cancelTarget); setCancelTarget(null) }}>{text('cancelBooking')}</button>
            </div>
          </div>
      </div>}
    </>
  )
}

export function CheckoutPage({
  language,
  text,
  purchaseType,
  hasSubscription,
  session,
  selectedLanguage,
  paymentMethod,
  setPaymentMethod,
  checkoutPhase,
  onStartPayment,
  onConfirmPaid,
  onConfirmUnpaid,
  navigate,
}: CommonProps & {
  purchaseType: 'single' | 'subscription'
  hasSubscription: boolean
  session: Session
  selectedLanguage: Language
  paymentMethod: PaymentMethod
  setPaymentMethod: (method: PaymentMethod) => void
  checkoutPhase: CheckoutPhase
  onStartPayment: () => void
  onConfirmPaid: () => void
  onConfirmUnpaid: () => void
}) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const isSubscription = purchaseType === 'subscription'
  return (
    <>
      <button className="back-link" onClick={() => navigate('sessionDetail')}>← {text('back')}</button>
      <PageHeading eyebrow={text('paymentDemo')} title={isSubscription ? text('subscription') : text('oneOff')} description={text('noRealPayment')} />
      <div className="checkout-layout">
        <section className="panel checkout-panel">
          <div className="checkout-item">
            <div className="document-thumb" aria-hidden="true">DSE</div>
            <div><strong>{isSubscription ? text('subscription') : session.paper}</strong><small>{isSubscription ? text('manualBookings') : `${session.date} · ${session.time} · ${selectedLanguage === 'zh' ? text('chinesePaper') : text('englishPaper')}`}</small></div>
            <strong>{isSubscription ? text('subscriptionPrice') : text('oneOffPrice')}</strong>
          </div>
          <div className="checkout-terms">
            <h3>{language === 'zh' ? '購買前請確認' : 'Before you continue'}</h3>
            <p>{isSubscription ? text('subscriptionBookingTerms') : text('purchaseTerms')}</p>
            <p>{text('priceNote')}</p>
            {isSubscription && <p>{text('subscriptionTerms')}</p>}
            <label className="check-row"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />{language === 'zh' ? '我已閱讀以上示例條款。' : 'I have read the sample terms above.'}</label>
          </div>
          {hasSubscription && isSubscription && <div className="alert alert-info">{language === 'zh' ? '此示例帳戶已有有效月票；毋須再次付款。' : 'This sample account already has an active subscription; no payment is needed.'}</div>}
          {checkoutPhase === 'unpaid' && <div className="alert alert-warning" role="status">{text('checkoutExpired')}</div>}
          {checkoutPhase !== 'pending' && <>
            <fieldset className="payment-methods" disabled={hasSubscription && isSubscription}>
              <legend>{text('paymentMethod')}</legend>
              {(['payme', 'octopus'] as const).map((method) => (
                <label className={paymentMethod === method ? 'payment-choice selected' : 'payment-choice'} key={method}>
                  <input type="radio" name="payment-method" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                  <span>{text(method)}</span>
                  <small>{language === 'zh' ? '原型示意 · 未連接服務' : 'Preview only · not connected'}</small>
                </label>
              ))}
            </fieldset>
            <button className="button button-primary full-width" disabled={!acceptedTerms || (hasSubscription && isSubscription)} onClick={onStartPayment}>
              {checkoutPhase === 'unpaid' ? text('retryPayment') : (language === 'zh' ? `以 ${text(paymentMethod)} 開始付款` : `Continue with ${text(paymentMethod)}`)}
            </button>
          </>}
          {checkoutPhase === 'pending' && <div className="payment-pending">
            <StatusBadge tone="warning">{text('pendingConfirmation')}</StatusBadge>
            <p>{text('pendingNoRetry')}</p>
            <p className="fine-print">{language === 'zh' ? '瀏覽器返回本頁不代表付款成功；只有伺服器確認後才會建立報名。' : 'Returning to this page does not prove payment. Registration is created only after server confirmation.'}</p>
            <div className="button-row">
              <button className="button button-primary" onClick={onConfirmPaid}>{text('confirmPaid')}</button>
              <button className="button button-outline" onClick={onConfirmUnpaid}>{text('confirmExpired')}</button>
            </div>
          </div>}
          <p className="fine-print">{text('noRealPayment')}</p>
        </section>
        <aside className="checkout-assurance">
          <div className="assurance-icon" aria-hidden="true">✓</div>
          <h3>{language === 'zh' ? '同一服務商支援兩種錢包' : 'One provider for both wallets'}</h3>
          <p>{language === 'zh' ? 'QFPay 僅為待驗證的設計假設。此原型不連接任何服務商，不會收取款項。' : 'QFPay is only a provisional, unverified design assumption. This prototype is not connected to any provider and takes no payment.'}</p>
        </aside>
      </div>
    </>
  )
}

export function DemoPage({ language, text }: CommonProps) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const question = questions[index]
  return (
    <>
      <PageHeading eyebrow={text('freeDemo')} title={language === 'zh' ? '免費試做示範' : 'Free sample practice'} description={text('publicSampleIntro')} />
      <section className="panel question-panel demo-question">
        <div className="question-topline"><span className="eyebrow">{text('question')} {Math.min(index + 1, questions.length)} {text('of')} {questions.length}</span><StatusBadge>{language === 'zh' ? '不限時 · 不計分' : 'Untimed · Not scored'}</StatusBadge></div>
        {question ? <>
        <h2 className="question-prompt">{question.prompt[language]}</h2>
        <div className="option-list">
          {question.options[language].map((option, optionIndex) => (
            <button key={option} className={`option-button ${selectedOption === optionIndex ? 'selected' : ''}`} aria-pressed={selectedOption === optionIndex} onClick={() => { setSelectedOption(optionIndex); setRevealed(false) }}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>
          ))}
        </div>
        {revealed && <div className="alert alert-success"><strong>{text('correctAnswer')}: {question.options[language][question.correct]}</strong><p>{question.explanation[language]}</p></div>}
        <div className="question-actions">
          <button className="button button-outline" disabled={selectedOption === null} onClick={() => setRevealed(true)}>{text('showAnswer')}</button>
          <button className="button button-primary" onClick={() => { setIndex(index + 1); setSelectedOption(null); setRevealed(false) }} disabled={!revealed}>{text('next')} →</button>
        </div>
        </> : <div className="sample-complete">
          <h2>{language === 'zh' ? '示範已完成' : 'Sample complete'}</h2>
          <p className="muted">{text('samplePrivacyNotice')}</p>
          <button className="button button-outline" onClick={() => { setIndex(0); setSelectedOption(null); setRevealed(false) }}>{language === 'zh' ? '重新開始' : 'Start again'}</button>
        </div>}
      </section>
      <p className="fine-print">{text('samplePrivacyNotice')}</p>
    </>
  )
}

export function ExamPage({
  language,
  paperLanguage,
  text,
  index,
  answers,
  marked,
  saveStatus,
  offline,
  onAnswer,
  onIndex,
  onToggleMarked,
  onToggleOffline,
  onSubmit,
  remainingSeconds,
}: CommonProps & {
  paperLanguage: Language
  index: number
  answers: Record<number, number>
  marked: Set<number>
  saveStatus: 'saved' | 'saving' | 'failed'
  offline: boolean
  onAnswer: (questionId: number, value: number) => void
  onIndex: (index: number) => void
  onToggleMarked: (questionId: number) => void
  onToggleOffline: () => void
  onSubmit: () => void
  remainingSeconds: number
}) {
  const question = questions[index]
  const displayIndex = index
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const saveLabel = offline || saveStatus === 'failed' ? text('saveFailed') : saveStatus === 'saving' ? text('saving') : text('saved')
  return (
    <>
      <div className="exam-topbar">
        <div><div className="eyebrow">{language === 'zh' ? '原型作答示意 · 非完整試卷' : 'Prototype attempt · Not a full paper'}</div><h1>{text('examTitle')}</h1><p className="fine-print">{text('questionTarget')} · {language === 'zh' ? '本原型只示範 5 題' : 'This prototype demonstrates 5 items only'}</p></div>
        <div className="exam-timer"><small>{text('remaining')}</small><strong>{formatTime(remainingSeconds)}</strong><span>{text('commonDeadline')}: 10:15 HKT</span></div>
      </div>
      {offline && <div className="alert alert-danger" role="alert">{text('offline')}</div>}
      <div className={`save-indicator ${offline || saveStatus === 'failed' ? 'save-error' : saveStatus === 'saving' ? 'save-pending' : ''}`} role="status">
        <span aria-hidden="true">{offline || saveStatus === 'failed' ? '!' : saveStatus === 'saving' ? '◷' : '✓'}</span>{saveLabel}
      </div>
      <div className="exam-layout">
        <section className="panel question-panel">
          <div className="question-topline">
            <span className="eyebrow">{text('question')} {displayIndex + 1} {text('of')} {questions.length} · {language === 'zh' ? '每題 1 分' : '1 point'}</span>
            <button className={marked.has(displayIndex) ? 'flag-button flagged' : 'flag-button'} onClick={() => onToggleMarked(displayIndex)}>{marked.has(displayIndex) ? '⚑ ' + text('marked') : '⚐ ' + text('markReview')}</button>
          </div>
          <h2 className="question-prompt">{question.prompt[paperLanguage]}</h2>
          <div className="option-list">
            {question.options[paperLanguage].map((option, optionIndex) => (
              <button
                key={option}
                className={answers[displayIndex] === optionIndex ? 'option-button selected' : 'option-button'}
                onClick={() => onAnswer(displayIndex, optionIndex)}
              >
                <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>{option}
              </button>
            ))}
          </div>
          <div className="question-actions">
            <button className="button button-outline" onClick={() => onIndex(Math.max(0, index - 1))} disabled={index === 0}>← {text('previous')}</button>
            <button className="button button-primary" onClick={() => onIndex(Math.min(index + 1, questions.length - 1))} disabled={index === questions.length - 1}>{text('next')} →</button>
          </div>
          <div className="exam-mobile-save">{saveLabel}</div>
        </section>
        <aside className="panel question-nav-panel">
          <div className="panel-heading"><h2>{text('questionNav')}</h2><span className="muted">{Object.keys(answers).length}/{questions.length}</span></div>
          <div className="question-number-grid">
            {questions.map((item, number) => (
              <button
                key={item.id}
                className={`question-number ${number === displayIndex ? 'current' : ''} ${answers[number] !== undefined ? 'answered' : ''} ${marked.has(number) ? 'marked' : ''}`}
                onClick={() => onIndex(number)}
                aria-label={`${text('question')} ${number + 1}${marked.has(number) ? `, ${text('marked')}` : ''}`}
              >{number + 1}</button>
            ))}
          </div>
          <div className="legend-list"><span><i className="legend-dot answered-dot" />{language === 'zh' ? '已作答' : 'Answered'}</span><span><i className="legend-dot marked-dot" />{text('marked')}</span></div>
          <button className="button button-danger-outline full-width" onClick={() => setShowSubmitConfirm(true)}>{text('submit')}</button>
          <button className="text-button full-width" onClick={onToggleOffline}>{offline ? text('restoreConnection') : text('simulateOffline')}</button>
        </aside>
      </div>
      {showSubmitConfirm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSubmitConfirm(false) }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="submit-title">
            <h2 id="submit-title">{text('submit')}?</h2>
            <p>{language === 'zh' ? '交卷後不能再更改答案。這只會模擬提交，不會保存真實作答。' : 'You cannot change answers after submission. This only simulates submission; no real answers are stored.'}</p>
            <div className="button-row"><button className="button button-outline" onClick={() => setShowSubmitConfirm(false)}>{text('back')}</button><button className="button button-primary" onClick={onSubmit}>{text('submit')}</button></div>
          </div>
        </div>
      )}
    </>
  )
}

export function ResultsPage({
  language,
  paperLanguage,
  text,
  hasSubscription,
  gradeAvailable,
  onToggleGrade,
  navigate,
  session,
  answers,
  onSelectSession,
}: CommonProps & {
  paperLanguage: Language
  hasSubscription: boolean
  gradeAvailable: boolean
  onToggleGrade: () => void
  session: Session
  answers: Record<number, number>
  onSelectSession: (session: Session) => void
}) {
  const [showReview, setShowReview] = useState(true)
  const correctCount = questions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0)
  const nextSessions = sessions.filter((item) => item.date > session.date && item.status === 'open').slice(0, 3)
  return (
    <>
      <div className="result-hero">
        <div><div className="eyebrow">{text('resultPublished')}</div><h1>{text('resultTitle')}</h1><p className="muted">{session.paper} · {session.date}</p></div>
        <StatusBadge tone="success">{language === 'zh' ? '已完成' : 'Completed'}</StatusBadge>
      </div>
      <div className="result-summary-grid">
        <section className="panel score-card"><span>{text('totalScore')} · {language === 'zh' ? '5 題原型樣題' : '5 prototype items'}</span><strong>{correctCount} <small>/ {questions.length}</small></strong><div className="score-meter"><i style={{ width: `${correctCount / questions.length * 100}%` }} /></div><p className="fine-print">{language === 'zh' ? '正式場次目標為 45 題；此分數只代表原型示範。' : 'Full sittings target 45 questions; this score is for the prototype only.'}</p></section>
        <section className="panel grade-card"><span>{text('relativeGrade')}</span>{gradeAvailable ? <><strong>{language === 'zh' ? '第 76 百分位 · 第 4 級' : '76th percentile · Level 4'}</strong><p className="fine-print">{language === 'zh' ? '僅為平台內相對模考示例，不是考評局評級或 HKDSE 預測。' : 'Platform-relative mock sample only; not an HKEAA grade or HKDSE prediction.'}</p></> : <p>{text('gradeNotReady')}</p>}<button className="text-button" onClick={onToggleGrade}>{language === 'zh' ? '切換示例：統計未達門檻' : 'Toggle sample: threshold not met'}</button></section>
      </div>
      <div className="section-heading review-heading"><div><div className="eyebrow">{text('answerReview')}</div><h2>{language === 'zh' ? '逐題查看作答' : 'Review your responses'}</h2></div><button className="button button-outline" onClick={() => setShowReview(!showReview)}>{showReview ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展開' : 'Expand')}</button></div>
      {showReview && <div className="review-list">{questions.map((question, index) => {
        const studentAnswer = answers[index]
        return (
          <article className="panel review-card" key={question.id}>
            <div className="review-card-top"><span className="eyebrow">{text('question')} {index + 1}</span><StatusBadge tone={studentAnswer === question.correct ? 'success' : 'warning'}>{studentAnswer === undefined ? (language === 'zh' ? '未作答' : 'Blank') : studentAnswer === question.correct ? (language === 'zh' ? '正確' : 'Correct') : (language === 'zh' ? '需檢討' : 'Review')}</StatusBadge></div>
            <h3>{question.prompt[paperLanguage]}</h3>
            <div className="review-answers"><p><span>{text('yourAnswer')}</span><strong>{studentAnswer === undefined ? '—' : question.options[paperLanguage][studentAnswer]}</strong></p><p><span>{text('correctAnswer')}</span><strong>{question.options[paperLanguage][question.correct]}</strong></p></div>
            {hasSubscription ? <div className="explanation-box"><strong>{text('explanation')}</strong><p>{question.explanation[paperLanguage]}</p></div> : <div className="locked-explanation">▣ {text('explanationLocked')}</div>}
          </article>
        )
      })}</div>}
      <section className="panel next-sittings-panel">
        <h2>{language === 'zh' ? '繼續練習' : 'Keep practising'}</h2>
        <p className="muted">{text('nextSessionsAfterSubmit')}</p>
        <div className="next-sitting-links">{nextSessions.map((item) => <button className="button button-outline" key={item.id} onClick={() => onSelectSession(item)}>{item.date} · {item.time} →</button>)}</div>
      </section>
      <div className="result-actions"><button className="button button-outline" onClick={() => navigate('dashboard')}>{text('dashboard')}</button><button className="button button-primary" onClick={() => navigate('sessions')}>{text('viewSessions')}</button></div>
    </>
  )
}

export function AccountPage({
  language,
  text,
  navigate,
  notificationLanguage,
  setNotificationLanguage,
  email,
  onPasswordChange,
}: CommonProps & {
  notificationLanguage: Language
  setNotificationLanguage: (language: Language) => void
  email: string
  onPasswordChange: () => void
}) {
  const [saved, setSaved] = useState(false)
  const [telegramEnabled, setTelegramEnabled] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordChanged, setPasswordChanged] = useState(false)
  const submitPasswordChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentPassword) {
      setPasswordError(text('currentPasswordRequired'))
      return
    }
    if (!isPasswordValid(newPassword)) {
      setPasswordError(text('passwordRequirements'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(text('passwordMismatch'))
      return
    }
    setPasswordError('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordChanged(true)
    onPasswordChange()
  }
  return (
    <>
      <PageHeading eyebrow={language === 'zh' ? '個人資料與通知' : 'PROFILE & NOTIFICATIONS'} title={text('accountSettings')} description={language === 'zh' ? '此頁使用示例偏好，不會連接真實帳戶。' : 'Sample preferences only; no real account is connected.'} />
      <section className="panel settings-panel">
        <div className="profile-heading"><div className="avatar">DS</div><div><strong>Demo Student</strong><small>{email} · {language === 'zh' ? '示例帳戶' : 'Sample account'}</small></div><StatusBadge tone="success">{language === 'zh' ? '已驗證' : 'Verified'}</StatusBadge></div>
        <div className="settings-row"><div><strong>{text('notificationLanguage')}</strong><small>{language === 'zh' ? '與每場試卷語言分開設定。' : 'Separate from the language selected for each exam.'}</small></div><select value={notificationLanguage} onChange={(event) => setNotificationLanguage(event.target.value as Language)}><option value="zh">{text('chinese')}</option><option value="en">{text('english')}</option></select></div>
        <div className="settings-row"><div><strong>{text('telegramStatus')}</strong><small>{language === 'zh' ? '自願接收非敏感提醒，可隨時解除；電郵仍用於正式通知。' : 'Optional non-sensitive reminders; you can opt out at any time. Email remains the formal channel.'}</small></div><label className="toggle-control"><input type="checkbox" checked={telegramEnabled} onChange={(event) => setTelegramEnabled(event.target.checked)} /><span>{telegramEnabled ? text('linkedDemo') : (language === 'zh' ? '已關閉' : 'Off')}</span></label></div>
        <div className="settings-row"><div><strong>{language === 'zh' ? '推廣訊息' : 'Marketing messages'}</strong><small>{language === 'zh' ? '預設關閉，與必要服務通知分開。' : 'Off by default and separate from essential service notices.'}</small></div><label className="toggle-control"><input type="checkbox" /><span>{language === 'zh' ? '未同意' : 'Not opted in'}</span></label></div>
        {saved && <div className="alert alert-success" role="status">{language === 'zh' ? '偏好已在原型中更新。' : 'Preferences updated in the prototype.'}</div>}
        <div className="button-row"><button className="button button-outline" onClick={() => navigate('dashboard')}>{text('back')}</button><button className="button button-primary" onClick={() => setSaved(true)}>{text('savePreference')}</button></div>
      </section>
      <section className="panel settings-panel password-panel">
        <h2>{text('changePassword')}</h2>
        <p className="muted">{text('passwordChangeSecurityNotice')}</p>
        {passwordChanged && <div className="alert alert-success" role="status">{text('passwordChangeSuccess')}</div>}
        <form className="auth-form" onSubmit={submitPasswordChange}>
          <label className="field-label" htmlFor="current-password">{text('currentPassword')}<input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
          <label className="field-label" htmlFor="new-password">{text('newPassword')}<input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required aria-describedby="change-password-requirements" /></label>
          <small id="change-password-requirements" className="field-hint">{text('passwordRequirements')}</small>
          <label className="field-label" htmlFor="confirm-new-password">{text('confirmPassword')}<input id="confirm-new-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
          {passwordError && <div className="field-error" role="alert">{passwordError}</div>}
          <button className="button button-primary" type="submit">{text('changePassword')}</button>
        </form>
      </section>
    </>
  )
}
