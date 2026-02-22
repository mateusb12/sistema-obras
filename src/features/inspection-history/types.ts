import type { InspectionForm } from '../site-inspection-report/types'

export type InspectionStatus = 'DRAFT' | 'FINISHED' | 'OPEN_CORRECTION'

export interface InspectionHistoryEntry {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  status: InspectionStatus
  data: InspectionForm
  searchIndex: string
}
