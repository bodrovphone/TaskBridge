import type { Question, QuestionFormData } from '@/types/questions'

/**
 * Mock function to simulate question submission
 * In production, this would call an API endpoint
 */
export async function submitQuestion(
  taskId: string,
  userId: string,
  data: QuestionFormData
): Promise<{ success: boolean; questionId: string; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock success response
  const questionId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Store question locally
  storeQuestionLocally(taskId, userId, questionId, data)

  return {
    success: true,
    questionId,
    message: 'Question posted successfully',
  }
}

/**
 * Store question in localStorage for mock persistence
 */
export function storeQuestionLocally(
  taskId: string,
  userId: string,
  questionId: string,
  data: QuestionFormData
): void {
  const questions = getTaskQuestions(taskId)

  const newQuestion: Question = {
    id: questionId,
    taskId,
    askerId: userId,
    asker: {
      id: userId,
      name: 'Current User',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 4.8,
      completedTasks: 25,
      verified: true,
    },
    questionText: data.questionText,
    createdAt: new Date(),
    updatedAt: new Date(),
    answer: null,
  }

  questions.push(newQuestion)
  localStorage.setItem(`questions-${taskId}`, JSON.stringify(questions))
}

/**
 * Mock function to simulate answer submission
 */
export async function submitAnswer(
  questionId: string,
  authorId: string,
  answerText: string
): Promise<{ success: boolean; answerId: string; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const answerId = `a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    success: true,
    answerId,
    message: 'Answer posted successfully',
  }
}

/**
 * Get all questions for a task
 */
export function getTaskQuestions(taskId: string): Question[] {
  const storedQuestions = localStorage.getItem(`questions-${taskId}`)

  if (storedQuestions) {
    const questions = JSON.parse(storedQuestions)
    // Convert date strings back to Date objects
    return questions.map((q: any) => ({
      ...q,
      createdAt: new Date(q.createdAt),
      updatedAt: new Date(q.updatedAt),
      answer: q.answer ? {
        ...q.answer,
        createdAt: new Date(q.answer.createdAt),
        updatedAt: new Date(q.answer.updatedAt),
      } : null,
    }))
  }

  // Return default mock questions if none stored
  return getDefaultMockQuestions(taskId)
}

/**
 * Get default mock questions for testing
 */
function getDefaultMockQuestions(taskId: string): Question[] {
  return [
    {
      id: 'q-1',
      taskId,
      askerId: 'user-1',
      asker: {
        id: 'user-1',
        name: 'Иван Петров',
        avatar: 'https://i.pravatar.cc/150?img=33',
        rating: 4.9,
        completedTasks: 143,
        verified: true,
      },
      questionText: 'Разполагате ли с необходимите материали или трябва да ги осигуря аз?',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      answer: {
        id: 'a-1',
        questionId: 'q-1',
        authorId: 'author-123',
        author: {
          id: 'author-123',
          name: 'Task Author',
          avatar: 'https://i.pravatar.cc/150?img=5',
          rating: 4.7,
          completedTasks: 89,
          verified: true,
        },
        answerText: 'Разполагам с всички необходими материали. Цената включва материалите и работата.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    },
    {
      id: 'q-2',
      taskId,
      askerId: 'user-2',
      asker: {
        id: 'user-2',
        name: 'Мария Георгиева',
        avatar: 'https://i.pravatar.cc/150?img=45',
        rating: 4.7,
        completedTasks: 67,
        verified: false,
      },
      questionText: 'Колко време ще отнеме работата приблизително?',
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      updatedAt: new Date(Date.now() - 45 * 60 * 1000),
      answer: null,
    },
    {
      id: 'q-3',
      taskId,
      askerId: 'user-3',
      asker: {
        id: 'user-3',
        name: 'Стоян Иванов',
        avatar: 'https://i.pravatar.cc/150?img=68',
        rating: 4.8,
        completedTasks: 92,
        verified: true,
      },
      questionText: 'Имате ли опит с подобни проекти? Можете ли да споделите примери от предишни работи?',
      createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      updatedAt: new Date(Date.now() - 20 * 60 * 1000),
      answer: null,
    },
  ]
}

/**
 * Clear all questions for a task (for testing)
 */
export function clearTaskQuestions(taskId: string): void {
  localStorage.removeItem(`questions-${taskId}`)
}

/**
 * Update answer for a question
 */
export function updateQuestionAnswer(
  taskId: string,
  questionId: string,
  authorId: string,
  answerText: string
): void {
  const questions = getTaskQuestions(taskId)
  const question = questions.find((q) => q.id === questionId)

  if (question) {
    question.answer = {
      id: `a-${Date.now()}`,
      questionId,
      authorId,
      author: {
        id: authorId,
        name: 'Task Author',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 4.7,
        completedTasks: 89,
        verified: true,
      },
      answerText,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    question.updatedAt = new Date()

    localStorage.setItem(`questions-${taskId}`, JSON.stringify(questions))
  }
}

/**
 * Format relative time for display
 * Supports: en, bg, ru, ua
 */
export function getRelativeTime(date: Date, locale: string = 'bg'): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Just now
  if (diffInSeconds < 60) {
    switch (locale) {
      case 'bg': return 'преди момент'
      case 'ru': return 'только что'
      case 'ua': return 'щойно'
      default: return 'just now'
    }
  }

  // Minutes ago
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    switch (locale) {
      case 'bg': return `преди ${diffInMinutes} мин`
      case 'ru': return `${diffInMinutes} мин назад`
      case 'ua': return `${diffInMinutes} хв тому`
      default: return `${diffInMinutes} min ago`
    }
  }

  // Hours ago
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    switch (locale) {
      case 'bg': return `преди ${diffInHours} ${diffInHours === 1 ? 'час' : 'часа'}`
      case 'ru': return `${diffInHours} ${diffInHours === 1 ? 'час' : 'часов'} назад`
      case 'ua': return `${diffInHours} ${diffInHours === 1 ? 'годину' : 'годин'} тому`
      default: return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
    }
  }

  // Days ago
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    switch (locale) {
      case 'bg': return `преди ${diffInDays} ${diffInDays === 1 ? 'ден' : 'дни'}`
      case 'ru': return `${diffInDays} ${diffInDays === 1 ? 'день' : 'дней'} назад`
      case 'ua': return `${diffInDays} ${diffInDays === 1 ? 'день' : 'днів'} тому`
      default: return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
    }
  }

  // Weeks ago
  const diffInWeeks = Math.floor(diffInDays / 7)
  switch (locale) {
    case 'bg': return `преди ${diffInWeeks} ${diffInWeeks === 1 ? 'седмица' : 'седмици'}`
    case 'ru': return `${diffInWeeks} ${diffInWeeks === 1 ? 'неделю' : 'недель'} назад`
    case 'ua': return `${diffInWeeks} ${diffInWeeks === 1 ? 'тиждень' : 'тижнів'} тому`
    default: return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`
  }
}
