import {
  getSavedInspections,
  type InspectionHistoryEntry,
} from '../../inspection-history'

type InspectionFailListProps = {
  checklistName: string
}

export function InspectionFailList({ checklistName }: InspectionFailListProps) {
  const inspections: InspectionHistoryEntry[] = getSavedInspections()

  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()

  const normalizedTarget = normalize(checklistName)

  const failed = inspections.filter((ins) =>
    ins.data.checklist.some((c) => {
      const normalizedDesc = normalize(c.description)
      return normalizedDesc === normalizedTarget && c.status === 'fail'
    }),
  )

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-slate-50">
        Inspeções com falha
      </h2>

      {failed.length === 0 && (
        <p className="text-slate-300">
          Nenhuma inspeção teve falha neste item.
        </p>
      )}

      {failed.length > 0 && (
        <ul className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
          {failed.map((ins) => (
            <li
              key={ins.id}
              className="p-4 rounded-lg border border-red-900/50 bg-red-950/20"
            >
              <p className="font-medium text-slate-100">
                {ins.data.header.title}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                {ins.data.header.projectName} — {ins.data.header.location}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Data: {ins.data.header.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
