import { useMemo } from 'react'
import { Wrench } from 'lucide-react'
import { APP_ROUTES, navigateTo } from '../../routes/router'
import {
  getSavedInspections,
  setInspectionInEdition,
} from './inspectionHistoryService'
import type { InspectionHistoryEntry } from './types'

function getPendingItemsCount(inspection: InspectionHistoryEntry): number {
  return inspection.data.checklist.filter(
    (item) =>
      item.status === 'fail' && item.failResolution === 'needs_correction',
  ).length
}

export function CorrectionsPage() {
  const pendingInspections = useMemo(
    () =>
      getSavedInspections()
        .filter((inspection) => inspection.status === 'OPEN_CORRECTION')
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
    [],
  )

  const handleReinspect = (inspectionId: string) => {
    setInspectionInEdition(inspectionId)
    navigateTo(APP_ROUTES.INSPECTION)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Inspeções em Correção
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Lista de fichas abertas aguardando reinspeção dos itens pendentes.
        </p>
      </header>

      <section className="space-y-3">
        {pendingInspections.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Nenhuma inspeção pendente de correção no momento.
          </p>
        )}

        {pendingInspections.map((inspection) => (
          <article
            key={inspection.id}
            className="rounded-xl border border-red-200 bg-white p-4 shadow-sm dark:border-red-700/70 dark:bg-gray-800"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {inspection.data.header.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {inspection.data.header.projectName} —{' '}
                  {inspection.data.header.location}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data da inspeção: {inspection.data.header.date} • Atualizado
                  em: {new Date(inspection.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <Wrench className="h-3.5 w-3.5" />
                {getPendingItemsCount(inspection)} pendência(s)
              </span>
            </div>

            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleReinspect(inspection.id)}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Reinspecionar
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
