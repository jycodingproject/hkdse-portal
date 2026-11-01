import { useState, type FormEvent } from 'react'
import { StatusBadge, type Translator } from './components'
import { isPasswordValid } from './authValidation'
import type { Language, Navigate } from './types'

type AuthPageProps = {
  language: Language
  text: Translator
  navigate: Navigate
}

function AuthPrototypeNotice({ text }: { text: Translator }) {
  return <div className="notice-box" role="note">{text('authPrototypeNotice')}</div>
}

export function LoginPage({ language, text, navigate, onSignIn, feedback, initialEmail }: AuthPageProps & {
  onSignIn: (email: string) => void
  feedback?: { message: string; tone: 'success' | 'danger' } | null
  initialEmail?: string
}) {
  const [email, setEmail] = useState(initialEmail ?? 'student@example.test')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError(text('authFieldsRequired'))
      return
    }
    setError('')
    setPassword('')
    onSignIn(email.trim())
  }

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <div className="auth-seal" aria-hidden="true">DSE</div>
        <div className="eyebrow">{language === 'zh' ? '考生入口' : 'CANDIDATE ACCESS'}</div>
        <h1>{text('signIn')}</h1>
        <AuthPrototypeNotice text={text} />
        {feedback && <div className={`alert alert-${feedback.tone}`} role={feedback.tone === 'danger' ? 'alert' : 'status'}>{feedback.message}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label className="field-label" htmlFor="login-email">{text('emailAddress')}<input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="field-label" htmlFor="login-password">{text('password')}<input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <div className="field-error" role="alert">{error}</div>}
          <button className="button button-primary full-width" type="submit">{text('signIn')}</button>
        </form>
        <button className="text-button full-width" onClick={() => navigate('forgotPassword')}>{text('forgotPassword')}</button>
        <div className="divider-label"><span>{language === 'zh' ? '或' : 'OR'}</span></div>
        <button className="button button-outline full-width" onClick={() => navigate('register')}>{text('createAccount')}</button>
        <button className="text-button full-width" onClick={() => navigate('sessions')}>{text('back')} · {text('sittings')}</button>
      </section>
    </div>
  )
}

export function RegisterPage({ language, text, navigate, onRegister }: AuthPageProps & { onRegister: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isPasswordValid(password)) {
      setError(text('passwordRequirements'))
      return
    }
    if (password !== confirmation) {
      setError(text('passwordMismatch'))
      return
    }
    setError('')
    setPassword('')
    setConfirmation('')
    onRegister(email.trim())
  }

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <div className="eyebrow">{language === 'zh' ? '建立考生帳戶' : 'CREATE A STUDENT ACCOUNT'}</div>
        <h1>{text('createAccount')}</h1>
        <p className="muted">{text('registrationEmailVerification')}</p>
        <AuthPrototypeNotice text={text} />
        <form className="auth-form" onSubmit={submit}>
          <label className="field-label" htmlFor="register-email">{text('emailAddress')}<input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="field-label" htmlFor="register-password">{text('password')}<input id="register-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required aria-describedby="password-requirements" /></label>
          <small id="password-requirements" className="field-hint">{text('passwordRequirements')}</small>
          <label className="field-label" htmlFor="register-confirm">{text('confirmPassword')}<input id="register-confirm" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
          {error && <div className="field-error" role="alert">{error}</div>}
          <button className="button button-primary full-width" type="submit">{text('registerAndVerify')}</button>
        </form>
        <button className="text-button full-width" onClick={() => navigate('login')}>{text('backToSignIn')}</button>
      </section>
    </div>
  )
}

