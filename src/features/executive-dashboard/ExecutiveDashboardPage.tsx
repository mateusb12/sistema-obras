import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/types'
import { getExecutiveDashboardData } from './executiveDashboardService'
import type { ExecutiveDashboardData } from './types'
import { RiskCard } from './components/RiskCard'
import { RiskScoreCard } from './components/RiskScoreCard'
import { TopIssuesTable } from './components/TopIssuesTable'
import { TrendChart } from './components/TrendChart'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`
}

function emptyDashboard(): ExecutiveDashboardData {
  return {
    retrabalho: {
      taxaReprovacao: 0,
      tempoMedioCorrecaoDias: 0,
      reincidencia: 0,
      impactoEstimado: 0,
      topErros: [],
    },
    desperdicio: {
      desvioPercentual: 0,
      impactoEstimado: 0,
      obraMaisCritica: '-',
      topMateriaisVariacao: [],
    },
    compliance: {
      pendenciasPercentual: 0,
      documentosVencidos: 0,
      treinamentosAVencer: 0,
      indiceConformidade: 0,
    },
    riscoGeral: {
      score: 0,
      classificacao: 'Alto',
    },
    tendenciaMensal: [],
  }
}

export function ExecutiveDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<ExecutiveDashboardData>(emptyDashboard)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getExecutiveDashboardData().then((savedData) => {
        setData(savedData)
      })
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const isAdmin = user?.role === ROLES.ADMIN

  const custoInvisivelEstimado = useMemo(
    () => data.retrabalho.impactoEstimado + data.desperdicio.impactoEstimado,
    [data.desperdicio.impactoEstimado, data.retrabalho.impactoEstimado],
  )

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Radar de Risco Operacional
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Painel executivo estratégico com dados ilustrativos para tomada de
          decisão.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <RiskCard
          title="Risco de Retrabalho"
          subtitle="Inspeções reprovadas, tempo médio de correção e reincidência"
          highlightValue={formatPercent(data.retrabalho.taxaReprovacao)}
          highlightLabel="Taxa de reprovação"
          toneClassName="border-orange-200 bg-orange-50 dark:border-orange-700/70 dark:bg-orange-900/20"
        >
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Tempo médio de correção:{' '}
            <strong>{data.retrabalho.tempoMedioCorrecaoDias} dias</strong>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Reincidência: <strong>{data.retrabalho.reincidencia}%</strong>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Impacto potencial:{' '}
            <strong>
              {isAdmin
                ? formatCurrency(data.retrabalho.impactoEstimado)
                : 'Visível apenas para admin'}
            </strong>
          </p>
        </RiskCard>

        <RiskCard
          title="Risco de Desperdício"
          subtitle="Consumo vs previsto e variações de materiais"
          highlightValue={formatPercent(data.desperdicio.desvioPercentual)}
          highlightLabel="Desvio percentual acumulado"
          toneClassName="border-rose-200 bg-rose-50 dark:border-rose-700/70 dark:bg-rose-900/20"
        >
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Obra mais crítica:{' '}
            <strong>{data.desperdicio.obraMaisCritica}</strong>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Desvio estimado:{' '}
            <strong>
              {isAdmin
                ? formatCurrency(data.desperdicio.impactoEstimado)
                : 'Visível apenas para admin'}
            </strong>
          </p>
        </RiskCard>

        <RiskCard
          title="Risco Jurídico & Conformidade"
          subtitle="Pendências documentais, treinamentos e obrigações legais"
          highlightValue={`${data.compliance.indiceConformidade}`}
          highlightLabel="Índice de conformidade (0–100)"
          toneClassName="border-cyan-200 bg-cyan-50 dark:border-cyan-700/70 dark:bg-cyan-900/20"
        >
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Funcionários com pendência:{' '}
            <strong>{data.compliance.pendenciasPercentual}%</strong>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Documentos vencidos:{' '}
            <strong>{data.compliance.documentosVencidos}</strong>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Treinamentos a vencer:{' '}
            <strong>{data.compliance.treinamentosAVencer}</strong>
          </p>
        </RiskCard>

        <RiskScoreCard
          score={data.riscoGeral.score}
          classificacao={data.riscoGeral.classificacao}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopIssuesTable
          title="Top 5 Erros por Categoria"
          headers={['Categoria', 'Ocorrências']}
          rows={data.retrabalho.topErros.map((item) => ({
            label: item.categoria,
            value: `${item.ocorrencias}`,
          }))}
        />

        <TopIssuesTable
          title="Top 3 Materiais com Maior Variação"
          headers={['Material', 'Variação']}
          rows={data.desperdicio.topMateriaisVariacao.map((item) => ({
            label: item.material,
            value: `${item.variacaoPercentual}%`,
          }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart data={data.tendenciaMensal} />

        <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-700/70 dark:bg-indigo-900/20">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
            Custo Invisível Estimado
          </h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Soma estimada de perdas por retrabalho e desperdício.
          </p>

          <p className="mt-6 text-4xl font-bold text-indigo-900 dark:text-indigo-100">
            {isAdmin
              ? formatCurrency(custoInvisivelEstimado)
              : 'Visível apenas para admin'}
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-white/80 p-3 dark:bg-gray-900/40">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Retrabalho
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {isAdmin
                  ? formatCurrency(data.retrabalho.impactoEstimado)
                  : '--'}
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 dark:bg-gray-900/40">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Desperdício
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {isAdmin
                  ? formatCurrency(data.desperdicio.impactoEstimado)
                  : '--'}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
