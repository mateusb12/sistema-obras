export type TopIssue = {
  categoria: string
  ocorrencias: number
}

export type MaterialVariation = {
  material: string
  variacaoPercentual: number
}

export type TrendPoint = {
  mes: string
  retrabalho: number
  desperdicio: number
  compliance: number
}

export type RetrabalhoRiskData = {
  taxaReprovacao: number
  tempoMedioCorrecaoDias: number
  reincidencia: number
  impactoEstimado: number
  topErros: TopIssue[]
}

export type DesperdicioRiskData = {
  desvioPercentual: number
  impactoEstimado: number
  obraMaisCritica: string
  topMateriaisVariacao: MaterialVariation[]
}

export type ComplianceRiskData = {
  pendenciasPercentual: number
  documentosVencidos: number
  treinamentosAVencer: number
  indiceConformidade: number
}

export type RiscoClassificacao = 'Baixo' | 'Médio' | 'Alto'

export type RiscoGeralData = {
  score: number
  classificacao: RiscoClassificacao
}

export type ExecutiveDashboardData = {
  retrabalho: RetrabalhoRiskData
  desperdicio: DesperdicioRiskData
  compliance: ComplianceRiskData
  riscoGeral: RiscoGeralData
  tendenciaMensal: TrendPoint[]
}

export type InspectionType = 'estrutural' | 'nao_estrutural' | 'contrapiso'
