import { AlertTriangle, CalendarClock, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { COMPLIANCE_STATUS_BADGES, COMPLIANCE_STATUS_LABELS } from './constants'
import {
  PERSONNEL_COMPLIANCE_UPDATED_EVENT,
  getComplianceSummary,
  getCriticalAlerts,
  getUpcomingAlerts,
} from './complianceService'
import type { ComplianceSummary, EmployeeComplianceRow } from './types'

const EMPTY_SUMMARY: ComplianceSummary = {
  totalEmployees: 0,
  criticalPending: 0,
  upcomingDue: 0,
}

export function ComplianceDashboard() {
  const [summary, setSummary] = useState<ComplianceSummary>(EMPTY_SUMMARY)
  const [criticalRows, setCriticalRows] = useState<EmployeeComplianceRow[]>([])
  const [upcomingRows, setUpcomingRows] = useState<EmployeeComplianceRow[]>([])

  useEffect(() => {
    const load = () => {
      Promise.all([
        getComplianceSummary(),
        getCriticalAlerts(),
        getUpcomingAlerts(),
      ]).then(([savedSummary, savedCritical, savedUpcoming]) => {
        setSummary(savedSummary)
        setCriticalRows(savedCritical)
        setUpcomingRows(savedUpcoming)
      })
    }

    const timer = window.setTimeout(load, 0)
    window.addEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, load)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, load)
    }
  }, [])

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard de Pessoas & Compliance
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Visão consolidada para segurança do trabalho, jurídico e auditoria.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Users size={16} /> Total de Funcionários
          </p>
          <strong className="mt-2 block text-3xl text-gray-900 dark:text-white">
            {summary.totalEmployees}
          </strong>
        </article>

        <article className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-700/70 dark:bg-red-900/30">
          <p className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
            <AlertTriangle size={16} /> Pendências Críticas
          </p>
          <strong className="mt-2 block text-3xl text-red-700 dark:text-red-300">
            {summary.criticalPending}
          </strong>
        </article>

        <article className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700/70 dark:bg-yellow-900/30">
          <p className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-300">
            <CalendarClock size={16} /> Vencimentos Próximos
          </p>
          <strong className="mt-2 block text-3xl text-yellow-700 dark:text-yellow-300">
            {summary.upcomingDue}
          </strong>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
            <ShieldCheck size={16} /> Irregularidades ativas
          </h3>
          <div className="space-y-3">
            {criticalRows.map((row) => (
              <div
                key={row.employee.id}
                className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/40"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {row.employee.fullName}
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-red-700 dark:text-red-300">
                  {row.expiredItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {!criticalRows.length && (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Sem pendências críticas.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
            Itens a vencer (30 dias)
          </h3>
          <div className="space-y-3">
            {upcomingRows.map((row) => (
              <div
                key={row.employee.id}
                className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {row.employee.fullName}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${COMPLIANCE_STATUS_BADGES[row.status]}`}
                  >
                    {COMPLIANCE_STATUS_LABELS[row.status]}
                  </span>
                </div>
                <ul className="mt-1 list-inside list-disc text-sm text-yellow-800 dark:text-yellow-300">
                  {row.warningItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {!upcomingRows.length && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Nenhum vencimento próximo.
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
