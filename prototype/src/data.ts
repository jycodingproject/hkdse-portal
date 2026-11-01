import type { PortalNotice, PortalNotification, Question, Session, SittingOperations } from './types'

export const sessions: Session[] = [
  {
    id: 'math-p2-101',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2 · Set A',
    date: '2026-11-07',
    time: '09:00 HKT',
    duration: '75 minutes',
    questionCount: 45,
    cutoff: '2026-11-07 · 08:30 HKT',
    status: 'open',
    price: 'HK$29',
  },
  {
    id: 'math-p2-102',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2 · Set B',
    date: '2026-11-08',
    time: '09:00 HKT',
    duration: '75 minutes',
    questionCount: 45,
    cutoff: '2026-11-08 · 08:30 HKT',
    status: 'open',
    price: 'HK$29',
  },
  {
    id: 'math-p2-103',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2 · Set C',
    date: '2026-11-14',
    time: '09:00 HKT',
    duration: '75 minutes',
    questionCount: 45,
    cutoff: '2026-11-14 · 08:30 HKT',
    status: 'scheduled',
    price: 'HK$29',
  },
  {
    id: 'math-p2-104',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2 · Set D',
    date: '2026-11-15',
    time: '09:00 HKT',
    duration: '75 minutes',
    questionCount: 45,
    cutoff: '2026-11-15 · 08:30 HKT',
    status: 'scheduled',
    price: 'HK$29',
  },
  {
    id: 'math-p2-099',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2 · Set Y',
    date: '2026-10-31',
    time: '09:00 HKT',
    duration: '75 minutes',
    questionCount: 45,
    cutoff: '2026-10-31 · 08:30 HKT',
    status: 'closed',
    price: 'HK$29',
  },
  {
    id: 'math-p2-100',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2 · Set Z',
    date: '2026-10-25',
    time: '09:00 HKT',
    duration: '75 minutes',
    questionCount: 45,
    cutoff: '2026-10-25 · 08:30 HKT',
    status: 'closed',
    price: 'HK$29',
  },
]

export const sittingOperations: Record<string, SittingOperations> = {
  'math-p2-101': {
    registrations: 184,
    paymentPending: 3,
    started: 0,
    submitted: 0,
    notStarted: 184,
    resultsStatus: 'awaiting',
    averageScore: null,
    scoreBands: [0, 0, 0, 0],
  },
  'math-p2-102': {
    registrations: 96,
    paymentPending: 2,
    started: 0,
    submitted: 0,
    notStarted: 96,
    resultsStatus: 'awaiting',
    averageScore: null,
    scoreBands: [0, 0, 0, 0],
  },
  'math-p2-103': {
    registrations: 0,
    paymentPending: 0,
    started: 0,
    submitted: 0,
    notStarted: 0,
    resultsStatus: 'awaiting',
    averageScore: null,
    scoreBands: [0, 0, 0, 0],
  },
  'math-p2-104': {
    registrations: 0,
    paymentPending: 0,
    started: 0,
    submitted: 0,
    notStarted: 0,
    resultsStatus: 'awaiting',
    averageScore: null,
    scoreBands: [0, 0, 0, 0],
  },
  'math-p2-099': {
    registrations: 128,
    paymentPending: 0,
    started: 117,
    submitted: 70,
    notStarted: 11,
    resultsStatus: 'processing',
    averageScore: null,
    scoreBands: [0, 0, 0, 0],
  },
  'math-p2-100': {
    registrations: 146,
    paymentPending: 0,
    started: 139,
    submitted: 132,
    notStarted: 7,
    resultsStatus: 'published',
    averageScore: 34.2,
    scoreBands: [8, 24, 64, 36],
  },
}

export const notices: PortalNotice[] = [
  {
    id: 'notice-weekend-format',
    title: {
      zh: '週末模擬考場次安排',
      en: 'Weekend mock exam schedule',
    },
    body: {
      zh: '一般場次目標為星期六及星期日早上 09:00 開考。各場使用不同試卷，請在報名前確認日期及試卷語言。',
      en: 'The regular schedule targets Saturday and Sunday at 09:00. Each sitting uses a different paper; check the date and exam language before booking.',
    },
    status: 'published',
    publishedAt: '2026-10-28T09:00:00+08:00',
    expiresAt: '2026-12-31T23:59:00+08:00',
  },
  {
    id: 'notice-registration-window',
    title: {
      zh: '報名開放與截止時間',
      en: 'Registration opening and cutoff',
    },
    body: {
      zh: '報名通常於開考前 7 日開放，並於開考前 30 分鐘截止。個別場次如有調整，請以場次頁面顯示的時間為準。',
      en: 'Registration normally opens 7 days before a sitting and closes 30 minutes before it starts. Check the sitting page for any individual schedule changes.',
    },
    status: 'published',
    publishedAt: '2026-10-30T12:00:00+08:00',
    expiresAt: '2026-12-31T23:59:00+08:00',
  },
]

