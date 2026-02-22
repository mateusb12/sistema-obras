import { EllipsisVertical, Eye, Pencil, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { APP_ROUTES, navigateTo } from '../../routes/router'
import { PDFPreview } from '../site-inspection-report'
import {
  LOCATION_OPTIONS,
  PROJECT_CARDS,
} from '../site-inspection-report/constants'
import {
  deleteInspection,
  getSavedInspections,
  renameInspection,
  setInspectionInEdition,
} from './inspectionHistoryService'
import type { InspectionHistoryEntry, InspectionStatus } from './types'
import { InspectionCalendar } from './components/InspectionCalendar.tsx'

function hasNonConformity(inspection: InspectionHistoryEntry): boolean {
  return inspection.data.checklist.some((item) => item.status === 'fail')
}

function getStatusLabel(status: InspectionStatus): string {
  if (status === 'DRAFT' || status === 'DRAFT_OPEN_CORRECTION')
    return 'Rascunho'
  if (status === 'OPEN_CORRECTION') return 'Aguardando reinspeção'
  return 'Finalizada'
}

function getStatusClassName(status: InspectionStatus): string {
  if (status === 'DRAFT' || status === 'DRAFT_OPEN_CORRECTION')
    return 'font-semibold text-amber-600 dark:text-amber-300'
  if (status === 'OPEN_CORRECTION')
    return 'font-semibold text-red-700 dark:text-red-300'
  return 'font-semibold text-green-700 dark:text-green-300'
}

function formatDate(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('pt-BR')
}

export function HistoryPage() {
  const [titleFilter, setTitleFilter] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [onlyFails, setOnlyFails] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'ALL' | InspectionStatus>(
    'ALL',
  )
  const [selectedInspection, setSelectedInspection] =
    useState<InspectionHistoryEntry | null>(null)
  const [openMenuInspectionId, setOpenMenuInspectionId] = useState<
    string | null
  >(null)
  const [inspections, setInspections] = useState<InspectionHistoryEntry[]>(
    getSavedInspections(),
  )
  const [renameModalInspection, setRenameModalInspection] =
    useState<InspectionHistoryEntry | null>(null)
  const [renameTitleInput, setRenameTitleInput] = useState('')

  const reloadInspections = () => {
    setInspections(getSavedInspections())
  }

  const handleRename = (inspection: InspectionHistoryEntry) => {
    setRenameModalInspection(inspection)
    setRenameTitleInput(inspection.data.header.title)
  }

  const handleRenameSave = () => {
    if (!renameModalInspection) {
      return
    }

    const nextTitle = renameTitleInput.trim()

    if (!nextTitle) {
      return
    }

    renameInspection(renameModalInspection.id, nextTitle)
    reloadInspections()
    setRenameModalInspection(null)
    setRenameTitleInput('')
  }

  const handleDelete = (inspection: InspectionHistoryEntry) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar "${inspection.data.header.title}"?`,
    )

    if (!confirmDelete) {
      return
    }

    deleteInspection(inspection.id)
    if (selectedInspection?.id === inspection.id) {
      setSelectedInspection(null)
    }
    reloadInspections()
  }

  const handleEdit = (inspection: InspectionHistoryEntry) => {
    if (inspection.status === 'FINISHED') {
      return
    }

    setInspectionInEdition(inspection.id)
    navigateTo(APP_ROUTES.INSPECTION)
  }

  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      const projectMatches =
        !selectedProject ||
        inspection.data.header.projectName === selectedProject

      const titleMatches =
        !titleFilter ||
        inspection.data.header.title
          .toLowerCase()
          .includes(titleFilter.toLowerCase())

      const locationMatches =
        !locationFilter ||
        inspection.searchIndex.includes(locationFilter.toLowerCase())

      const inspectionDate = inspection.data.header.date
      const startMatches = !startDate || inspectionDate >= startDate
      const endMatches = !endDate || inspectionDate <= endDate
      const failsMatches = !onlyFails || hasNonConformity(inspection)
      const statusMatches =
        statusFilter === 'ALL' || inspection.status === statusFilter

      return (
        projectMatches &&
        titleMatches &&
        locationMatches &&
        startMatches &&
        endMatches &&
        failsMatches &&
        statusMatches
      )
    })
  }, [
    endDate,
    inspections,
    locationFilter,
    onlyFails,
    selectedProject,
    startDate,
    titleFilter,
    statusFilter,
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Histórico de Inspeções
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          CRUD completo: editar rascunhos, visualizar finalizadas, renomear e
          deletar.
        </p>
      </header>

      <InspectionCalendar inspections={filteredInspections} />

      <section className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:grid-cols-2 lg:grid-cols-7">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Título
          </label>
          <input
            value={titleFilter}
            onChange={(event) => setTitleFilter(event.target.value)}
            placeholder="Ex: Inspeção 104-B"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Projeto
          </label>
          <select
            value={selectedProject}
            onChange={(event) => setSelectedProject(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Todos</option>
            {PROJECT_CARDS.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Localização / Unidade
          </label>
          <input
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            list="history-location-options"
            placeholder="Ex: 102B"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <datalist id="history-location-options">
            {[
              ...LOCATION_OPTIONS.ladoA,
              ...LOCATION_OPTIONS.ladoB,
              ...LOCATION_OPTIONS.areasComuns,
            ].map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Data inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Data final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'ALL' | InspectionStatus)
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="ALL">Todos</option>
            <option value="FINISHED">Finalizadas</option>
            <option value="OPEN_CORRECTION">Aguardando reinspeção</option>
            <option value="DRAFT">Rascunhos (sem pendência)</option>
            <option value="DRAFT_OPEN_CORRECTION">
              Rascunhos com pendência
            </option>
          </select>
        </div>

        <label className="flex items-end gap-2 pb-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={onlyFails}
            onChange={(event) => setOnlyFails(event.target.checked)}
          />
          Exibir apenas com não-conformidades
        </label>
      </section>

      <section className="space-y-3">
        {filteredInspections.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Nenhuma inspeção encontrada com os filtros atuais.
          </p>
        )}

        {filteredInspections.map((inspection) => {
          const failItems = inspection.data.checklist.filter(
            (item) => item.status === 'fail',
          )

          return (
            <article
              key={inspection.id}
              className={`group relative overflow-visible rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                inspection.status === 'DRAFT' ||
                inspection.status === 'DRAFT_OPEN_CORRECTION'
                  ? 'border-amber-400/80 bg-white hover:bg-amber-50/70 dark:border-amber-500/70 dark:bg-gray-800 dark:hover:bg-amber-900/25'
                  : inspection.status === 'OPEN_CORRECTION'
                    ? 'border-red-400/80 bg-white hover:bg-red-50/70 dark:border-red-500/70 dark:bg-gray-800 dark:hover:bg-red-900/25'
                    : 'border-emerald-400/80 bg-white hover:bg-emerald-50/70 dark:border-emerald-500/70 dark:bg-gray-800 dark:hover:bg-emerald-900/25'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {inspection.data.header.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {inspection.data.header.projectName} —{' '}
                    {inspection.data.header.location}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status:{' '}
                    <span className={getStatusClassName(inspection.status)}>
                      {getStatusLabel(inspection.status)}
                    </span>{' '}
                    • Data da inspeção:{' '}
                    {formatDate(inspection.data.header.date)}
                    {' • '}Atualizado em:{' '}
                    {new Date(inspection.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuInspectionId((current) =>
                        current === inspection.id ? null : inspection.id,
                      )
                    }
                    className={`rounded-lg border p-2 transition ${
                      openMenuInspectionId === inspection.id
                        ? 'border-blue-400 bg-blue-100 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-white/20 bg-white/70 text-gray-700 hover:bg-white dark:border-gray-600/70 dark:bg-gray-900/70 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                    aria-label="Alternar ações da inspeção"
                  >
                    {openMenuInspectionId === inspection.id ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <EllipsisVertical className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {failItems.length > 0 && (
                <div className="mt-3 rounded-md bg-red-50 p-3 text-sm dark:bg-red-900/20">
                  <p className="font-medium text-red-700 dark:text-red-300">
                    Não-conformidades ({failItems.length})
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-red-700 dark:text-red-300">
                    {failItems.map((item) => (
                      <li key={item.id}>
                        {item.description} — Tratativa:{' '}
                        {item.failResolution === 'non_conform'
                          ? 'Aceitar como está'
                          : item.failResolution === 'needs_correction'
                            ? 'Solicitar correção'
                            : 'Não definida'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {openMenuInspectionId === inspection.id && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-300/70 pt-3 dark:border-gray-600/60">
                  <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                    Ações rápidas:
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInspection(inspection)
                        setOpenMenuInspectionId(null)
                      }}
                      className="inline-flex items-center gap-2 rounded-md border border-blue-400/70 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/70 dark:text-blue-300 dark:hover:bg-blue-900/30"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </button>

                    {inspection.status !== 'FINISHED' && (
                      <button
                        type="button"
                        onClick={() => {
                          handleEdit(inspection)
                          setOpenMenuInspectionId(null)
                        }}
                        className="inline-flex items-center gap-2 rounded-md border border-amber-400/70 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/70 dark:text-amber-300 dark:hover:bg-amber-900/30"
                      >
                        <Pencil className="h-4 w-4" />
                        {inspection.status === 'OPEN_CORRECTION' ||
                        inspection.status === 'DRAFT_OPEN_CORRECTION'
                          ? 'Reinspecionar'
                          : 'Editar'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleRename(inspection)
                        setOpenMenuInspectionId(null)
                      }}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300/80 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-500/70 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                      Renomear
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(inspection)
                        setOpenMenuInspectionId(null)
                      }}
                      className="inline-flex items-center gap-2 rounded-md border border-red-400/70 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/70 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </section>

      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative h-[90dvh] w-full max-w-6xl rounded-lg bg-white p-4 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setSelectedInspection(null)}
              className="absolute right-4 top-4 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              Fechar
            </button>
            <div className="h-full overflow-hidden pt-8">
              <PDFPreview
                data={selectedInspection.data}
                status={selectedInspection.status}
              />
            </div>
          </div>
        </div>
      )}

      {renameModalInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Renomear inspeção
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Informe um novo título para esta inspeção.
            </p>

            <input
              value={renameTitleInput}
              onChange={(event) => setRenameTitleInput(event.target.value)}
              className="mt-4 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Título da inspeção"
              autoFocus
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRenameModalInspection(null)
                  setRenameTitleInput('')
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRenameSave}
                disabled={!renameTitleInput.trim()}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
