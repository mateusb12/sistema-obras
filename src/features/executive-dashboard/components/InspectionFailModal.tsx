import { getSavedInspections } from '../../inspection-history'

export function InspectionFailModal({ checklistName, onClose }) {
  const inspections = getSavedInspections()

  const failed = inspections.filter((ins) =>
    ins.data.checklist.some(
      (c) => c.description === checklistName && c.status === 'fail',
    ),
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-50">
          Inspeções com falha: {checklistName}
        </h2>

        {failed.length === 0 && (
          <p className="text-gray-600">
            Nenhuma inspeção teve falha neste item.
          </p>
        )}

        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {failed.map((ins) => (
            <li
              key={ins.id}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            >
              <p className="font-medium text-gray-900 dark:text-gray-50">
                {ins.data.header.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ins.data.header.projectName} — {ins.data.header.location}
              </p>
              <p className="text-xs text-gray-500">
                Data: {ins.data.header.date}
              </p>
            </li>
          ))}
        </ul>

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
