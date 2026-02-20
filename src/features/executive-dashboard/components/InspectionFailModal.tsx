import {
  getSavedInspections,
  type InspectionHistoryEntry,
} from '../../inspection-history'

type InspectionFailModalProps = {
  checklistName: string
  onClose: () => void
}

export function InspectionFailModal({
  checklistName,
  onClose,
}: InspectionFailModalProps) {
  const inspections: InspectionHistoryEntry[] = getSavedInspections()

  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()

  const normalizedTarget = normalize(checklistName)

  console.log('%c=== MODAL ABERTO ===', 'color:#4ade80; font-weight:bold;')
  console.log('Checklist clicado (original):', checklistName)
  console.log('Checklist normalizado:', normalizedTarget)
  console.log('Inspeções carregadas:', inspections)

  const failed = inspections.filter((ins) =>
    ins.data.checklist.some((c) => {
      const normalizedDesc = normalize(c.description)
      const match = normalizedDesc === normalizedTarget && c.status === 'fail'

      console.log({
        itemDescription: c.description,
        normalizedDescription: normalizedDesc,
        target: normalizedTarget,
        status: c.status,
        match,
      })

      return match
    }),
  )

  console.log('%cItens com falha encontrados:', 'color:#93c5fd;', failed)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 text-slate-50 rounded-xl p-6 w-full max-w-xl shadow-xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4">
          Inspeções com falha: {checklistName}
        </h2>

        {failed.length === 0 && (
          <p className="text-slate-300">
            Nenhuma inspeção teve falha neste item.
          </p>
        )}

        {failed.length > 0 && (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {failed.map((ins) => (
              <li
                key={ins.id}
                className="p-3 rounded-lg border border-slate-700 bg-slate-800"
              >
                <p className="font-medium">{ins.data.header.title}</p>
                <p className="text-sm text-slate-300">
                  {ins.data.header.projectName} — {ins.data.header.location}
                </p>
                <p className="text-xs text-slate-400">
                  Data: {ins.data.header.date}
                </p>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
