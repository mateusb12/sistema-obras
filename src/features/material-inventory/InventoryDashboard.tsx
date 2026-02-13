import { AlertTriangle, Building2, Siren, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PROJECT_CARDS } from '../site-inspection-report/constants'
import {
  getLowStockAlerts,
  getMaterials,
  getProjectShortageSummary,
} from './inventoryService'
import type { LowStockAlert, Material, ProjectShortageSummary } from './types'

function getRiskColor(ratio: number): string {
  if (ratio <= 0.5) return 'bg-red-500'
  if (ratio <= 1) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

export function InventoryDashboard() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([])
  const [summary, setSummary] = useState<ProjectShortageSummary[]>([])
  const [materials, setMaterials] = useState<Material[]>([])

  useEffect(() => {
    Promise.all([
      getLowStockAlerts(),
      getProjectShortageSummary(),
      getMaterials(),
    ]).then(([savedAlerts, savedSummary, savedMaterials]) => {
      setAlerts(savedAlerts)
      setSummary(savedSummary)
      setMaterials(savedMaterials)
    })
  }, [])

  const materialsByProject = useMemo(
    () =>
      PROJECT_CARDS.map((project) => ({
        projectId: project.id,
        materials: materials.filter(
          (material) => material.projectId === project.id,
        ),
      })),
    [materials],
  )

  const orderedSummary = useMemo(
    () =>
      [...summary].sort(
        (a, b) =>
          b.criticalItems - a.criticalItems ||
          b.shortageItems - a.shortageItems,
      ),
    [summary],
  )

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-2">
        <Siren className="text-red-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dashboard de Falta de Materiais
        </h2>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {orderedSummary.map((item) => {
          const severityClass =
            item.criticalItems > 0
              ? 'border-red-500/70 bg-red-500/10'
              : item.shortageItems > 0
                ? 'border-yellow-500/70 bg-yellow-500/10'
                : 'border-emerald-500/70 bg-emerald-500/10'

          return (
            <article
              key={item.projectId}
              className={`rounded-xl border p-4 ${severityClass}`}
            >
              <p className="flex items-center gap-2 font-semibold text-gray-100">
                <Building2 size={16} /> {item.projectId}
              </p>
              <p className="mt-2 text-sm text-gray-200">
                {item.shortageItems} material(is) em alerta •{' '}
                {item.criticalItems} crítico(s)
              </p>
            </article>
          )
        })}
      </div>

      <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <TriangleAlert size={16} /> Barras visuais de estoque por obra (todas
          as obras)
        </h3>

        <div className="space-y-5">
          {materialsByProject.map((projectGroup) => (
            <div key={projectGroup.projectId}>
              <p className="mb-2 text-sm font-semibold text-gray-100">
                {projectGroup.projectId}
              </p>

              <div className="space-y-2">
                {projectGroup.materials.map((material) => {
                  const denominator = Math.max(material.minQuantityAlert, 1)
                  const ratio = material.quantity / denominator
                  const percentage = Math.min(
                    100,
                    Math.max(4, Math.round(ratio * 100)),
                  )

                  return (
                    <div key={material.id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-300">{material.name}</span>
                        <span className="text-gray-400">
                          {material.quantity} {material.unitLabel} / mín{' '}
                          {material.minQuantityAlert} {material.unitLabel}
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-gray-700/70">
                        <div
                          className={`h-2 rounded-full ${getRiskColor(ratio)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}

                {!projectGroup.materials.length && (
                  <p className="text-xs text-gray-500">
                    Sem materiais cadastrados nesta obra.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-200">
          <AlertTriangle size={18} /> Eventos de falta em aberto
        </h3>

        <div className="space-y-2 text-sm">
          {alerts.map((alert) => (
            <p key={alert.materialId} className="text-gray-100">
              <strong>{alert.projectId}</strong> está ficando sem{' '}
              <strong>{alert.materialName}</strong> ({alert.quantity}{' '}
              {alert.unitLabel} / mínimo {alert.minQuantityAlert}{' '}
              {alert.unitLabel})
            </p>
          ))}

          {!alerts.length && (
            <p className="text-emerald-300">Sem eventos de falta no momento.</p>
          )}
        </div>
      </article>
    </section>
  )
}
