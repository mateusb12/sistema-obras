import { AlertTriangle } from 'lucide-react'
import { RISK_CLASSIFICATION } from '../constants'
import type { RiscoClassificacao } from '../types'

type RiskScoreCardProps = {
  score: number
  classificacao: RiscoClassificacao
  isActive: boolean
  onClick: () => void
}

export function RiskScoreCard({
  score,
  classificacao,
  isActive,
  onClick,
}: RiskScoreCardProps) {
  const riskConfig = RISK_CLASSIFICATION[classificacao]

  const activeStyles = isActive
    ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-offset-2 ring-indigo-500 dark:border-indigo-600/50 dark:bg-indigo-900/20 shadow-md scale-[1.02]'
    : 'border-gray-200 bg-gray-50/50 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/30'

  return (
    <div
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-5 text-left transition-all duration-200 ${activeStyles}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Índice Geral de Risco Operacional
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Peso: 40% Retrabalho • 35% Desperdício • 25% Compliance
          </p>
        </div>
        <AlertTriangle
          className={`${isActive ? 'text-amber-500' : 'text-gray-400'}`}
          size={20}
        />
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
    </div>
  )
}
