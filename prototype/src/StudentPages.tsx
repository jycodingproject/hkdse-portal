import { useState } from 'react'
import { questions, sessions } from './data'
import { PageHeading, SessionCard, StatusBadge, type Translator } from './components'
import type { Language, Navigate, Session } from './types'

type CommonProps = {
  language: Language
  text: Translator
  navigate: Navigate
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
  navigate,
}: CommonProps & {
  session: Session
  selectedLanguage: Language
  setSelectedLanguage: (language: Language) => void
  onPurchase: (type: 'single' | 'subscription') => void
}) {
  return (
    <>
      <button className="back-link" onClick={() => navigate('sessions')}>← {text('back')}</button>
      <PageHeading eyebrow={session.subject} title={language === 'zh' ? session.paper.replace('Compulsory Part', '必修部分').replace('Paper', '卷') : session.paper} description={language === 'zh' ? '考試資訊及報名方式（示例）' : 'Sitting information and registration options (sample)'} />
      <div className="detail-layout">
        <section className="panel detail-main">
          <div className="detail-status"><StatusBadge tone="success">{text('open')}</StatusBadge><span className="muted">{language === 'zh' ? '同一場次所有考生使用共同截止時間' : 'All candidates share the same deadline'}</span></div>
          <div className="detail-facts">
            <div><span>{text('starts')}</span><strong>{session.date} · {session.time}</strong></div>
            <div><span>{text('duration')}</span><strong>{session.duration}</strong></div>
            <div><span>{text('cutoff')}</span><strong>{session.cutoff}</strong></div>
            <div><span>{text('availableLanguages')}</span><strong>{text('chinesePaper')} / {text('englishPaper')}</strong></div>
          </div>
          <div className="form-section">
            <h3>{text('chooseLanguage')}</h3>
            <div className="choice-grid">
              <button className={selectedLanguage === 'zh' ? 'choice-card chosen' : 'choice-card'} onClick={() => setSelectedLanguage('zh')}><span className="radio-dot" />{text('chinesePaper')}</button>
              <button className={selectedLanguage === 'en' ? 'choice-card chosen' : 'choice-card'} onClick={() => setSelectedLanguage('en')}><span className="radio-dot" />{text('englishPaper')}</button>
            </div>
          </div>
        </section>
        <aside className="panel purchase-panel">
          <div className="eyebrow">{text('oneOff')}</div>
          <div className="price-large">{text('oneOffPrice')}</div>
          <p className="fine-print">{text('purchaseTerms')}</p>
          <button className="button button-primary full-width" onClick={() => onPurchase('single')}>{text('buyOneOff')}</button>
          <div className="divider-label"><span>{language === 'zh' ? '或' : 'OR'}</span></div>
          <div className="eyebrow">{text('subscription')}</div>
          <div className="price-medium">{text('subscriptionPrice')}</div>
          <p className="fine-print">{text('subscriptionTerms')}</p>
          <button className="button button-outline full-width" onClick={() => onPurchase('subscription')}>{text('subscribe')}</button>
        </aside>
      </div>
    </>
  )
}

export function LoginPage({ language, text, onVerify, navigate }: CommonProps & { onVerify: () => void }) {
  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <div className="auth-seal" aria-hidden="true">DSE</div>
        <div className="eyebrow">{language === 'zh' ? '考生入口' : 'CANDIDATE ACCESS'}</div>
        <h1>{text('signIn')}</h1>
        <p className="muted">{text('signInNotice')}</p>
        <div className="mock-form">
          <label>{language === 'zh' ? '電郵地址（示意）' : 'Email address (sample)'}</label>
          <div className="fake-input" aria-disabled="true">student@example.test</div>
          <label>{language === 'zh' ? '密碼' : 'Password'}</label>
          <div className="fake-input" aria-disabled="true">••••••••••</div>
        </div>
        <button className="button button-primary full-width" onClick={onVerify}>{text('welcomeDemo')}</button>
        <div className="divider-label"><span>{language === 'zh' ? '或' : 'OR'}</span></div>
        <button className="button button-outline full-width" onClick={onVerify}>{text('simulateVerify')}</button>
        <p className="fine-print center-text">{language === 'zh' ? '此處使用示例帳戶，以上資料不會傳送或保存。' : 'A sample account is used. Nothing above is sent or stored.'}</p>
        <button className="text-button full-width" onClick={() => navigate('sessions')}>{text('back')} · {text('sittings')}</button>
      </section>
    </div>
  )
}

