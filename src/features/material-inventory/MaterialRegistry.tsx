import { PackagePlus, Pencil, Ruler, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PROJECT_CARDS } from '../site-inspection-report/constants'
import { UNIT_CATEGORIES } from './constants'
import {
  deleteMaterial,
  deleteMeasurementUnit,
  getMaterials,
  getMeasurementUnits,
  registerMaterial,
  registerMeasurementUnit,
  updateMaterial,
  updateMeasurementUnit,
} from './inventoryService'
import type { Material, MeasurementUnit, UnitCategory } from './types'

const INPUT_CLASS =
  'w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors'

type MaterialFormState = {
  name: string
  projectId: string
  unitCode: string
  quantity: string
  minQuantityAlert: string
}

type UnitFormState = {
  code: string
  name: string
  category: UnitCategory
}

function getCategoryBadgeClass(category: UnitCategory): string {
  if (category === 'Embalagem')
    return 'border-lime-500/60 text-lime-300 bg-lime-500/10'
  if (category === 'Peso')
    return 'border-emerald-500/60 text-emerald-300 bg-emerald-500/10'
  if (category === 'Volume')
    return 'border-cyan-500/60 text-cyan-300 bg-cyan-500/10'
  if (category === 'Tempo')
    return 'border-blue-500/60 text-blue-300 bg-blue-500/10'
  return 'border-violet-500/60 text-violet-300 bg-violet-500/10'
}

