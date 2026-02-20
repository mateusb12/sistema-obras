export interface TeamMember {
  id: string
  name: string
  role: string
}

export interface ChecklistItem {
  id: string
  category: string
  description: string
  acceptanceCriteria: string
  sampling: string
  inspectionMethod: string
  status: 'pass' | 'fail' | 'na'
  failReason: string
  failResolution: 'non_conform' | 'needs_correction' | null
}

export interface ProjectHeader {
  title: string
  projectName: string
  location: string
  date: string
  inspectorName: string
}

export interface InspectionForm {
  header: ProjectHeader
  team: TeamMember[]
  checklist: ChecklistItem[]
  observations: string
  inspectionType: 'estrutural' | 'nao_estrutural'
}
