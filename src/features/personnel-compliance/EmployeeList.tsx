import { useEffect, useState } from 'react'
import { COMPLIANCE_STATUS_BADGES, COMPLIANCE_STATUS_LABELS } from './constants'
import { getComplianceRows } from './complianceService'
import type { EmployeeComplianceRow } from './types'

export function EmployeeList() {
  const [rows, setRows] = useState<EmployeeComplianceRow[]>([])

  useEffect(() => {
    getComplianceRows().then((savedRows) => {
      setRows(savedRows)
    })
  }, [])

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Lista de Funcionários
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Acompanhamento rápido da regularidade documental e treinamentos.
        </p>
      </header>

      <article className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
              <th className="px-2 py-2">Funcionário</th>
              <th className="px-2 py-2">Cargo</th>
              <th className="px-2 py-2">Obra</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Pendências</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((row) => {
              const highlights = [...row.expiredItems, ...row.warningItems]

              return (
                <tr key={row.employee.id}>
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
                  <td className="px-2 py-3 text-gray-700 dark:text-gray-300">
                    {highlights.length
                      ? highlights.join(' • ')
                      : 'Sem pendências'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </article>
    </section>
  )
}
