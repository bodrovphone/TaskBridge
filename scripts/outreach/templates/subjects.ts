/**
 * Subject lines per language. Kept separate so we can A/B test later without
 * touching template HTML.
 */

export interface SubjectInput {
  cityLabel: string
  subCategoryLabel: string
}

export type OutreachLang = 'bg' | 'ru' | 'ua'

export function subjectFor(lang: OutreachLang, input: SubjectInput): string {
  if (lang === 'ru') {
    return `Есть клиент в ${input.cityLabel} — ${input.subCategoryLabel}`
  }
  if (lang === 'ua') {
    return `Є клієнт у ${input.cityLabel} — ${input.subCategoryLabel}`
  }
  return `Имам клиент за вас в ${input.cityLabel} — ${input.subCategoryLabel}`
}

export function senderNameFor(lang: OutreachLang): string {
  if (lang === 'ru') return 'Алекс'
  if (lang === 'ua') return 'Олексій'
  return 'Алекс'
}
