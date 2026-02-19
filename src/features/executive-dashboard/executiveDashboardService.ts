import {
  EXECUTIVE_DASHBOARD_MOCK,
  RISK_CLASSIFICATION,
  RISK_WEIGHTS,
} from './constants'
import type {
  ExecutiveDashboardData,
  RetrabalhoRiskData,
  DesperdicioRiskData,
  ComplianceRiskData,
  RiscoClassificacao,
} from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function calculateRetrabalhoScore(data: RetrabalhoRiskData): number {
  const taxaScore = 100 - data.taxaReprovacao * 2.5
  const reincidenciaScore = 100 - data.reincidencia * 2
  const tempoScore = 100 - data.tempoMedioCorrecaoDias * 8

  return clamp(
    taxaScore * 0.45 + reincidenciaScore * 0.35 + tempoScore * 0.2,
    0,
    100,
  )
}

function calculateDesperdicioScore(data: DesperdicioRiskData): number {
  const desvioScore = 100 - data.desvioPercentual * 12
  return clamp(desvioScore, 0, 100)
}

function classifyRisk(score: number): RiscoClassificacao {
  if (score >= RISK_CLASSIFICATION.Baixo.min) {
    return 'Baixo'
  }

  if (score >= RISK_CLASSIFICATION.Médio.min) {
    return 'Médio'
  }

  return 'Alto'
}

function calculateRiscoGeral(
  retrabalho: RetrabalhoRiskData,
  desperdicio: DesperdicioRiskData,
  compliance: ComplianceRiskData,
): ExecutiveDashboardData['riscoGeral'] {
  const score = Math.round(
    calculateRetrabalhoScore(retrabalho) * RISK_WEIGHTS.retrabalho +
      calculateDesperdicioScore(desperdicio) * RISK_WEIGHTS.desperdicio +
      compliance.indiceConformidade * RISK_WEIGHTS.compliance,
  )

  return {
    score,
    classificacao: classifyRisk(score),
  }
}

export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardData> {
  const baseData = EXECUTIVE_DASHBOARD_MOCK

  return Promise.resolve({
    ...baseData,
    riscoGeral: calculateRiscoGeral(
      baseData.retrabalho,
      baseData.desperdicio,
      baseData.compliance,
    ),
  })
}