export function DashboardPage({ language, text, navigate, hasSubscription }: CommonProps & { hasSubscription: boolean }) {
  const nextSession = sessions[0]
  return (
    <>
      <PageHeading eyebrow={language === 'zh' ? '考生個人中心' : 'CANDIDATE DASHBOARD'} title={text('studentDashboardTitle')} description={language === 'zh' ? '以下所有場次及成績均為原型示例。' : 'All sittings and results shown here are prototype samples.'} action={<button className="button button-outline" onClick={() => navigate('account')}>{text('accountSettings')}</button>} />
      <div className="dashboard-grid">
        <section className="panel upcoming-panel">
          <div className="panel-heading"><h2>{text('nextExam')}</h2><StatusBadge tone="success">{text('open')}</StatusBadge></div>
          <div className="eyebrow">{nextSession.subject}</div>
          <h3>{language === 'zh' ? '數學必修部分 · Paper 2' : nextSession.paper}</h3>
          <p className="muted">{nextSession.date} · {nextSession.time} · {nextSession.duration}</p>
          <div className="dashboard-callout">{language === 'zh' ? '已報名 · 中文試卷' : 'Registered · English paper'}</div>
          <button className="button button-primary" onClick={() => navigate('exam')}>{text('startExam')}</button>
        </section>
        <section className="panel subscription-panel">
          <div className="panel-heading"><h2>{text('membership')}</h2><span className="card-icon" aria-hidden="true">◷</span></div>
          <StatusBadge tone={hasSubscription ? 'success' : 'neutral'}>{hasSubscription ? (language === 'zh' ? '有效' : 'Active') : (language === 'zh' ? '未訂閱' : 'Not subscribed')}</StatusBadge>
          <p className="muted">{hasSubscription ? text('activeUntil') : (language === 'zh' ? '訂閱會自動報名有效期內符合條件的場次。' : 'Eligible sittings are automatically registered during an active term.')}</p>
          <button className="button button-outline" onClick={() => navigate('checkout')}>{text('subscribe')}</button>
        </section>
        <section className="panel result-summary">
          <div className="panel-heading"><h2>{text('recentResult')}</h2><span className="card-icon" aria-hidden="true">▤</span></div>
          <p className="eyebrow">{language === 'zh' ? '數學 · 示範卷' : 'Mathematics · Sample paper'}</p>
          <div className="score-line"><strong>{text('scoreValue')}</strong><span>{text('grade')} · Level 4</span></div>
          <button className="text-button" onClick={() => navigate('result')}>{text('viewResult')} →</button>
        </section>
        <section className="panel available-panel">
          <div className="panel-heading"><h2>{text('availableSittings')}</h2><button className="text-button" onClick={() => navigate('sessions')}>{text('viewAll')} →</button></div>
          {sessions.slice(0, 2).map((session) => (
            <div className="compact-session" key={session.id}>
              <div className="date-square"><strong>{session.date.slice(8)}</strong><small>{session.date.slice(5, 7)}</small></div>
              <div><strong>{session.subject}</strong><small>{session.date} · {session.time}</small></div>
              <button className="icon-button" aria-label={text('details')} onClick={() => navigate('sessionDetail')}>→</button>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

export function CheckoutPage({
  language,
  text,
  purchaseType,
  hasSubscription,
  onSuccess,
  onFailure,
  navigate,
}: CommonProps & {
  purchaseType: 'single' | 'subscription'
  hasSubscription: boolean
  onSuccess: () => void
  onFailure: () => void
}) {
  const [failed, setFailed] = useState(false)
  const isSubscription = purchaseType === 'subscription'
  return (
    <>
      <button className="back-link" onClick={() => navigate('sessionDetail')}>← {text('back')}</button>
      <PageHeading eyebrow={text('paymentDemo')} title={isSubscription ? text('subscription') : text('oneOff')} description={text('noRealPayment')} />
      <div className="checkout-layout">
        <section className="panel checkout-panel">
          <div className="checkout-item">
            <div className="document-thumb" aria-hidden="true">DSE</div>
            <div><strong>{isSubscription ? text('subscription') : 'Mathematics · Paper 2'}</strong><small>{isSubscription ? text('activeUntil') : '2026-11-08 · 09:00 HKT'}</small></div>
            <strong>{isSubscription ? text('subscriptionPrice') : text('oneOffPrice')}</strong>
          </div>
          <div className="checkout-terms">
            <h3>{language === 'zh' ? '購買前請確認' : 'Before you continue'}</h3>
            <p>{text('purchaseTerms')}</p>
            {isSubscription && <p>{text('subscriptionTerms')}</p>}
            <label className="check-row"><input type="checkbox" defaultChecked />{language === 'zh' ? '我已閱讀以上示例條款。' : 'I have read the sample terms above.'}</label>
          </div>
          {failed && <div className="alert alert-danger" role="alert">{language === 'zh' ? '示例付款未成功。沒有收取款項，請重試或返回。' : 'Sample payment failed. No payment was taken. Please retry or go back.'}</div>}
          {hasSubscription && isSubscription && <div className="alert alert-info">{language === 'zh' ? '此示例帳戶已有有效訂閱。' : 'This sample account already has an active subscription.'}</div>}
          <div className="button-row">
            <button className="button button-primary" onClick={onSuccess}>{text('simulateSuccess')}</button>
            <button className="button button-outline" onClick={() => { setFailed(true); onFailure() }}>{text('simulateFailure')}</button>
          </div>
          <p className="fine-print">{text('noRealPayment')}</p>
        </section>
        <aside className="checkout-assurance">
          <div className="assurance-icon" aria-hidden="true">✓</div>
          <h3>{language === 'zh' ? '安全付款流程示意' : 'Secure checkout preview'}</h3>
          <p>{language === 'zh' ? '正式服務將由支付服務商處理付款資料。本原型不連接支付服務。' : 'In production, payment details would be handled by a payment provider. This prototype is not connected to one.'}</p>
        </aside>
      </div>
    </>
  )
}

export function DemoPage({ language, text, isSignedIn, onVerify }: CommonProps & { isSignedIn: boolean; onVerify: () => void }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const question = questions[index % questions.length]
  if (!isSignedIn) {
    return (
      <div className="auth-wrap">
        <section className="panel auth-panel demo-gate">
          <div className="auth-seal" aria-hidden="true">FREE</div>
          <div className="eyebrow">{text('freeDemo')}</div>
          <h1>{language === 'zh' ? '免費試做示範' : 'Free sample practice'}</h1>
          <p className="muted">{text('demoNoScore')}</p>
          <button className="button button-primary full-width" onClick={onVerify}>{text('registerDemo')}</button>
          <p className="fine-print">{text('signInNotice')}</p>
        </section>
      </div>
    )
  }
  return (
    <>
      <PageHeading eyebrow={text('freeDemo')} title={language === 'zh' ? '免費試做示範' : 'Free sample practice'} description={text('demoNoScore')} />
      <section className="panel question-panel demo-question">
        <div className="question-topline"><span className="eyebrow">{text('question')} {index + 1} {text('of')} {questions.length}</span><StatusBadge>{language === 'zh' ? '不限時 · 不計分' : 'Untimed · Not scored'}</StatusBadge></div>
        <h2 className="question-prompt">{question.prompt[language]}</h2>
        <div className="option-list">
          {question.options[language].map((option, optionIndex) => (
            <button key={option} className={`option-button ${selectedOption === optionIndex ? 'selected' : ''}`} aria-pressed={selectedOption === optionIndex} onClick={() => { setSelectedOption(optionIndex); setRevealed(false) }}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>
          ))}
        </div>
        {revealed && <div className="alert alert-success"><strong>{text('correctAnswer')}: {question.options[language][question.correct]}</strong></div>}
        <div className="question-actions">
          <button className="button button-outline" onClick={() => setRevealed(true)}>{text('showAnswer')}</button>
          <button className="button button-primary" onClick={() => { setIndex((index + 1) % questions.length); setSelectedOption(null); setRevealed(false) }}>{text('next')} →</button>
        </div>
      </section>
    </>
  )
}

export function ExamPage({
  language,
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
}: CommonProps & {
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
}) {
  const question = questions[index % questions.length]
  const displayIndex = index % questions.length
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const saveLabel = offline || saveStatus === 'failed' ? text('saveFailed') : saveStatus === 'saving' ? text('saving') : text('saved')
  return (
    <>
      <div className="exam-topbar">
        <div><div className="eyebrow">{language === 'zh' ? '正式作答示意 · 不是真實考試' : 'Attempt preview · Not a real exam'}</div><h1>{text('examTitle')}</h1></div>
        <div className="exam-timer"><small>{text('remaining')}</small><strong>01:27:34</strong><span>{text('commonDeadline')}: 10:30 HKT</span></div>
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
          <h2 className="question-prompt">{question.prompt[language]}</h2>
          <div className="option-list">
            {question.options[language].map((option, optionIndex) => (
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
            <button className="button button-primary" onClick={() => onIndex((index + 1) % questions.length)}>{text('next')} →</button>
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

export function ResultsPage({ language, text, hasSubscription, gradeAvailable, onToggleGrade, navigate }: CommonProps & { hasSubscription: boolean; gradeAvailable: boolean; onToggleGrade: () => void }) {
  const [showReview, setShowReview] = useState(true)
  return (
    <>
      <div className="result-hero">
        <div><div className="eyebrow">{text('resultPublished')}</div><h1>{text('resultTitle')}</h1><p className="muted">{text('examTitle')} · 2026-11-08</p></div>
        <StatusBadge tone="success">{language === 'zh' ? '已完成' : 'Completed'}</StatusBadge>
      </div>
      <div className="result-summary-grid">
        <section className="panel score-card"><span>{text('totalScore')}</span><strong>38 <small>/ 50</small></strong><div className="score-meter"><i /></div></section>
        <section className="panel grade-card"><span>{text('grade')}</span>{gradeAvailable ? <strong>Level 4</strong> : <p>{text('gradeNotReady')}</p>}<button className="text-button" onClick={onToggleGrade}>{language === 'zh' ? '切換示例：等級界線未設定' : 'Toggle sample: no grade boundaries'}</button></section>
      </div>
      <div className="section-heading review-heading"><div><div className="eyebrow">{text('answerReview')}</div><h2>{language === 'zh' ? '逐題查看作答' : 'Review your responses'}</h2></div><button className="button button-outline" onClick={() => setShowReview(!showReview)}>{showReview ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展開' : 'Expand')}</button></div>
      {showReview && <div className="review-list">{questions.map((question, index) => {
        const studentAnswer = [1, 1, 2][index]
        return (
          <article className="panel review-card" key={question.id}>
            <div className="review-card-top"><span className="eyebrow">{text('question')} {index + 1}</span><StatusBadge tone={studentAnswer === question.correct ? 'success' : 'warning'}>{studentAnswer === question.correct ? (language === 'zh' ? '正確' : 'Correct') : (language === 'zh' ? '需檢討' : 'Review')}</StatusBadge></div>
            <h3>{question.prompt[language]}</h3>
            <div className="review-answers"><p><span>{text('yourAnswer')}</span><strong>{question.options[language][studentAnswer]}</strong></p><p><span>{text('correctAnswer')}</span><strong>{question.options[language][question.correct]}</strong></p></div>
            {hasSubscription ? <div className="explanation-box"><strong>{text('explanation')}</strong><p>{question.explanation[language]}</p></div> : <div className="locked-explanation">▣ {text('explanationLocked')}</div>}
          </article>
        )
      })}</div>}
      <div className="result-actions"><button className="button button-outline" onClick={() => navigate('dashboard')}>{text('dashboard')}</button><button className="button button-primary" onClick={() => navigate('sessions')}>{text('viewSessions')}</button></div>
    </>
  )
}

export function AccountPage({
  language,
  text,
  navigate,
  examPreference,
  setExamPreference,
  notificationLanguage,
  setNotificationLanguage,
}: CommonProps & {
  examPreference: Language
  setExamPreference: (language: Language) => void
  notificationLanguage: Language
  setNotificationLanguage: (language: Language) => void
}) {
  const [saved, setSaved] = useState(false)
  return (
    <>
      <PageHeading eyebrow={language === 'zh' ? '個人資料與通知' : 'PROFILE & NOTIFICATIONS'} title={text('accountSettings')} description={language === 'zh' ? '此頁使用示例偏好，不會連接真實帳戶。' : 'Sample preferences only; no real account is connected.'} />
      <section className="panel settings-panel">
        <div className="profile-heading"><div className="avatar">DS</div><div><strong>Demo Student</strong><small>student@example.test · {language === 'zh' ? '示例帳戶' : 'Sample account'}</small></div><StatusBadge tone="success">{language === 'zh' ? '已驗證' : 'Verified'}</StatusBadge></div>
        <div className="settings-row"><div><strong>{text('examLanguagePreference')}</strong><small>{language === 'zh' ? '用於訂閱自動報名場次；每場截止前仍可更改。' : 'Applied to subscription auto-enrollments; editable per sitting until cutoff.'}</small></div><select value={examPreference} onChange={(event) => setExamPreference(event.target.value as Language)}><option value="zh">{text('chinesePaper')}</option><option value="en">{text('englishPaper')}</option></select></div>
        <div className="settings-row"><div><strong>{text('notificationLanguage')}</strong><small>{language === 'zh' ? '與每場試卷語言分開設定。' : 'Separate from the language selected for each exam.'}</small></div><select value={notificationLanguage} onChange={(event) => setNotificationLanguage(event.target.value as Language)}><option value="zh">{text('chinese')}</option><option value="en">{text('english')}</option></select></div>
        <div className="settings-row"><div><strong>{text('telegramStatus')}</strong><small>{language === 'zh' ? '服務通知同意已開啟；推廣通知另行選擇。' : 'Transactional notices enabled; marketing consent is separate.'}</small></div><StatusBadge tone="success">{text('linkedDemo')}</StatusBadge></div>
        <div className="settings-row"><div><strong>{language === 'zh' ? '推廣訊息' : 'Marketing messages'}</strong><small>{language === 'zh' ? '預設關閉，與必要服務通知分開。' : 'Off by default and separate from essential service notices.'}</small></div><label className="toggle-control"><input type="checkbox" /><span>{language === 'zh' ? '未同意' : 'Not opted in'}</span></label></div>
        {saved && <div className="alert alert-success" role="status">{language === 'zh' ? '偏好已在原型中更新。' : 'Preferences updated in the prototype.'}</div>}
        <div className="button-row"><button className="button button-outline" onClick={() => navigate('dashboard')}>{text('back')}</button><button className="button button-primary" onClick={() => setSaved(true)}>{text('savePreference')}</button></div>
      </section>
    </>
  )
}
