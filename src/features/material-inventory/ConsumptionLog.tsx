import { TrendingDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PROJECT_CARDS } from '../site-inspection-report/constants'
import {
  getConsumptionLogs,
  getMaterials,
  getMeasurementUnits,
  logConsumption,
} from './inventoryService'
import type { ConsumptionLog, Material, MeasurementUnit } from './types'

const INPUT_CLASS =
  'w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors'

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('pt-BR')
}

export function ConsumptionLogPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [logs, setLogs] = useState<ConsumptionLog[]>([])
  const [units, setUnits] = useState<MeasurementUnit[]>([])
  const [projectId, setProjectId] = useState(PROJECT_CARDS[0]?.id || '')
  const [materialId, setMaterialId] = useState('')
  const [date, setDate] = useState(getTodayDate())
  const [quantityUsed, setQuantityUsed] = useState('')
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    const [savedMaterials, savedUnits, savedLogs] = await Promise.all([
      getMaterials(),
      getMeasurementUnits(),
      getConsumptionLogs(),
    ])

    setMaterials(savedMaterials)
    setUnits(savedUnits)
    setLogs(savedLogs)
  }

  useEffect(() => {
    Promise.all([
      getMaterials(),
      getMeasurementUnits(),
      getConsumptionLogs(),
    ]).then(([savedMaterials, savedUnits, savedLogs]) => {
      setMaterials(savedMaterials)
      setUnits(savedUnits)
      setLogs(savedLogs)
    })
  }, [])

  const materialsByProject = useMemo(
    () => materials.filter((material) => material.projectId === projectId),
    [materials, projectId],
  )

  const effectiveMaterialId = materialsByProject.some(
    (material) => material.id === materialId,
  )
    ? materialId
    : materialsByProject[0]?.id || ''

  const selectedMaterial = useMemo(
    () => materials.find((item) => item.id === effectiveMaterialId),
    [effectiveMaterialId, materials],
  )

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.code === selectedMaterial?.unitCode),
    [selectedMaterial?.unitCode, units],
  )

  const recentByProject = useMemo(
    () => logs.filter((log) => log.projectId === projectId).slice(0, 8),
    [logs, projectId],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await logConsumption({
        materialId: effectiveMaterialId,
        date,
        quantityUsed: Number(quantityUsed),
        projectId,
        teamName,
      })

      setQuantityUsed('')
      setTeamName('')
      await loadData()
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message)
      }
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-2">
        <TrendingDown className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Registro de Consumo
        </h2>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:grid-cols-2"
      >
        <label className="space-y-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Data</span>
          <input
            type="date"
            className={INPUT_CLASS}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Obra / Projeto
          </span>
          <select
            className={INPUT_CLASS}
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            {PROJECT_CARDS.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Material da obra
          </span>
          <select
            className={INPUT_CLASS}
            value={effectiveMaterialId}
            onChange={(event) => setMaterialId(event.target.value)}
          >
            {materialsByProject.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name} ({material.quantity} {material.unitLabel})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Quantidade utilizada
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            className={INPUT_CLASS}
            value={quantityUsed}
            onChange={(event) => setQuantityUsed(event.target.value)}
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Equipe / Responsável
          </span>
          <input
            className={INPUT_CLASS}
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="Ex.: Pedreiro João"
          />
        </label>

        {selectedMaterial && (
          <p className="text-sm text-gray-600 dark:text-gray-300 md:col-span-2">
            Estoque atual de <strong>{selectedMaterial.name}</strong>:{' '}
            {selectedMaterial.quantity} {selectedMaterial.unitLabel}{' '}
            {selectedUnit ? `• ${selectedUnit.name}` : ''}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 md:col-span-2">
            {error}
          </p>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            disabled={!materialsByProject.length}
          >
            Dar baixa no estoque
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
          Histórico de baixas da obra selecionada
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-700 dark:bg-gray-700/50 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Quantidade</th>
              <th className="px-4 py-3">Obra</th>
            </tr>
          </thead>
          <tbody>
            {recentByProject.map((log) => (
              <tr
                key={log.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {formatDate(log.date)}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {log.teamName}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {log.materialName}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {log.quantityUsed} {log.unitLabel}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {log.projectId}
                </td>
              </tr>
            ))}
            {!recentByProject.length && (
              <tr>
                <td
                  className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                  colSpan={5}
                >
                  Sem baixas para esta obra até o momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