export function MaterialRegistry() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [units, setUnits] = useState<MeasurementUnit[]>([])
  const [error, setError] = useState('')

  const [materialForm, setMaterialForm] = useState<MaterialFormState>({
    name: '',
    projectId: PROJECT_CARDS[0]?.id || '',
    unitCode: '',
    quantity: '',
    minQuantityAlert: '',
  })
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
    null,
  )

  const [unitForm, setUnitForm] = useState<UnitFormState>({
    code: '',
    name: '',
    category: 'Embalagem',
  })
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)

  const loadData = async () => {
    const [savedMaterials, savedUnits] = await Promise.all([
      getMaterials(),
      getMeasurementUnits(),
    ])
    setMaterials(savedMaterials)
    setUnits(savedUnits)

    if (!materialForm.unitCode && savedUnits[0]) {
      setMaterialForm((previous) => ({
        ...previous,
        unitCode: savedUnits[0].code,
      }))
    }
  }

  useEffect(() => {
    Promise.all([getMaterials(), getMeasurementUnits()]).then(
      ([savedMaterials, savedUnits]) => {
        setMaterials(savedMaterials)
        setUnits(savedUnits)
        if (savedUnits[0]) {
          setMaterialForm((previous) => ({
            ...previous,
            unitCode: previous.unitCode || savedUnits[0].code,
          }))
        }
      },
    )
  }, [])

  const resetMaterialForm = () => {
    setEditingMaterialId(null)
    setMaterialForm((previous) => ({
      name: '',
      projectId: PROJECT_CARDS[0]?.id || previous.projectId,
      unitCode: units[0]?.code || previous.unitCode,
      quantity: '',
      minQuantityAlert: '',
    }))
  }

  const resetUnitForm = () => {
    setEditingUnitId(null)
    setUnitForm({ code: '', name: '', category: 'Embalagem' })
  }

  const handleMaterialSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError('')

    if (
      !materialForm.name.trim() ||
      !materialForm.projectId ||
      !materialForm.unitCode ||
      Number(materialForm.quantity) <= 0 ||
      Number(materialForm.minQuantityAlert) < 0
    ) {
      setError('Preencha todos os campos do material corretamente.')
      return
    }

    const payload = {
      name: materialForm.name,
      projectId: materialForm.projectId,
      unitCode: materialForm.unitCode,
      quantity: Number(materialForm.quantity),
      minQuantityAlert: Number(materialForm.minQuantityAlert),
    }

    if (editingMaterialId) {
      await updateMaterial(editingMaterialId, payload)
    } else {
      await registerMaterial(payload)
    }

    resetMaterialForm()
    await loadData()
  }

  const handleUnitSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      if (editingUnitId) {
        await updateMeasurementUnit(editingUnitId, unitForm)
      } else {
        await registerMeasurementUnit(unitForm)
      }

      resetUnitForm()
      await loadData()
    } catch (submitError) {
      if (submitError instanceof Error) setError(submitError.message)
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    setError('')
    try {
      await deleteMeasurementUnit(unitId)
      await loadData()
    } catch (submitError) {
      if (submitError instanceof Error) setError(submitError.message)
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    await deleteMaterial(materialId)
    await loadData()
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-2">
        <PackagePlus className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Cadastro de Materiais
        </h2>
      </header>

      {error && (
        <div className="rounded-lg border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleMaterialSubmit}
          className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
            {editingMaterialId ? 'Editar material' : 'Novo material'}
          </h3>
          <input
            className={INPUT_CLASS}
            placeholder="Nome"
            value={materialForm.name}
            onChange={(event) =>
              setMaterialForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
          />
          <select
            className={INPUT_CLASS}
            value={materialForm.projectId}
            onChange={(event) =>
              setMaterialForm((previous) => ({
                ...previous,
                projectId: event.target.value,
              }))
            }
          >
            {PROJECT_CARDS.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <select
            className={INPUT_CLASS}
            value={materialForm.unitCode}
            onChange={(event) =>
              setMaterialForm((previous) => ({
                ...previous,
                unitCode: event.target.value,
              }))
            }
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.code}>
                {unit.code} — {unit.name}
              </option>
            ))}
          </select>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              className={INPUT_CLASS}
              placeholder="Qtd inicial"
              min="0"
              step="0.01"
              value={materialForm.quantity}
              onChange={(event) =>
                setMaterialForm((previous) => ({
                  ...previous,
                  quantity: event.target.value,
                }))
              }
            />
            <input
              type="number"
              className={INPUT_CLASS}
              placeholder="Qtd mínima"
              min="0"
              step="0.01"
              value={materialForm.minQuantityAlert}
              onChange={(event) =>
                setMaterialForm((previous) => ({
                  ...previous,
                  minQuantityAlert: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {editingMaterialId ? 'Salvar material' : 'Cadastrar material'}
            </button>
            {editingMaterialId && (
              <button
                type="button"
                onClick={resetMaterialForm}
                className="rounded-md border border-gray-500 px-4 py-2 text-sm text-gray-300"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <form
          onSubmit={handleUnitSubmit}
          className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
            <Ruler size={16} />{' '}
            {editingUnitId ? 'Editar unidade' : 'Unidades de medida'}
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <input
              className={INPUT_CLASS}
              placeholder="Código"
              value={unitForm.code}
              onChange={(event) =>
                setUnitForm((previous) => ({
                  ...previous,
                  code: event.target.value.toUpperCase(),
                }))
              }
            />
            <input
              className="md:col-span-2 w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="Nome"
              value={unitForm.name}
              onChange={(event) =>
                setUnitForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </div>
          <select
            className={INPUT_CLASS}
            value={unitForm.category}
            onChange={(event) =>
              setUnitForm((previous) => ({
                ...previous,
                category: event.target.value as UnitCategory,
              }))
            }
          >
            {UNIT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              {editingUnitId ? 'Salvar unidade' : 'Registrar unidade'}
            </button>
            {editingUnitId && (
              <button
                type="button"
                onClick={resetUnitForm}
                className="rounded-md border border-gray-500 px-4 py-2 text-sm text-gray-300"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
          Unidades cadastradas
        </h3>
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500 dark:text-gray-300">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr
                key={unit.id}
                className="border-b border-gray-200/70 dark:border-gray-700/60"
              >
                <td className="px-3 py-2 text-gray-100">{unit.code}</td>
                <td className="px-3 py-2 text-gray-200">{unit.name}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${getCategoryBadgeClass(unit.category)}`}
                  >
                    {unit.category}
                  </span>
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUnitId(unit.id)
                      setUnitForm({
                        code: unit.code,
                        name: unit.name,
                        category: unit.category,
                      })
                    }}
                    className="rounded border border-blue-400/40 p-1 text-blue-300"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteUnit(unit.id)}
                    className="rounded border border-red-400/40 p-1 text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-700 dark:bg-gray-700/50 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3">Obra</th>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Unidade</th>
              <th className="px-4 py-3">Atual</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr
                key={material.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="px-4 py-3 text-gray-100">
                  {material.projectId}
                </td>
                <td className="px-4 py-3 text-gray-100">{material.name}</td>
                <td className="px-4 py-3 text-gray-300">
                  {material.unitLabel}
                </td>
                <td className="px-4 py-3 text-gray-300">{material.quantity}</td>
                <td className="px-4 py-3 text-gray-300">
                  {material.minQuantityAlert}
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMaterialId(material.id)
                      setMaterialForm({
                        name: material.name,
                        projectId: material.projectId,
                        unitCode: material.unitCode,
                        quantity: String(material.quantity),
                        minQuantityAlert: String(material.minQuantityAlert),
                      })
                    }}
                    className="rounded border border-blue-400/40 p-1 text-blue-300"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteMaterial(material.id)}
                    className="rounded border border-red-400/40 p-1 text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
