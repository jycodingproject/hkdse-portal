export type Language = 'zh' | 'en'

export type View =
  | 'home'
  | 'sessions'
  | 'sessionDetail'
  | 'demo'
  | 'login'
  | 'dashboard'
  | 'checkout'
  | 'exam'
  | 'result'
  | 'account'
  | 'adminDashboard'
  | 'adminPaper'
  | 'adminSitting'
  | 'adminResults'

export type Session = {
  id: string
  subject: string
  paper: string
  date: string
  time: string
  duration: string
  cutoff: string
  status: 'open' | 'closed' | 'cancelled'
  price: string
}

export type Question = {
  id: number
  prompt: Record<Language, string>
  options: Record<Language, string[]>
  correct: number
  explanation: Record<Language, string>
}

export type Navigate = (view: View) => void
