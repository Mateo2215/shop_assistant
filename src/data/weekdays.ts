// Shared weekday metadata and helpers for shopping items and meal plans.
import type { Weekday } from '../types'

export interface WeekdayOption {
  id: Weekday
  label: string
  shortLabel: string
}

export const WEEKDAYS: WeekdayOption[] = [
  { id: 'monday', label: 'Poniedziałek', shortLabel: 'Pon' },
  { id: 'tuesday', label: 'Wtorek', shortLabel: 'Wt' },
  { id: 'wednesday', label: 'Środa', shortLabel: 'Śr' },
  { id: 'thursday', label: 'Czwartek', shortLabel: 'Czw' },
  { id: 'friday', label: 'Piątek', shortLabel: 'Pt' },
  { id: 'saturday', label: 'Sobota', shortLabel: 'Sob' },
  { id: 'sunday', label: 'Niedziela', shortLabel: 'Nd' },
]

const WEEKDAY_IDS = new Set<Weekday>(WEEKDAYS.map((day) => day.id))

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === 'string' && WEEKDAY_IDS.has(value as Weekday)
}

export function parseWeekdays(value: unknown): Weekday[] {
  if (!Array.isArray(value)) return []
  return sortWeekdays(value.filter(isWeekday))
}

export function sortWeekdays(days: Iterable<Weekday>): Weekday[] {
  const selected = new Set(days)
  return WEEKDAYS.filter((day) => selected.has(day.id)).map((day) => day.id)
}

export function getWeekdayShortLabel(day: Weekday): string {
  return WEEKDAYS.find((option) => option.id === day)?.shortLabel ?? day
}