export const portalNotifications: PortalNotification[] = [
  {
    id: 'notification-payment-1',
    category: 'payment',
    title: { zh: '付款已確認', en: 'Payment confirmed' },
    body: { zh: '你的示例訂單已確認付款；相關報名已完成。', en: 'Payment for your sample order is confirmed and the related registration is complete.' },
    createdAt: '2026-10-31T14:00:00+08:00',
    destination: 'dashboard',
    readAt: null,
  },
  {
    id: 'notification-registration-1',
    category: 'registration',
    title: { zh: '報名成功', en: 'Registration confirmed' },
    body: { zh: '你已成功報名 2026-11-07 的數學模擬考。', en: 'Your registration for the 7 Nov 2026 Mathematics mock exam is confirmed.' },
    createdAt: '2026-10-30T11:00:00+08:00',
    destination: 'dashboard',
    readAt: null,
  },
  {
    id: 'notification-result-1',
    category: 'result',
    title: { zh: '成績已公布', en: 'Results are available' },
    body: { zh: '數學必修部分示例場次的成績及答案檢討已公布。', en: 'Results and answer review are available for the sample Mathematics sitting.' },
    createdAt: '2026-10-29T17:00:00+08:00',
    destination: 'result',
    targetSessionId: 'math-p2-100',
    readAt: '2026-10-29T18:00:00+08:00',
  },
  {
    id: 'notification-sitting-1',
    category: 'sitting',
    title: { zh: '場次時間提醒', en: 'Sitting time reminder' },
    body: { zh: '請於考試前查看場次頁面，確認最新安排。', en: 'Check the sitting page before the exam for the latest arrangements.' },
    createdAt: '2026-10-28T15:00:00+08:00',
    destination: 'sessions',
    readAt: '2026-10-28T16:00:00+08:00',
  },
]

export const questions: Question[] = [
  {
    id: 1,
    prompt: {
      zh: '若 f(x) = 2x + 3，求 f(4) 的值。',
      en: 'Given f(x) = 2x + 3, find the value of f(4).',
    },
    options: {
      zh: ['8', '10', '11', '14'],
      en: ['8', '10', '11', '14'],
    },
    correct: 2,
    explanation: {
      zh: '把 x = 4 代入：f(4) = 2(4) + 3 = 11。',
      en: 'Substitute x = 4: f(4) = 2(4) + 3 = 11.',
    },
  },
  {
    id: 2,
    prompt: {
      zh: '一個三角形的底為 8 cm，高為 5 cm。它的面積是多少？',
      en: 'A triangle has a base of 8 cm and a height of 5 cm. What is its area?',
    },
    options: {
      zh: ['13 cm²', '20 cm²', '40 cm²', '80 cm²'],
      en: ['13 cm²', '20 cm²', '40 cm²', '80 cm²'],
    },
    correct: 1,
    explanation: {
      zh: '三角形面積 = ½ × 底 × 高 = ½ × 8 × 5 = 20 cm²。',
      en: 'Area = ½ × base × height = ½ × 8 × 5 = 20 cm².',
    },
  },
  {
    id: 3,
    prompt: {
      zh: '解方程：3x − 7 = 11。',
      en: 'Solve the equation: 3x − 7 = 11.',
    },
    options: {
      zh: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
      en: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
    },
    correct: 2,
    explanation: {
      zh: '兩邊加 7 得 3x = 18，再除以 3，得 x = 6。',
      en: 'Add 7 to both sides to get 3x = 18, then divide by 3: x = 6.',
    },
  },
  {
    id: 4,
    prompt: {
      zh: '一個長方形的長和闊分別為 9 cm 和 4 cm。它的周界是多少？',
      en: 'A rectangle has a length of 9 cm and a width of 4 cm. What is its perimeter?',
    },
    options: {
      zh: ['13 cm', '26 cm', '36 cm', '72 cm'],
      en: ['13 cm', '26 cm', '36 cm', '72 cm'],
    },
    correct: 1,
    explanation: {
      zh: '周界 = 2(長 + 闊) = 2(9 + 4) = 26 cm。',
      en: 'Perimeter = 2(length + width) = 2(9 + 4) = 26 cm.',
    },
  },
  {
    id: 5,
    prompt: {
      zh: '若 2y = 18，求 y 的值。',
      en: 'Given 2y = 18, find the value of y.',
    },
    options: {
      zh: ['6', '8', '9', '16'],
      en: ['6', '8', '9', '16'],
    },
    correct: 2,
    explanation: {
      zh: '方程兩邊同除以 2，得 y = 9。',
      en: 'Divide both sides of the equation by 2 to get y = 9.',
    },
  },
]
