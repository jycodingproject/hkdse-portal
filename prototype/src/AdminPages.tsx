import { useState, type ReactNode } from 'react'
import { AdminNav, PageHeading, StatusBadge, type Translator } from './components'
import { sessions, sittingOperations } from './data'
import type { Language, Navigate, Session, View } from './types'

type AdminProps = {
  language: Language
  text: Translator
  navigate: Navigate
  view: View
}

type AdminDashboardProps = AdminProps & {
  onViewSitting: (sittingId: string) => void
}

type AdminResultsProps = AdminProps & {
  selectedSittingId: string
  onSelectedSittingChange: (sittingId: string) => void
}

const sampleJson = `{
  "paper": "math-p2-demo",
  "language": ["zh", "en"],
  "questions": [
    {
      "id": "q1",
      "points": 1,
      "prompt": { "zh": "求 f(4)", "en": "Find f(4)" },
      "options": ["A", "B", "C", "D"],
      "answer": "C"
    }
  ]
}`

function AdminLayout({ language, navigate, view, children }: AdminProps & { children: ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminNav view={view} onNavigate={navigate} language={language} />
      <div className="admin-content">{children}</div>
    </div>
  )
}

function sittingStatusKey(session: Session) {
  return session.status === 'open' ? 'open' : session.status === 'scheduled' ? 'notOpenYet' : session.status === 'closed' ? 'closed' : 'cancelled'
}

function newestFirst(left: Session, right: Session) {
  return right.date.localeCompare(left.date)
}

