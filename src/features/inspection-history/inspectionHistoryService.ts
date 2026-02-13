import type { InspectionForm } from '../site-inspection-report/types'
import type { InspectionHistoryEntry, InspectionStatus } from './types'

const INSPECTION_STORAGE_KEY = 'cm.site-inspections'
const ACTIVE_DRAFT_STORAGE_KEY = 'cm.site-inspections.active-draft'

type UpsertInspectionInput = {
  id?: string
  form: InspectionForm
  createdBy: string
  status: InspectionStatus
}

function buildSearchIndex(form: InspectionForm): string {
  return [
    form.header.title,
    form.header.projectName,
    form.header.location,
    form.header.inspectorName,
    form.observations,
  ]
    .join(' ')
    .toLowerCase()
}

function withDefaultTitle(form: InspectionForm): InspectionForm {
  if (form.header.title?.trim()) {
    return form
  }

  return {
    ...form,
    header: {
      ...form.header,
      title: `Inspeção ${form.header.location || 'Sem unidade'}`,
    },
  }
}

function normalizeEntry(
  entry: Partial<InspectionHistoryEntry>,
): InspectionHistoryEntry {
  const normalizedData = withDefaultTitle(entry.data as InspectionForm)
  const createdAt = entry.createdAt || new Date().toISOString()

  return {
    id: entry.id || crypto.randomUUID(),
    createdAt,
    updatedAt: entry.updatedAt || createdAt,
    createdBy: entry.createdBy || 'Usuário não identificado',
    status: entry.status || 'FINISHED',
    data: normalizedData,
    searchIndex: entry.searchIndex || buildSearchIndex(normalizedData),
  }
}

function readInspections(): InspectionHistoryEntry[] {
  const raw = localStorage.getItem(INSPECTION_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Partial<InspectionHistoryEntry>[]
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(normalizeEntry)
  } catch {
    return []
  }
}

function writeInspections(inspections: InspectionHistoryEntry[]): void {
  localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(inspections))
}

export function upsertInspection({
  id,
  form,
  createdBy,
  status,
}: UpsertInspectionInput): InspectionHistoryEntry {
  const inspections = readInspections()
  const normalizedForm = withDefaultTitle(form)
  const now = new Date().toISOString()

  if (id) {
    const updated = inspections.map((inspection) => {
      if (inspection.id !== id) {
        return inspection
      }

      return {
        ...inspection,
        updatedAt: now,
        status,
        data: normalizedForm,
        searchIndex: buildSearchIndex(normalizedForm),
      }
    })

    writeInspections(updated)

    const found = updated.find((inspection) => inspection.id === id)

    if (found) {
      return found
    }
  }

  const savedInspection: InspectionHistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    createdBy,
    status,
    data: normalizedForm,
    searchIndex: buildSearchIndex(normalizedForm),
  }

  writeInspections([savedInspection, ...inspections])

  return savedInspection
}

export function getSavedInspections(): InspectionHistoryEntry[] {
  return readInspections()
}

export function getInspectionById(id: string): InspectionHistoryEntry | null {
  return readInspections().find((inspection) => inspection.id === id) || null
}

export function renameInspection(id: string, title: string): void {
  const inspections = readInspections().map((inspection) => {
    if (inspection.id !== id) {
      return inspection
    }

    const data = {
      ...inspection.data,
      header: {
        ...inspection.data.header,
        title,
      },
    }

    return {
      ...inspection,
      updatedAt: new Date().toISOString(),
      data,
      searchIndex: buildSearchIndex(data),
    }
  })

  writeInspections(inspections)
}

export function deleteInspection(id: string): void {
  const inspections = readInspections().filter(
    (inspection) => inspection.id !== id,
  )
  writeInspections(inspections)

  if (getInspectionInEditionId() === id) {
    clearInspectionInEdition()
  }
}

export function setInspectionInEdition(id: string): void {
  localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, id)
}

export function getInspectionInEditionId(): string | null {
  return localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY)
}

export function clearInspectionInEdition(): void {
  localStorage.removeItem(ACTIVE_DRAFT_STORAGE_KEY)
}
