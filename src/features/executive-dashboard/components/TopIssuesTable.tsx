type TopIssuesTableProps = {
  title: string
  headers: [string, string]
  rows: Array<{ label: string; value: string }>
}

export function TopIssuesTable({ title, headers, rows }: TopIssuesTableProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-72 text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 font-medium text-gray-600 dark:text-gray-300">
                {headers[0]}
              </th>
              <th className="pb-2 text-right font-medium text-gray-600 dark:text-gray-300">
                {headers[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className="py-2 text-gray-900 dark:text-gray-200">
                  {row.label}
                </td>
                <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
