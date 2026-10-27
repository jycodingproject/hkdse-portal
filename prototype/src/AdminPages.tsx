import { useState, type ReactNode } from 'react'
import { AdminNav, PageHeading, StatusBadge, type Translator } from './components'
import type { Language, Navigate, View } from './types'

type AdminProps = {
  language: Language
  text: Translator
  navigate: Navigate
  view: View
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

export function AdminDashboardPage(props: AdminProps) {
  const { language, text, navigate } = props
  const metrics = [
    { label: text('revenue'), value: 'HK$18,240', change: language === 'zh' ? '本月示例' : 'Sample this month', icon: '＄' },
    { label: text('registrations'), value: '426', change: language === 'zh' ? '4 個公開場次' : 'Across 4 public sittings', icon: '▣' },
    { label: text('completionRate'), value: '91.5%', change: language === 'zh' ? '最近 30 日' : 'Last 30 days', icon: '✓' },
    { label: text('demoConversion'), value: '12.8%', change: language === 'zh' ? '示例轉換率' : 'Sample conversion', icon: '↗' },
  ]
  return (
    <AdminLayout {...props}>
      <PageHeading eyebrow="ADMINISTRATOR" title={text('opsDashboard')} description={language === 'zh' ? '以下營運數據均為原型示例。' : 'All operational metrics below are prototype samples.'} />
      <div className="metric-grid">{metrics.map((metric) => <article className="panel metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><i>{metric.icon}</i></div><strong>{metric.value}</strong><small>{metric.change}</small></article>)}</div>
      <section className="panel admin-overview-panel">
        <div className="panel-heading"><div><div className="eyebrow">{language === 'zh' ? '待處理' : 'ACTION REQUIRED'}</div><h2>{language === 'zh' ? '營運事項' : 'Operations'}</h2></div><StatusBadge tone="warning">{language === 'zh' ? '2 項待確認' : '2 items to review'}</StatusBadge></div>
        <div className="operation-row"><span className="operation-symbol">▤</span><div><strong>{language === 'zh' ? '數學必修部分 · Paper 2' : 'Mathematics Compulsory Part · Paper 2'}</strong><small>{language === 'zh' ? '下一場 · 2026 年 11 月 8 日 09:00 HKT' : 'Next sitting · 8 Nov 2026, 09:00 HKT'}</small></div><StatusBadge tone="success">{text('open')}</StatusBadge></div>
        <div className="operation-row"><span className="operation-symbol">⚑</span><div><strong>{language === 'zh' ? '新試卷草稿待預覽' : 'Paper draft ready for preview'}</strong><small>{language === 'zh' ? '英文版本有 1 題待檢查' : 'One English-language item needs review'}</small></div><button className="text-button" onClick={() => navigate('adminPaper')}>{text('paperManagement')} →</button></div>
      </section>
      <div className="admin-quick-actions"><button className="button button-primary" onClick={() => navigate('adminPaper')}>＋ {text('paperManagement')}</button><button className="button button-outline" onClick={() => navigate('adminSitting')}>＋ {text('createSitting')}</button><button className="button button-outline" onClick={() => navigate('adminResults')}>{text('registrationResults')}</button></div>
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
            <li className="needs-review"><span>!</span>{language === 'zh' ? 'DSE 等級界線需逐卷設定' : 'DSE grade boundaries set per paper'}</li>
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
  return (
    <AdminLayout {...props}>
      <PageHeading eyebrow={language === 'zh' ? '場次排程' : 'SITTING SCHEDULE'} title={text('sittingManagement')} description={language === 'zh' ? '每場需使用一份已檢查的新試卷。' : 'Each sitting uses a new, reviewed paper version.'} />
      <div className="admin-form-grid">
        <section className="panel">
          <div className="panel-heading"><h2>{text('createSitting')}</h2><StatusBadge>{language === 'zh' ? '草稿' : 'Draft'}</StatusBadge></div>
          <div className="form-grid">
            <label className="field-label">{language === 'zh' ? '科目／試卷' : 'Subject / paper'}<select defaultValue="math"><option value="math">Mathematics · Compulsory Part P2</option><option value="chem">Chemistry · Paper 1A</option></select></label>
            <label className="field-label">{text('paperVersion')}<select defaultValue="v1"><option value="v1">MATH-P2-2026-W45 · v1.0</option></select></label>
            <label className="field-label">{text('starts')}<input type="datetime-local" defaultValue="2026-11-08T09:00" /></label>
            <label className="field-label">{text('duration')}<select defaultValue="90"><option value="90">90 minutes</option><option value="75">75 minutes</option><option value="120">120 minutes</option></select></label>
            <label className="field-label">{text('cutoff')}<input type="datetime-local" defaultValue="2026-11-07T18:00" /></label>
            <label className="field-label">{text('price')}<input type="text" defaultValue="HK$80 (sample)" /></label>
          </div>
          <fieldset className="language-fieldset"><legend>{text('availableLanguages')}</legend><label><input type="checkbox" defaultChecked /> {text('chinesePaper')}</label><label><input type="checkbox" defaultChecked /> {text('englishPaper')}</label></fieldset>
          <div className="notice-box">{language === 'zh' ? '共同開始／截止時間 · 不設座位上限 · 報名截止後鎖定考卷語言。' : 'Shared start/deadline · No seat cap · Exam language locks at registration cutoff.'}</div>
          {published && <div className="alert alert-success" role="status">{language === 'zh' ? '場次已模擬發布，考生會收到示例通知。' : 'Sitting publication simulated; sample notices would be queued.'}</div>}
          <button className="button button-primary" onClick={() => setPublished(true)} disabled={published}>{text('publishSitting')}</button>
        </section>
        <aside className="panel">
          <div className="eyebrow">{language === 'zh' ? '發布預覽' : 'PUBLIC PREVIEW'}</div>
          <h2>{language === 'zh' ? '數學必修部分 · Paper 2' : 'Mathematics Compulsory Part · Paper 2'}</h2>
          <div className="detail-facts compact-facts"><div><span>{text('starts')}</span><strong>2026-11-08 · 09:00 HKT</strong></div><div><span>{text('duration')}</span><strong>90 minutes</strong></div><div><span>{text('cutoff')}</span><strong>2026-11-07 · 18:00 HKT</strong></div><div><span>{text('price')}</span><strong>HK$80 (sample)</strong></div></div>
          <StatusBadge tone="success">{text('open')}</StatusBadge>
        </aside>
      </div>
    </AdminLayout>
  )
}

export function AdminResultsPage(props: AdminProps) {
  const { language, text } = props
  const [selected, setSelected] = useState(false)
  const [action, setAction] = useState<'pause' | 'extend' | 'void' | null>(null)
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [incidentError, setIncidentError] = useState(false)
  const actionLabel = action === 'pause' ? text('pauseSitting') : action === 'extend' ? text('extendDeadline') : text('voidSitting')

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
      <PageHeading eyebrow={language === 'zh' ? '考生及場次支援' : 'CANDIDATE & SITTING SUPPORT'} title={text('registrationResults')} description={language === 'zh' ? '預設查看彙總；個別作答按需檢視並留下紀錄。' : 'Aggregate view by default; individual attempts are inspected on demand and audited.'} />
      <section className="panel results-table-panel">
        <div className="panel-heading"><h2>{language === 'zh' ? '數學必修部分 · 2026-11-08' : 'Mathematics Compulsory Part · 8 Nov 2026'}</h2><StatusBadge tone="success">{text('open')}</StatusBadge></div>
        <div className="admin-summary-grid"><div><strong>184</strong><span>{text('registrations')}</span></div><div><strong>168</strong><span>{language === 'zh' ? '已開始作答' : 'Started attempts'}</span></div><div><strong>91.3%</strong><span>{text('completionRate')}</span></div></div>
        <div className="table-wrap"><table><thead><tr><th>{text('candidate')}</th><th>{text('attemptSummary')}</th><th>{language === 'zh' ? '分數' : 'Score'}</th><th>{language === 'zh' ? '狀態' : 'Status'}</th><th /></tr></thead><tbody>
          {['Demo Candidate 01', 'Demo Candidate 02', 'Demo Candidate 03'].map((candidate, index) => <tr key={candidate}><td>{candidate}</td><td>{index === 0 ? '40/50' : index === 1 ? '36/50' : '—'}</td><td>{index === 2 ? '—' : index === 0 ? '80%' : '72%'}</td><td><StatusBadge tone={index === 2 ? 'warning' : 'success'}>{index === 2 ? (language === 'zh' ? '作答中' : 'In progress') : (language === 'zh' ? '已提交' : 'Submitted')}</StatusBadge></td><td><button className="text-button" onClick={() => setSelected(!selected)}>{text('inspectAttempt')}</button></td></tr>)}
        </tbody></table></div>
        {selected && <div className="alert alert-info"><strong>Demo Candidate 01</strong> · {language === 'zh' ? '個別作答已開啟示意。檢視人：管理者；時間：現在。' : 'Individual attempt view preview. Actor: administrator; time: now.'}<br />{text('auditRecorded')}</div>}
      </section>
      <section className="panel incident-panel">
        <div className="panel-heading"><div><div className="eyebrow">{language === 'zh' ? '重大故障處理' : 'INCIDENT RESPONSE'}</div><h2>{text('incidentTitle')}</h2></div><span className="card-icon" aria-hidden="true">⚠</span></div>
        <p className="muted">{text('organizerRemedy')}</p>
        {confirmed && <div className="alert alert-success" role="status">{text('candidatesNotified')} · {text('auditRecorded')}</div>}
        <div className="incident-actions"><button className="button button-outline" onClick={() => { setAction('pause'); setConfirmed(false) }}>{text('pauseSitting')}</button><button className="button button-outline" onClick={() => { setAction('extend'); setConfirmed(false) }}>{text('extendDeadline')}</button><button className="button button-danger-outline" onClick={() => { setAction('void'); setConfirmed(false) }}>{text('voidSitting')}</button></div>
        {action && <div className="incident-confirm-box"><h3>{language === 'zh' ? '確認操作：' : 'Confirm action: '} {actionLabel}</h3><label className="field-label" htmlFor="incident-reason">{text('reason')}<textarea id="incident-reason" value={reason} onChange={(event) => { setReason(event.target.value); setIncidentError(false) }} placeholder={text('reasonPlaceholder')} /></label>{incidentError && <div className="field-error" role="alert">{language === 'zh' ? '請先填寫操作原因。' : 'Enter a reason before confirming.'}</div>}<div className="button-row"><button className="button button-outline" onClick={() => setAction(null)}>{text('back')}</button><button className="button button-primary" onClick={confirmIncident}>{text('confirmAction')}</button></div></div>}
      </section>
    </AdminLayout>
  )
}
