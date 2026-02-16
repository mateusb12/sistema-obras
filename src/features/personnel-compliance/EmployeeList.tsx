import { Paperclip, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PROJECT_CARDS } from '../site-inspection-report/constants'
import {
  PERSONNEL_ROLES,
  COMPLIANCE_STATUS_BADGES,
  COMPLIANCE_STATUS_LABELS,
} from './constants'
import {
  PERSONNEL_COMPLIANCE_UPDATED_EVENT,
  createEmployee,
  deleteEmployee,
  getComplianceRows,
  updateEmployee,
} from './complianceService'
import { getPersonnelDetailsPath, navigateTo } from '../../routes/router'
import type { Employee, EmployeeComplianceRow } from './types'

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white'

type EmployeeForm = {
  fullName: string
  role: string
  projectId: string
  hiredAt: string
}

function toDateInput(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function EmployeeList() {
  const [rows, setRows] = useState<EmployeeComplianceRow[]>([])
  const [feedback, setFeedback] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeeForm>({
    fullName: '',
    role: PERSONNEL_ROLES[0],
    projectId: PROJECT_CARDS[0]?.id || '',
    hiredAt: new Date().toISOString().slice(0, 10),
  })

  const loadRows = async () => {
    const savedRows = await getComplianceRows()
    setRows(savedRows)
  }

  useEffect(() => {
    const reload = () => {
      void loadRows()
    }

    const timer = window.setTimeout(reload, 0)
    window.addEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, reload)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, reload)
    }
  }, [])

  const modalTitle = useMemo(
    () => (editingEmployee ? 'Editar funcionário' : 'Novo funcionário'),
    [editingEmployee],
  )

  const openCreateModal = () => {
    setEditingEmployee(null)
    setForm({
      fullName: '',
      role: PERSONNEL_ROLES[0],
      projectId: PROJECT_CARDS[0]?.id || '',
      hiredAt: new Date().toISOString().slice(0, 10),
    })
    setIsFormOpen(true)
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setForm({
      fullName: employee.fullName,
      role: employee.role,
      projectId: employee.projectId,
      hiredAt: toDateInput(employee.hiredAt),
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !form.fullName.trim() ||
      !form.role ||
      !form.projectId ||
      !form.hiredAt
    ) {
      setFeedback('Preencha todos os dados obrigatórios.')
      return
    }

    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, {
        fullName: form.fullName,
        role: form.role,
        projectId: form.projectId,
        hiredAt: new Date(form.hiredAt).toISOString(),
      })
      setFeedback('Funcionário atualizado com sucesso.')
    } else {
      await createEmployee({
        id: crypto.randomUUID(),
        fullName: form.fullName,
        role: form.role,
        projectId: form.projectId,
        hiredAt: new Date(form.hiredAt).toISOString(),
        documents: [],
        trainings: [],
        vaccines: [],
      })
      setFeedback('Funcionário criado com sucesso.')
    }

    setIsFormOpen(false)
    setEditingEmployee(null)
    await loadRows()
  }

  const handleDelete = async (employee: Employee) => {
    const confirmDelete = window.confirm(
      `Excluir ${employee.fullName}? Os documentos, treinamentos e vacinas também serão removidos.`,
    )

    if (!confirmDelete) return

    await deleteEmployee(employee.id)
    setFeedback('Funcionário excluído com sucesso.')
    await loadRows()
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lista de Funcionários
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Acompanhamento rápido da regularidade documental e treinamentos.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Novo Funcionário
        </button>
      </header>

      {feedback && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-700/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          {feedback}
        </p>
      )}

      <article className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
              <th className="px-2 py-2">Funcionário</th>
              <th className="px-2 py-2">Cargo</th>
              <th className="px-2 py-2">Obra</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Evidências</th>
              <th className="px-2 py-2">Pendências</th>
              <th className="px-2 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((row) => {
              const highlights = [...row.expiredItems, ...row.warningItems]

              return (
                <tr
                  key={row.employee.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  onClick={() =>
                    navigateTo(getPersonnelDetailsPath(row.employee.id))
                  }
                >
                  <td className="px-2 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {row.employee.fullName}
                  </td>
                  <td className="px-2 py-3 text-gray-700 dark:text-gray-300">
                    {row.employee.role}
                  </td>
                  <td className="px-2 py-3 text-gray-700 dark:text-gray-300">
                    {row.employee.projectId}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${COMPLIANCE_STATUS_BADGES[row.status]}`}
                    >
                      {COMPLIANCE_STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        navigateTo(getPersonnelDetailsPath(row.employee.id))
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <Paperclip size={12} />
                      Ver anexos
                    </button>
                  </td>
                  <td className="px-2 py-3 text-gray-700 dark:text-gray-300">
                    {highlights.length
                      ? highlights.slice(0, 2).join(' • ')
                      : 'Sem pendências'}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditModal(row.employee)
                        }}
                        className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(row.employee)
                        }}
                        className="rounded-md border border-red-300 p-1.5 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </article>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {modalTitle}
            </h3>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                className={INPUT_CLASS}
                placeholder="Nome completo"
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
              <select
                className={INPUT_CLASS}
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value }))
                }
              >
                {PERSONNEL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                className={INPUT_CLASS}
                value={form.projectId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
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
              <input
                type="date"
                className={INPUT_CLASS}
                value={form.hiredAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, hiredAt: event.target.value }))
                }
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
