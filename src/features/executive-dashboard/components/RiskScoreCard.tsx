import { AlertTriangle } from 'lucide-react'
import { RISK_CLASSIFICATION } from '../constants'
import type { RiscoClassificacao } from '../types'

type RiskScoreCardProps = {
  score: number
  classificacao: RiscoClassificacao
}

export function RiskScoreCard({ score, classificacao }: RiskScoreCardProps) {
  const riskConfig = RISK_CLASSIFICATION[classificacao]

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Índice Geral de Risco Operacional
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Peso: 40% Retrabalho • 35% Desperdício • 25% Compliance
          </p>
        </div>
        <AlertTriangle className="text-amber-500" size={20} />
      </header>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-bold text-gray-900 dark:text-white">
            {score}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Score de 0 a 100
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-sm font-semibold ${riskConfig.badgeClassName}`}
        >
          {classificacao}
        </span>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full ${
            classificacao === 'Baixo'
              ? 'bg-emerald-500'
              : classificacao === 'Médio'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
    </article>
  )
}
