import type { ExecutiveDashboardData, RiscoClassificacao } from './types'

export const RISK_WEIGHTS = {
  retrabalho: 0.4,
  desperdicio: 0.35,
  compliance: 0.25,
} as const

export const RISK_CLASSIFICATION: Record<
  RiscoClassificacao,
  { min: number; max: number; badgeClassName: string }
> = {
  Baixo: {
    min: 70,
    max: 100,
    badgeClassName:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/70 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  Médio: {
    min: 40,
    max: 69,
    badgeClassName:
      'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-700/70 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  Alto: {
    min: 0,
    max: 39,
    badgeClassName:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-700/70 dark:bg-red-900/30 dark:text-red-300',
  },
}

export const EXECUTIVE_DASHBOARD_MOCK: ExecutiveDashboardData = {
  retrabalho: {
    taxaReprovacao: 12,
    tempoMedioCorrecaoDias: 3.8,
    reincidencia: 8,
    impactoEstimado: 78000,
    topErros: [
      { categoria: 'Alvenaria', ocorrencias: 14 },
      { categoria: 'Impermeabilização', ocorrencias: 9 },
      { categoria: 'Instalação elétrica', ocorrencias: 8 },
      { categoria: 'Reboco interno', ocorrencias: 7 },
      { categoria: 'Nível de piso', ocorrencias: 5 },
    ],
  },
  desperdicio: {
    desvioPercentual: 3.2,
    impactoEstimado: 142000,
    obraMaisCritica: 'Tulum Residence',
    topMateriaisVariacao: [
      { material: 'Concreto usinado', variacaoPercentual: 6.4 },
      { material: 'Aço CA-50', variacaoPercentual: 5.1 },
      { material: 'Argamassa colante', variacaoPercentual: 4.3 },
    ],
  },
  compliance: {
    pendenciasPercentual: 18,
    documentosVencidos: 22,
    treinamentosAVencer: 16,
    indiceConformidade: 64,
  },
  riscoGeral: {
    score: 58,
    classificacao: 'Médio',
  },
  tendenciaMensal: [
    { mes: 'Jan', retrabalho: 14, desperdicio: 4.1, compliance: 61 },
    { mes: 'Fev', retrabalho: 13, desperdicio: 3.7, compliance: 62 },
    { mes: 'Mar', retrabalho: 12.5, desperdicio: 3.5, compliance: 63 },
    { mes: 'Abr', retrabalho: 12, desperdicio: 3.2, compliance: 64 },
  ],
}
