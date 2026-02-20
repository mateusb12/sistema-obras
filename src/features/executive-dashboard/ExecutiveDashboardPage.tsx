import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/types'
import {
  getChecklistStats,
  getExecutiveDashboardData,
} from './executiveDashboardService'
import type { ExecutiveDashboardData } from './types'
import { TopIssuesTable } from './components/TopIssuesTable'
import { TrendChart } from './components/TrendChart'
import {
  BarChart2,
  PieChart,
  Package,
  Repeat2,
  ShieldCheck,
} from 'lucide-react'
import { DashboardMainCard } from './components/DashboardMainCard.tsx'
import { ChecklistPieChart } from './components/ChecklistPieChart.tsx'

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

type TabId =
  | 'geral'
  | 'retrabalho'
  | 'desperdicio'
  | 'compliance'
  | 'conformidade_itens'

export function ExecutiveDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<ExecutiveDashboardData>(emptyDashboard)
  const [activeTab, setActiveTab] = useState<TabId>('geral')
  const [checklistStats, setChecklistStats] = useState<any[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getExecutiveDashboardData().then((savedData) => {
        setData(savedData)
      })

      const stats = getChecklistStats()
      setChecklistStats(stats)
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
          Selecione um indicador abaixo para detalhar os dados e focar na
          resolução de problemas.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardMainCard
          title="Geral"
          value={`${data.riscoGeral.score} pts`}
          icon={<BarChart2 size={28} />}
          isActive={activeTab === 'geral'}
          onClick={() => setActiveTab('geral')}
        />

        <DashboardMainCard
          title="Conformidade"
          value="Por item"
          icon={<PieChart size={28} />}
          isActive={activeTab === 'conformidade_itens'}
          onClick={() => setActiveTab('conformidade_itens')}
        />

        <DashboardMainCard
          title="Retrabalho"
          value={formatPercent(data.retrabalho.taxaReprovacao)}
          icon={<Repeat2 size={28} />}
          isActive={activeTab === 'retrabalho'}
          onClick={() => setActiveTab('retrabalho')}
        />

        <DashboardMainCard
          title="Desperdício"
          value={formatPercent(data.desperdicio.desvioPercentual)}
          icon={<Package size={28} />}
          isActive={activeTab === 'desperdicio'}
          onClick={() => setActiveTab('desperdicio')}
        />

        <DashboardMainCard
          title="Compliance"
          value={`${data.compliance.indiceConformidade}`}
          icon={<ShieldCheck size={28} />}
          isActive={activeTab === 'compliance'}
          onClick={() => setActiveTab('compliance')}
        />
      </div>

      <hr className="my-8 border-t border-gray-200 dark:border-gray-800" />

      <div className="grid gap-4 lg:grid-cols-2">
        {activeTab === 'geral' && (
          <article className="lg:col-span-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-700/70 dark:bg-indigo-900/20">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
              Resumo Estratégico: Custo Invisível Estimado
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Soma estimada de perdas por retrabalho e desperdício em todas as
              obras.
            </p>

            <p className="mt-6 text-4xl font-bold text-indigo-900 dark:text-indigo-100">
              {isAdmin
                ? formatCurrency(custoInvisivelEstimado)
                : 'Visível apenas para admin'}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-white/80 p-3 dark:bg-gray-900/40">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Perda com Retrabalho
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isAdmin
                    ? formatCurrency(data.retrabalho.impactoEstimado)
                    : '--'}
                </p>
              </div>

              <div className="rounded-lg bg-white/80 p-3 dark:bg-gray-900/40">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Perda com Desperdício
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isAdmin
                    ? formatCurrency(data.desperdicio.impactoEstimado)
                    : '--'}
                </p>
              </div>
            </div>
          </article>
        )}

        {activeTab === 'retrabalho' && (
          <>
            <TopIssuesTable
              title="Top 5 Erros por Categoria (Retrabalho)"
              headers={['Categoria', 'Ocorrências']}
              rows={data.retrabalho.topErros.map((item) => ({
                label: item.categoria,
                value: `${item.ocorrencias}`,
              }))}
            />

            <TrendChart data={data.tendenciaMensal} />
          </>
        )}

        {activeTab === 'desperdicio' && (
          <TopIssuesTable
            title="Top 3 Materiais com Maior Variação (Desperdício)"
            headers={['Material', 'Variação']}
            rows={data.desperdicio.topMateriaisVariacao.map((item) => ({
              label: item.material,
              value: `${item.variacaoPercentual}%`,
            }))}
          />
        )}

        {activeTab === 'compliance' && (
          <article className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Detalhes de Compliance em desenvolvimento
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Em breve, listagem de documentos pendentes e treinamentos
              vencidos.
            </p>
          </article>
        )}

        {activeTab === 'conformidade_itens' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {checklistStats.map((item) => (
              <div
                key={item.description}
                className="rounded-2xl border border-gray-700 bg-gray-900/30 p-4"
              >
                <h3 className="text-base font-semibold text-white">
                  {item.description}
                </h3>

                <p className="text-sm text-gray-400 mb-2">
                  Categoria: {item.category}
                </p>

                <ChecklistPieChart
                  success={item.successPct}
                  fail={item.failPct}
                />

                <div className="mt-3 text-xs text-gray-400">
                  Total inspeções: {item.total}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
