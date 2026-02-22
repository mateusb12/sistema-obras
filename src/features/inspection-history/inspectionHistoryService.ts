import type { InspectionForm } from '../site-inspection-report/types'
import type { InspectionHistoryEntry, InspectionStatus } from './types'
import {
  CHECKLIST_ESTRUTURAL,
  CHECKLIST_NAO_ESTRUTURAL,
} from '../site-inspection-report/constants.ts'

const INSPECTION_STORAGE_KEY = 'cm.site-inspections'
const ACTIVE_DRAFT_STORAGE_KEY = 'cm.site-inspections.active-draft'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomStatus(): 'pass' | 'fail' | 'na' {
  const r = Math.random()
  if (r < 0.7) return 'pass'
  if (r < 0.9) return 'fail'
  return 'na'
}

function randomFailReason(): string {
  const REASONS = [
    'Dimensão fora da tolerância',
    'Variação acima do permitido',
    'Falha de execução detectada',
    'Material inadequado',
    'Acabamento irregular',
    'Alinhamento incorreto',
    'Desvios acumulados acima do limite',
    'Execução fora do projeto',
  ]
  return pickRandom(REASONS)
}

function randomResolution(): 'non_conform' | 'needs_correction' {
  return pickRandom(['non_conform', 'needs_correction'])
}

export function isInspectionOpenCorrection(form: InspectionForm): boolean {
  return form.checklist.some(
    (item) =>
      item.status === 'fail' && item.failResolution === 'needs_correction',
  )
}

export function deriveInspectionStatus(
  form: InspectionForm,
  currentStatus?: InspectionStatus,
): InspectionStatus {
  const hasPendingCorrection = isInspectionOpenCorrection(form)

  if (currentStatus === 'DRAFT' || currentStatus === 'DRAFT_OPEN_CORRECTION') {
    return hasPendingCorrection ? 'DRAFT_OPEN_CORRECTION' : 'DRAFT'
  }

  return hasPendingCorrection ? 'OPEN_CORRECTION' : 'FINISHED'
}

function normalizeForm(form: InspectionForm): InspectionForm {
  return {
    ...form,
    checklist: form.checklist.map((item) => ({
      ...item,
      failResolution: item.failResolution ?? null,
      correctionPlan: item.correctionPlan?.trim() || undefined,
      reinspectionDate: item.reinspectionDate || undefined,
    })),
  }
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
  const normalizedData = withDefaultTitle(
    normalizeForm(entry.data as InspectionForm),
  )
  const createdAt = entry.createdAt || new Date().toISOString()

  return {
    id: entry.id || crypto.randomUUID(),
    createdAt,
    updatedAt: entry.updatedAt || createdAt,
    createdBy: entry.createdBy || 'Usuário não identificado',
    status: deriveInspectionStatus(
      normalizedData,
      entry.status === 'DRAFT' ||
        entry.status === 'DRAFT_OPEN_CORRECTION' ||
        entry.status === 'FINISHED' ||
        entry.status === 'OPEN_CORRECTION'
        ? entry.status
        : 'FINISHED',
    ),
    data: normalizedData,
    searchIndex: entry.searchIndex || buildSearchIndex(normalizedData),
  }
}

function randomDateInCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const randomDay = Math.floor(Math.random() * daysInMonth) + 1

  const formattedMonth = String(month + 1).padStart(2, '0')
  const formattedDay = String(randomDay).padStart(2, '0')

  return `${year}-${formattedMonth}-${formattedDay}`
}

function buildRandomInspection(): InspectionHistoryEntry {
  const isEstrutural = Math.random() < 0.5

  const checklistSource = isEstrutural
    ? CHECKLIST_ESTRUTURAL
    : CHECKLIST_NAO_ESTRUTURAL

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Sistema',
    status: 'FINISHED',

    data: {
      header: {
        title: `Inspeção Mock — Unidade ${Math.floor(Math.random() * 200)}`,
        projectName: pickRandom([
          'Flamboyant II',
          'Jardim Europa',
          'Alto das Palmeiras',
        ]),
        location: pickRandom(['101A', '102B', '204A', 'Hall', 'Escada']),
        date: randomDateInCurrentMonth(),
        inspectorName: pickRandom(['Eng. João', 'Eng. Carla', 'Téc. Marcos']),
      },

      team: [
        { id: crypto.randomUUID(), name: 'Rafael Bruno', role: 'Pedreiro' },
        { id: crypto.randomUUID(), name: 'Elieldo', role: 'Servente' },
      ],

      inspectionType: isEstrutural ? 'estrutural' : 'nao_estrutural',

      checklist: checklistSource.map((item) => {
        const status = randomStatus()
        const failResolution = status === 'fail' ? randomResolution() : null
        const reinspectionDate =
          failResolution === 'needs_correction'
            ? randomDateInCurrentMonth()
            : undefined

        return {
          id: crypto.randomUUID(),
          category: item.category,
          description: item.description,
          acceptanceCriteria: item.acceptanceCriteria,
          sampling: item.sampling,
          inspectionMethod: item.inspectionMethod,
          status,
          failReason: status === 'fail' ? randomFailReason() : '',
          failResolution,
          correctionPlan:
            failResolution === 'needs_correction'
              ? 'Equipe de acabamento irá corrigir o item e validar alinhamento.'
              : undefined,
          reinspectionDate,
        }
      }),

      observations: 'Inspeção gerada automaticamente para mock.',
    },

    searchIndex: 'mock auto gerado',
  }
}

function readInspections(): InspectionHistoryEntry[] {
  const raw = localStorage.getItem(INSPECTION_STORAGE_KEY)

  if (!raw) {
    const mocks = Array.from({ length: 12 }).map(() => buildRandomInspection())
    writeInspections(mocks)
    return mocks
  }

  try {
    const parsed = JSON.parse(raw) as Partial<InspectionHistoryEntry>[]

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const mocks = Array.from({ length: 12 }).map(() =>
        buildRandomInspection(),
      )
      writeInspections(mocks)
      return mocks
    }

    return parsed.map(normalizeEntry)
  } catch {
    const mocks = Array.from({ length: 12 }).map(() => buildRandomInspection())
    writeInspections(mocks)
    return mocks
  }
}

function writeInspections(inspections: InspectionHistoryEntry[]): void {
  localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(inspections))
}

type UpsertInspectionInput = {
  id?: string
  form: InspectionForm
  createdBy: string
  status: InspectionStatus
}

export function upsertInspection({
  id,
  form,
  createdBy,
  status,
}: UpsertInspectionInput): InspectionHistoryEntry {
  const inspections = readInspections()
  const normalizedForm = withDefaultTitle(normalizeForm(form))
  const now = new Date().toISOString()

  if (id) {
    const updated = inspections.map((inspection) => {
      if (inspection.id !== id) {
        return inspection
      }

      return {
        ...inspection,
        updatedAt: now,
        status: deriveInspectionStatus(normalizedForm, status),
        data: normalizedForm,
        searchIndex: buildSearchIndex(normalizedForm),
      }
    })

    writeInspections(updated)
    return updated.find((i) => i.id === id)!
  }

  const savedInspection: InspectionHistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    createdBy,
    status: deriveInspectionStatus(normalizedForm, status),
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
    if (inspection.id !== id) return inspection

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
