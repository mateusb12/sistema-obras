export type UnitCategory =
  | 'Embalagem'
  | 'Peso'
  | 'Volume'
  | 'Comprimento'
  | 'Tempo'
  | 'Outros'

export type MeasurementUnit = {
  id: string
  code: string
  name: string
  category: UnitCategory
  createdAt: string
}

export type Material = {
  id: string
  name: string
  projectId: string
  unitCode: string
  unitLabel: string
  quantity: number
  minQuantityAlert: number
  createdAt: string
  updatedAt: string
}

export type ConsumptionLog = {
  id: string
  materialId: string
  materialName: string
  quantityUsed: number
  unitCode: string
  unitLabel: string
  date: string
  projectId: string
  teamName: string
  createdAt: string
}

export type RegisterMaterialInput = {
  name: string
  projectId: string
  unitCode: string
  quantity: number
  minQuantityAlert: number
}

export type UpdateMaterialInput = RegisterMaterialInput

export type LogConsumptionInput = {
  materialId: string
  quantityUsed: number
  date: string
  projectId: string
  teamName: string
}

export type RegisterMeasurementUnitInput = {
  code: string
  name: string
  category: UnitCategory
}

export type UpdateMeasurementUnitInput = RegisterMeasurementUnitInput

export type LowStockAlert = {
  materialId: string
  materialName: string
  projectId: string
  quantity: number
  minQuantityAlert: number
  unitLabel: string
}

export type ProjectShortageSummary = {
  projectId: string
  shortageItems: number
  criticalItems: number
}
