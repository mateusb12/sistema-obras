import type { ComplianceStatus } from './types'

export const PERSONNEL_STORAGE_KEYS = {
  employees: 'cm.personnelCompliance.employees',
} as const

export const PERSONNEL_ROLES = [
  'Engenheiro Civil',
  'Técnico de Segurança',
  'Pedreiro',
  'Servente',
  'Eletricista',
  'Carpinteiro',
] as const

export const NR_TRAINING_OPTIONS = ['NR-18', 'NR-35', 'NR-10', 'NR-06'] as const

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  regular: 'Regular',
  warning: 'A vencer',
  expired: 'Irregular',
}

export const COMPLIANCE_STATUS_BADGES: Record<ComplianceStatus, string> = {
  regular: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
}

export const WARNING_WINDOW_DAYS = 30
