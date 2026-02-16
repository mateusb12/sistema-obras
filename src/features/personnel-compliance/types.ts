export type ComplianceStatus = 'regular' | 'warning' | 'expired'
export type ValidationStatus = 'pending' | 'approved' | 'rejected'

export interface Attachment {
  fileName: string
  fileType: string
  base64: string
  size: number
}

export interface EmployeeDocument {
  id: string
  type: string
  issueDate: string
  expiryDate: string
}

export interface EmployeeVaccine {
  id: string
  name: string
  applicationDate?: string
  expiryDate?: string
  isRequired: boolean
}

export interface EmployeeTraining {
  id: string
  code: string
  title: string
  completionDate: string
  expiryDate: string
}

export interface Employee {
  id: string
  fullName: string
  role: string
  projectId: string
  hiredAt: string
  documents: EmployeeDocument[]
  vaccines: EmployeeVaccine[]
  trainings: EmployeeTraining[]
}

export interface EmployeeBase {
  id: string
  fullName: string
  role: string
  projectId: string
  hiredAt: string
}

export interface TrainingRecord {
  id: string
  employeeId: string
  trainingName: string
  dateCompleted: string
  validUntil: string
  status: ComplianceStatus
  attachment?: Attachment
  validationStatus: ValidationStatus
  validationFeedback?: string
}

export interface VaccineRecord {
  id: string
  employeeId: string
  vaccineName: string
  doseInfo: string
  dateAdministered?: string
  nextDueDate?: string
  attachment?: Attachment
  validationStatus: ValidationStatus
  validationFeedback?: string
}

export interface DocumentRecord {
  id: string
  employeeId: string
  docType: string
  issueDate: string
  expirationDate: string
  attachment?: Attachment
  validationStatus: ValidationStatus
  validationFeedback?: string
}

export interface TrainingStatusGroup {
  trainingName: string
  regular: TrainingRecord[]
  warning: TrainingRecord[]
  expired: TrainingRecord[]
}

export interface ComplianceSummary {
  totalEmployees: number
  criticalPending: number
  upcomingDue: number
}

export interface EmployeeComplianceRow {
  employee: Employee
  status: ComplianceStatus
  expiredItems: string[]
  warningItems: string[]
}
