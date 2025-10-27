/**
 * Question and Answer types for task Q&A feature
 */

export interface QuestionUser {
  id: string
  name: string
  avatar: string
  rating: number
  completedTasks: number
  verified: boolean
}

export interface Answer {
  id: string
  questionId: string
  authorId: string
  author: QuestionUser
  answerText: string
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  taskId: string
  askerId: string
  asker: QuestionUser
  questionText: string
  createdAt: Date
  updatedAt: Date
  answer?: Answer | null
}

export interface QuestionWithAnswer extends Question {
  answer: Answer | null
}

export interface QuestionFormData {
  questionText: string
}

export interface AnswerFormData {
  answerText: string
}

export interface QuestionStats {
  total: number
  answered: number
  unanswered: number
}
