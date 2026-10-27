import type { Question, Session } from './types'

export const sessions: Session[] = [
  {
    id: 'math-p2-101',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2',
    date: '2026-11-08',
    time: '09:00 HKT',
    duration: '90 minutes',
    cutoff: '2026-11-07 · 18:00 HKT',
    status: 'open',
    price: 'HK$80',
  },
  {
    id: 'math-p2-102',
    subject: 'Mathematics',
    paper: 'Compulsory Part · Paper 2',
    date: '2026-11-15',
    time: '14:00 HKT',
    duration: '90 minutes',
    cutoff: '2026-11-14 · 18:00 HKT',
    status: 'open',
    price: 'HK$80',
  },
  {
    id: 'chem-p1-201',
    subject: 'Chemistry',
    paper: 'Paper 1 · Section A',
    date: '2026-11-22',
    time: '10:00 HKT',
    duration: '75 minutes',
    cutoff: '2026-11-21 · 18:00 HKT',
    status: 'closed',
    price: 'HK$70',
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
]