export function AdminDashboardPage(props: AdminDashboardProps) {
  const { language, text, navigate, onViewSitting } = props
  const totalRegistrations = Object.values(sittingOperations).reduce((total, sitting) => total + sitting.registrations, 0)
  const pendingPayments = Object.values(sittingOperations).reduce((total, sitting) => total + sitting.paymentPending, 0)
  const publishedResults = Object.values(sittingOperations).filter((sitting) => sitting.resultsStatus === 'published').length
  const metrics = [
    { label: text('registrations'), value: String(totalRegistrations), change: language === 'zh' ? '所有示例場次' : 'Across sample sittings', icon: '▣' },
    { label: text('paymentPending'), value: String(pendingPayments), change: language === 'zh' ? '等待確認' : 'Awaiting confirmation', icon: '◷' },
    { label: text('resultsPublishedCount'), value: String(publishedResults), change: language === 'zh' ? '已完成成績處理' : 'Results processed', icon: '✓' },
    { label: text('completionRate'), value: '—', change: language === 'zh' ? '按場次查看' : 'View by sitting', icon: '↗' },
  ]
  return (
    <AdminLayout {...props}>
      <PageHeading eyebrow="ADMINISTRATOR" title={text('opsDashboard')} description={text('adminOverviewIntro')} />
      <div className="metric-grid">{metrics.map((metric) => <article className="panel metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><i>{metric.icon}</i></div><strong>{metric.value}</strong><small>{metric.change}</small></article>)}</div>
      <section className="panel results-table-panel">
        <div className="panel-heading"><div><div className="eyebrow">{language === 'zh' ? '逐場監察' : 'SITTING MONITORING'}</div><h2>{text('sittingOverview')}</h2></div><StatusBadge tone={pendingPayments ? 'warning' : 'success'}>{pendingPayments} · {text('paymentPending')}</StatusBadge></div>
        <div className="table-wrap"><table><thead><tr>
          <th>{language === 'zh' ? '考試場次' : 'Exam sitting'}</th><th>{text('registrationStatus')}</th><th>{text('paymentPending')}</th><th>{text('registrations')}</th><th>{text('startedAttempts')}</th><th>{text('submittedAttempts')}</th><th>{text('notStarted')}</th><th>{text('resultProcessing')}</th><th />
        </tr></thead><tbody>
          {[...sessions].sort(newestFirst).map((session) => {
            const operations = sittingOperations[session.id]
            const resultStatusKey = operations.resultsStatus === 'published' ? 'resultPublished' : operations.resultsStatus === 'processing' ? 'resultsProcessing' : 'resultsAwaiting'
            return <tr key={session.id}>
              <td><strong>{session.paper}</strong><br /><small>{session.date} · {session.time}</small></td>
              <td><StatusBadge tone={session.status === 'open' ? 'success' : session.status === 'closed' ? 'neutral' : 'warning'}>{text(sittingStatusKey(session))}</StatusBadge></td>
              <td>{operations.paymentPending}</td><td>{operations.registrations}</td><td>{operations.started}</td><td>{operations.submitted}</td><td>{operations.notStarted}</td>
              <td><StatusBadge tone={operations.resultsStatus === 'published' ? 'success' : 'warning'}>{text(resultStatusKey)}</StatusBadge></td>
              <td><button className="text-button" onClick={() => onViewSitting(session.id)}>{text('viewDetails')} →</button></td>
            </tr>
          })}
        </tbody></table></div>
      </section>
      <div className="admin-quick-actions"><button className="button button-primary" onClick={() => navigate('adminPaper')}>＋ {text('paperManagement')}</button><button className="button button-outline" onClick={() => navigate('adminSitting')}>＋ {text('createSitting')}</button><button className="button button-outline" onClick={() => navigate('adminNotices')}>{text('noticeManagement')}</button></div>
    </AdminLayout>
  )
}

export function AdminPaperPage(props: AdminProps) {
  const { language, text } = props
  const [validation, setValidation] = useState<'idle' | 'ok' | 'error'>('idle')
  const [published, setPublished] = useState(false)
  const [preview, setPreview] = useState(false)
  return (
    <AdminLayout {...props}>
      <PageHeading eyebrow={language === 'zh' ? '內容發布流程' : 'CONTENT PUBLISHING'} title={text('paperManagement')} description={language === 'zh' ? '模擬 JSON 匯入、檢查、預覽與手動發布。' : 'Simulate JSON import, validation, preview, and manual publication.'} />
      <div className="admin-form-grid">
        <section className="panel">
          <div className="panel-heading"><h2>{text('importJson')}</h2><StatusBadge>{language === 'zh' ? '草稿' : 'Draft'}</StatusBadge></div>
          <p className="muted">{text('jsonPlaceholder')}</p>
          <label className="field-label" htmlFor="json-fixture">{language === 'zh' ? '示例 JSON 內容' : 'Sample JSON content'}</label>
          <textarea id="json-fixture" className="json-editor" defaultValue={sampleJson} spellCheck={false} />
          {validation === 'ok' && <div className="alert alert-success" role="status">{text('validationOk')}</div>}
          {validation === 'error' && <div className="alert alert-danger" role="alert">{text('validationError')}</div>}
          {published && <div className="alert alert-info" role="status">{text('published')} · {language === 'zh' ? '版本 1.0 已鎖定' : 'Version 1.0 is locked'}</div>}
          <div className="button-row">
            <button className="button button-outline" onClick={() => setValidation('error')}>{text('validateJson')} · {language === 'zh' ? '示範錯誤' : 'show error'}</button>
            <button className="button button-outline" onClick={() => setValidation('ok')}>{text('validateJson')}</button>
          </div>
          <div className="button-row">
            <button className="button button-light" onClick={() => setPreview(!preview)}>{text('previewPaper')}</button>
            <button className="button button-primary" onClick={() => { setPublished(true); setValidation('ok') }} disabled={published}>{text('publishPaper')}</button>
          </div>
        </section>
        <aside className="panel paper-checklist">
          <div className="eyebrow">{language === 'zh' ? '發布前檢查' : 'PUBLISH CHECKLIST'}</div>
          <h2>{language === 'zh' ? '雙語版本檢查' : 'Bilingual review'}</h2>
          <ul className="checklist">
            <li className="complete"><span>✓</span>{language === 'zh' ? '中文題目與選項' : 'Chinese prompts and options'}</li>
            <li className="complete"><span>✓</span>{language === 'zh' ? '正確答案與分值' : 'Answer key and points'}</li>
            <li className={validation === 'error' ? 'needs-review' : 'complete'}><span>{validation === 'error' ? '!' : '✓'}</span>{language === 'zh' ? '英文版本完整' : 'English version complete'}</li>
            <li className="complete"><span>✓</span>{language === 'zh' ? '來源政策：原創題目' : 'Content policy: original questions'}</li>
            <li className="needs-review"><span>!</span>{language === 'zh' ? '平台相對級別及最低統計樣本門檻' : 'Platform-relative grades and minimum sample threshold'}</li>
          </ul>
          <div className="notice-box">{language === 'zh' ? '發布後此版本會鎖定。更正需要留下紀錄並統一套用至受影響考生。' : 'Published versions are locked. Corrections must be audited and applied consistently to affected candidates.'}</div>
        </aside>
      </div>
      {preview && <section className="panel preview-panel"><div className="panel-heading"><h2>{text('previewPaper')}</h2><button className="text-button" onClick={() => setPreview(false)}>{language === 'zh' ? '關閉預覽' : 'Close preview'}</button></div><div className="preview-question"><span className="eyebrow">{language === 'zh' ? '中文版 · 第 1 題' : 'English version · Question 1'}</span><h3>{language === 'zh' ? '若 f(x) = 2x + 3，求 f(4) 的值。' : 'Given f(x) = 2x + 3, find f(4).'}</h3><div className="preview-options"><span>A · 8</span><span>B · 10</span><span>C · 11</span><span>D · 14</span></div></div></section>}
    </AdminLayout>
  )
}

export function AdminSittingPage(props: AdminProps) {
  const { language, text } = props
  const [published, setPublished] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState('set-a')
  const paperVersions = [
    { id: 'set-a', label: 'MATH-P2-2026-W45-SET-A · v1.0', questionCount: 45 },
    { id: 'set-b', label: 'MATH-P2-2026-W45-SET-B · v1.0', questionCount: 45 },
    { id: 'sample', label: 'MATH-P2-PUBLIC-SAMPLE · v1.0', questionCount: 5 },
  ]
  const selectedVersion = paperVersions.find((version) => version.id === selectedVersionId) ?? paperVersions[0]
  return (
    <AdminLayout {...props}>
      <PageHeading eyebrow={language === 'zh' ? '考試排程' : 'EXAM SCHEDULE'} title={text('sittingManagement')} description={language === 'zh' ? '每場分開建立及發布，假期或營運需要時可略過。題數由試卷版本自動帶入；45 題只是建議目標，不會阻止發布。' : 'Create and publish each sitting separately, and skip when needed. Question count comes from the paper version; 45 is advisory and never blocks publication.'} />
      <div className="admin-form-grid">
        <section className="panel">
          <div className="panel-heading"><h2>{text('createSitting')}</h2><StatusBadge>{language === 'zh' ? '草稿' : 'Draft'}</StatusBadge></div>
          <div className="form-grid">
            <label className="field-label">{language === 'zh' ? '科目／試卷' : 'Subject / paper'}<select defaultValue="math"><option value="math">Mathematics · Compulsory Part P2</option></select></label>
            <label className="field-label">{text('paperVersion')}<select value={selectedVersionId} onChange={(event) => setSelectedVersionId(event.target.value)}>{paperVersions.map((version) => <option key={version.id} value={version.id}>{version.label}</option>)}</select></label>
            <label className="field-label">{text('starts')}<input type="datetime-local" defaultValue="2026-11-07T09:00" /></label>
            <label className="field-label">{text('duration')}<select defaultValue="75"><option value="75">75 minutes</option><option value="90">90 minutes</option><option value="120">120 minutes</option></select></label>
            <label className="field-label">{text('paperQuestions')}<input type="number" value={selectedVersion.questionCount} readOnly aria-readonly="true" /><small>{text('questionCountDerived')}</small></label>
            <label className="field-label">{text('cutoff')}<input type="datetime-local" defaultValue="2026-11-07T08:30" /></label>
            <label className="field-label">{text('price')}<input type="text" defaultValue="HK$29" /></label>
          </div>
          <fieldset className="language-fieldset"><legend>{text('availableLanguages')}</legend><label><input type="checkbox" defaultChecked /> {text('chinesePaper')}</label><label><input type="checkbox" defaultChecked /> {text('englishPaper')}</label></fieldset>
          <div className="notice-box">{language === 'zh' ? `${text('registrationWindow')} ${text('lateStart')} 語言於開始作答時鎖定。` : `${text('registrationWindow')} ${text('lateStart')} Language locks when the attempt starts.`}</div>
          {selectedVersion.questionCount !== 45 && <div className="alert alert-warning" role="status">{text('questionTargetAdvisory')}</div>}
          {published && <div className="alert alert-success" role="status">{language === 'zh' ? '場次已模擬發布，考生會收到示例通知。' : 'Sitting publication simulated; sample notices would be queued.'}</div>}
          <button className="button button-primary" onClick={() => setPublished(true)} disabled={published}>{text('publishSitting')}</button>
        </section>
        <aside className="panel">
          <div className="eyebrow">{language === 'zh' ? '發布預覽' : 'PUBLIC PREVIEW'}</div>
          <h2>{language === 'zh' ? '數學必修部分 · Paper 2' : 'Mathematics Compulsory Part · Paper 2'}</h2>
          <div className="detail-facts compact-facts"><div><span>{text('starts')}</span><strong>2026-11-07 · 09:00 HKT</strong></div><div><span>{text('duration')}</span><strong>75 minutes</strong></div><div><span>{text('paperQuestions')}</span><strong>{selectedVersion.questionCount}</strong></div><div><span>{text('cutoff')}</span><strong>2026-11-07 · 08:30 HKT</strong></div><div><span>{text('price')}</span><strong>HK$29</strong></div></div>
          <StatusBadge tone="success">{text('open')}</StatusBadge>
        </aside>
      </div>
    </AdminLayout>
  )
}

export function AdminResultsPage(props: AdminResultsProps) {
  const { language, text, selectedSittingId, onSelectedSittingChange } = props
  const [selected, setSelected] = useState(false)
  const [action, setAction] = useState<'pause' | 'extend' | 'void' | null>(null)
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [incidentError, setIncidentError] = useState(false)
  const actionLabel = action === 'pause' ? text('pauseSitting') : action === 'extend' ? text('extendDeadline') : text('voidSitting')
  const selectedSitting = sessions.find((session) => session.id === selectedSittingId) ?? sessions[0]
  const operations = sittingOperations[selectedSitting.id]
  const completionRate = operations.registrations > 0
    ? `${((operations.submitted / operations.registrations) * 100).toFixed(1)}%`
    : '—'
  const resultsStatusKey = operations.resultsStatus === 'published' ? 'resultPublished' : operations.resultsStatus === 'processing' ? 'resultsProcessing' : 'resultsAwaiting'
  const scoreRanges = ['0–19', '20–29', '30–39', '40–45']

  const confirmIncident = () => {
    if (!reason.trim()) {
      setIncidentError(true)
      return
    }
    setIncidentError(false)
    setConfirmed(true)
    setAction(null)
  }

  return (
    <AdminLayout {...props}>
      <PageHeading eyebrow={language === 'zh' ? '考試營運' : 'EXAM OPERATIONS'} title={text('registrationResults')} description={text('resultsAdminIntro')} />
      <section className="panel results-table-panel">
        <div className="panel-heading">
          <label className="field-label">{text('selectExam')}<select value={selectedSitting.id} onChange={(event) => { onSelectedSittingChange(event.target.value); setSelected(false) }}>{[...sessions].sort(newestFirst).map((session) => <option key={session.id} value={session.id}>{session.date} · {session.paper}</option>)}</select></label>
          <StatusBadge tone={operations.resultsStatus === 'published' ? 'success' : 'warning'}>{text(resultsStatusKey)}</StatusBadge>
        </div>
        <div className="admin-summary-grid">
          <div><strong>{operations.paymentPending}</strong><span>{text('paymentPending')}</span></div>
          <div><strong>{operations.registrations}</strong><span>{text('registrations')}</span></div>
          <div><strong>{operations.started}</strong><span>{text('startedAttempts')}</span></div>
          <div><strong>{operations.submitted}</strong><span>{text('submittedAttempts')}</span></div>
          <div><strong>{operations.notStarted}</strong><span>{text('notStarted')}</span></div>
          <div><strong>{completionRate}</strong><span>{text('completionRate')}</span></div>
        </div>
        {operations.resultsStatus === 'published' ? (
          <section className="score-distribution">
            <div className="panel-heading"><h3>{text('resultSummary')}</h3><span>{text('averageScore')}: <strong>{operations.averageScore} / 45</strong></span></div>
            {scoreRanges.map((range, index) => <div className="score-range" key={range}><span>{range}</span><progress value={operations.scoreBands[index]} max={operations.submitted}>{operations.scoreBands[index]}</progress><strong>{operations.scoreBands[index]}</strong></div>)}
          </section>
        ) : <div className="alert alert-info" role="status">{text('resultsNotAvailable')}</div>}
        {operations.submitted > 0 && <div className="table-wrap"><table><thead><tr><th>{text('candidate')}</th><th>{text('attemptSummary')}</th><th>{language === 'zh' ? '分數' : 'Score'}</th><th>{language === 'zh' ? '狀態' : 'Status'}</th><th /></tr></thead><tbody>
          {['Demo Candidate 01', 'Demo Candidate 02', 'Demo Candidate 03'].map((candidate, index) => <tr key={candidate}><td>{candidate}</td><td>{index === 0 ? '40/45' : index === 1 ? '36/45' : '32/45'}</td><td>{index === 0 ? '88.9%' : index === 1 ? '80%' : '71.1%'}</td><td><StatusBadge tone="success">{language === 'zh' ? '已提交' : 'Submitted'}</StatusBadge></td><td><button className="text-button" onClick={() => setSelected(true)}>{text('inspectAttempt')}</button></td></tr>)}
        </tbody></table></div>}
        {selected && <div className="alert alert-info"><strong>Demo Candidate 01</strong> · {language === 'zh' ? '個別作答已開啟示意。檢視人：管理者；時間：現在。' : 'Individual attempt view preview. Actor: administrator; time: now.'}<br />{text('auditRecorded')}</div>}
      </section>
      <section className="panel incident-panel">
        <div className="panel-heading"><div><div className="eyebrow">{language === 'zh' ? '重大故障處理' : 'INCIDENT RESPONSE'}</div><h2>{text('incidentTitle')}</h2></div><span className="card-icon" aria-hidden="true">⚠</span></div>
        <p className="muted">{text('organizerRemedy')}</p>
        {confirmed && <div className="alert alert-success" role="status">{text('candidatesNotified')} · {text('auditRecorded')}<p>{text('organizerRemedy')}</p><p>{text('refundWindow')}</p></div>}
        <div className="incident-actions"><button className="button button-outline" onClick={() => { setAction('pause'); setConfirmed(false) }}>{text('pauseSitting')}</button><button className="button button-outline" onClick={() => { setAction('extend'); setConfirmed(false) }}>{text('extendDeadline')}</button><button className="button button-danger-outline" onClick={() => { setAction('void'); setConfirmed(false) }}>{text('voidSitting')}</button></div>
        {action && <div className="incident-confirm-box"><h3>{language === 'zh' ? '確認操作：' : 'Confirm action: '} {actionLabel}</h3><label className="field-label" htmlFor="incident-reason">{text('reason')}<textarea id="incident-reason" value={reason} onChange={(event) => { setReason(event.target.value); setIncidentError(false) }} placeholder={text('reasonPlaceholder')} /></label>{incidentError && <div className="field-error" role="alert">{language === 'zh' ? '請先填寫操作原因。' : 'Enter a reason before confirming.'}</div>}<div className="button-row"><button className="button button-outline" onClick={() => setAction(null)}>{text('back')}</button><button className="button button-primary" onClick={confirmIncident}>{text('confirmAction')}</button></div></div>}
      </section>
    </AdminLayout>
  )
}
