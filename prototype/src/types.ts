export type Language = 'zh' | 'en'
export type PaymentMethod = 'payme' | 'octopus'
export type CheckoutPhase = 'selecting' | 'pending' | 'unpaid'

export type View =
  | 'home'
  | 'sessions'
  | 'sessionDetail'
  | 'demo'
  | 'login'
  | 'register'
  | 'verifyEmail'
  | 'verificationSuccess'
  | 'forgotPassword'
  | 'resetPassword'
  | 'dashboard'
  | 'checkout'
  | 'exam'
  | 'result'
  | 'account'
  | 'noticeCenter'
  | 'adminDashboard'
  | 'adminPaper'
  | 'adminSitting'
  | 'adminResults'
  | 'adminNotices'

export type Session = {
  id: string
  subject: string
  paper: string
  date: string
  time: string
  duration: string
  questionCount: number
  cutoff: string
  status: 'scheduled' | 'open' | 'closed' | 'cancelled'
  price: string
}

export type Question = {
  id: number
  prompt: Record<Language, string>
  options: Record<Language, string[]>
  correct: number
  explanation: Record<Language, string>
}

export type PortalNotice = {
  id: string
  title: Record<Language, string>
  body: Record<Language, string>
  status: 'draft' | 'published'
  publishedAt: string | null
  expiresAt: string
}

export type NotificationCategory = 'payment' | 'registration' | 'sitting' | 'result' | 'incident'

export type PortalNotification = {
  id: string
  category: NotificationCategory
  title: Record<Language, string>
  body: Record<Language, string>
  createdAt: string
  destination: Extract<View, 'dashboard' | 'sessions' | 'result' | 'account' | 'checkout'>
  targetSessionId?: string
  readAt: string | null
}

export type NotificationFeedEntry =
  | {
    id: string
    source: 'announcement'
    category: 'announcement'
    title: Record<Language, string>
    body: Record<Language, string>
    createdAt: string
    isRead: boolean
    noticeId: string
  }
  | {
    id: string
    source: 'account'
    category: NotificationCategory
    title: Record<Language, string>
    body: Record<Language, string>
    createdAt: string
    isRead: boolean
    notification: PortalNotification
  }

export type SittingOperations = {
  registrations: number
  paymentPending: number
  started: number
  submitted: number
  notStarted: number
  resultsStatus: 'awaiting' | 'processing' | 'published'
  averageScore: number | null
  scoreBands: number[]
}

export type Navigate = (view: View) => void