export function VerifyEmailPage({ language, text, email, linkExpired, onResend, onSimulateVerification }: AuthPageProps & {
  email: string
  linkExpired: boolean
  onResend: () => void
  onSimulateVerification: () => void
}) {
  const [resent, setResent] = useState(false)
  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <div className="eyebrow">{language === 'zh' ? '帳戶驗證' : 'ACCOUNT VERIFICATION'}</div>
        <h1>{text('verifyEmailTitle')}</h1>
        <p className="muted">{text('verificationEmailBody')} <strong>{email}</strong></p>
        <StatusBadge tone="warning">{text('unverifiedAccount')}</StatusBadge>
        <div className="notice-box">{text('verificationLinkExpiry')}</div>
        {resent && <div className="alert alert-info" role="status">{text('verificationResent')}</div>}
        <div className="auth-form">
          <button className="button button-outline full-width" onClick={() => { onResend(); setResent(true) }}>{text('resendVerification')}</button>
          {linkExpired && <div className="field-error" role="alert">{text('verificationLinkExpired')}</div>}
          <button className="button button-primary full-width" onClick={onSimulateVerification} disabled={linkExpired}>{text('simulateVerificationLink')}</button>
        </div>
        <AuthPrototypeNotice text={text} />
      </section>
    </div>
  )
}

export function VerificationSuccessPage({ text, navigate }: AuthPageProps) {
  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <div className="eyebrow">{text('accountVerified')}</div>
        <h1>{text('verificationSuccessTitle')}</h1>
        <p className="muted">{text('verificationSuccessBody')}</p>
        <AuthPrototypeNotice text={text} />
        <button className="button button-primary full-width" onClick={() => navigate('login')}>{text('signIn')}</button>
      </section>
    </div>
  )
}

export function ForgotPasswordPage({ language, text, navigate, onRequestReset, onOpenResetLink }: AuthPageProps & {
  onRequestReset: (email: string) => void
  onOpenResetLink: () => void
}) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) {
      setError(text('emailRequired'))
      return
    }
    setError('')
    onRequestReset(email.trim())
    setSent(true)
  }

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <div className="eyebrow">{language === 'zh' ? '帳戶安全' : 'ACCOUNT SECURITY'}</div>
        <h1>{text('forgotPassword')}</h1>
        <p className="muted">{text('forgotPasswordBody')}</p>
        <AuthPrototypeNotice text={text} />
        {!sent ? <form className="auth-form" onSubmit={submit}>
          <label className="field-label" htmlFor="reset-email">{text('emailAddress')}<input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          {error && <div className="field-error" role="alert">{error}</div>}
          <button className="button button-primary full-width" type="submit">{text('sendResetLink')}</button>
        </form> : <div className="alert alert-info" role="status">
          {text('resetLinkGenericConfirmation')}
          <button className="text-button full-width" onClick={onOpenResetLink}>{text('simulateOpenResetLink')}</button>
        </div>}
        <button className="text-button full-width" onClick={() => navigate('login')}>{text('backToSignIn')}</button>
      </section>
    </div>
  )
}

export function ResetPasswordPage({ language, text, navigate, onResetComplete, linkExpired }: AuthPageProps & {
  onResetComplete: () => void
  linkExpired: boolean
}) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (linkExpired) return
    if (!isPasswordValid(password)) {
      setError(text('passwordRequirements'))
      return
    }
    if (password !== confirmation) {
      setError(text('passwordMismatch'))
      return
    }
    setError('')
    setPassword('')
    setConfirmation('')
    onResetComplete()
  }

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <div className="eyebrow">{language === 'zh' ? '帳戶安全' : 'ACCOUNT SECURITY'}</div>
        <h1>{text('resetPasswordTitle')}</h1>
        <p className="muted">{text('resetPasswordBody')}</p>
        <AuthPrototypeNotice text={text} />
        {linkExpired
          ? <div className="alert alert-danger" role="alert">{text('resetLinkExpiredOrUsed')}<button className="button button-outline full-width" onClick={() => navigate('forgotPassword')}>{text('sendResetLink')}</button></div>
          : <form className="auth-form" onSubmit={submit}>
          <label className="field-label" htmlFor="reset-new-password">{text('newPassword')}<input id="reset-new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required aria-describedby="reset-password-requirements" /></label>
          <small id="reset-password-requirements" className="field-hint">{text('passwordRequirements')}</small>
          <label className="field-label" htmlFor="reset-confirm-password">{text('confirmPassword')}<input id="reset-confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
          {error && <div className="field-error" role="alert">{error}</div>}
          <button className="button button-primary full-width" type="submit">{text('resetPassword')}</button>
        </form>}
      </section>
    </div>
  )
}
