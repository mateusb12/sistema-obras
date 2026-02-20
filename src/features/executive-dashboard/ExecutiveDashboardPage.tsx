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
  ArrowLeft,
} from 'lucide-react'
import { DashboardMainCard } from './components/DashboardMainCard.tsx'
import { ChecklistPieChart } from './components/ChecklistPieChart.tsx'
import { InspectionFailList } from './components/InspectionFailList.tsx'

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
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(
    null,
  )

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

      <div className="grid gap-4">
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
          <div className="animate-in fade-in duration-300">
            {!selectedChecklist ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {checklistStats.map((item) => (
                  <div
                    key={item.description}
                    className="
    rounded-2xl border border-gray-700 bg-gray-900/30 p-4
    cursor-pointer
    transition-all duration-300 ease-out
    hover:scale-[1.04]
    hover:border-indigo-400/60
    hover:shadow-[0_0_25px_rgba(99,102,241,0.45)]
    hover:bg-gray-900/50
  "
                    onClick={() => setSelectedChecklist(item.description)}
                  >
                    <h3
                      className="text-base font-semibold text-white line-clamp-2"
                      title={item.description}
                    >
                      {item.description}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2 truncate">
                      {item.category}
                    </p>

                    <ChecklistPieChart
                      success={item.successPct}
                      fail={item.failPct}
                      onFailClick={() => setSelectedChecklist(item.description)}
                    />

                    <div className="mt-3 text-xs text-gray-400 text-center border-t border-gray-800 pt-2">
                      {item.total} inspeções
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => setSelectedChecklist(null)}
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors w-fit font-medium"
                >
                  <ArrowLeft size={20} />
                  Voltar para visão geral
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gray-900/20 p-6 rounded-2xl border border-gray-800">
                  <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                    {(() => {
                      const item = checklistStats.find(
                        (c) => c.description === selectedChecklist,
                      )
                      if (!item) return null

                      return (
                        <>
                          <h3 className="text-xl font-bold text-white text-center mb-2">
                            {item.description}
                          </h3>
                          <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full mb-6">
                            Categoria: {item.category}
                          </span>

                          <div className="w-full max-w-[250px]">
                            <ChecklistPieChart
                              success={item.successPct}
                              fail={item.failPct}
                            />
                          </div>

                          <div className="mt-6 flex gap-4 text-sm w-full justify-center">
                            <div className="text-emerald-400 font-medium">
                              Aprovado: {item.pass}
                            </div>
                            <div className="text-red-400 font-medium">
                              Falha: {item.fail}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  <div className="lg:col-span-2">
                    <InspectionFailList checklistName={selectedChecklist} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
