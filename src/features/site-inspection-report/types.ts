export interface TeamMember {
  id: string
  name: string
  role: string
}

export interface ChecklistItem {
  id: string
  category: string
  description: string
  status: 'pass' | 'fail' | 'na'
}

export interface ProjectHeader {
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
}
