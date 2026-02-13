import type { UnitCategory } from './types'

export const UNIT_CATEGORIES: UnitCategory[] = [
  'Embalagem',
  'Peso',
  'Volume',
  'Comprimento',
  'Tempo',
  'Outros',
]

export const INVENTORY_STORAGE_KEYS = {
  materials: 'cm.inventory.materials',
  logs: 'cm.inventory.logs',
  units: 'cm.inventory.units',
} as const

export const RECENT_LOGS_LIMIT = 8
