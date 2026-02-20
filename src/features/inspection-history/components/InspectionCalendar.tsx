import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InspectionHistoryEntry } from '../types.ts'

function hasNonConformity(inspection: InspectionHistoryEntry): boolean {
  return inspection.data.checklist.some((item) => item.status === 'fail')
}

interface InspectionCalendarProps {
  inspections: InspectionHistoryEntry[]
}

export function InspectionCalendar({ inspections }: InspectionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const inspectionMap = useMemo(() => {
    const map: Record<string, { total: number; fails: number }> = {}
    inspections.forEach((insp) => {
      const date = insp.data.header.date
      if (!map[date]) map[date] = { total: 0, fails: 0 }
      map[date].total += 1
      if (hasNonConformity(insp)) map[date].fails += 1
    })
    return map
  }, [inspections])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthName = currentDate.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
          {monthName}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm">
        {blanks.map((b) => (
          <div key={`blank-${b}`} />
        ))}
        {days.map((day) => {
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const stats = inspectionMap[dateString]

          let bgClass =
            'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400 border border-transparent'

          if (stats) {
            if (stats.fails > 0) {
              bgClass =
                'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/50 font-semibold shadow-sm'
            } else {
              bgClass =
                'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/50 font-semibold shadow-sm'
            }
          }

          return (
            <div
              key={day}
              className={`flex h-10 w-full items-center justify-center rounded-md transition-colors ${bgClass}`}
              title={
                stats
                  ? `${stats.total} inspeções (${stats.fails} com falhas)`
                  : 'Sem inspeções'
              }
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
