import type { TrendPoint } from '../types'

type TrendChartProps = {
  data: TrendPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  const maxRetrabalho = Math.max(...data.map((point) => point.retrabalho), 1)

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        Tendência Mensal de Retrabalho
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Evolução ilustrativa dos últimos 4 meses (em % de inspeções reprovadas)
      </p>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {data.map((point) => {
          const height = Math.round((point.retrabalho / maxRetrabalho) * 100)

          return (
            <div key={point.mes} className="flex flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end rounded-lg bg-gray-100 p-2 dark:bg-gray-900">
                <div
                  className="w-full rounded-md bg-indigo-500"
                  style={{ height: `${Math.max(8, height)}%` }}
                />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {point.mes}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {point.retrabalho}%
              </p>
            </div>
          )
        })}
      </div>
    </article>
  )
}
