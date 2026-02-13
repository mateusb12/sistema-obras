import { PROJECT_CARDS } from '../site-inspection-report/constants'
import { INVENTORY_STORAGE_KEYS } from './constants'
import type {
  ConsumptionLog,
  LogConsumptionInput,
  LowStockAlert,
  Material,
  MeasurementUnit,
  ProjectShortageSummary,
  RegisterMaterialInput,
  RegisterMeasurementUnitInput,
  UpdateMaterialInput,
  UpdateMeasurementUnitInput,
} from './types'

const INVENTORY_SEED_MARKER_KEY = 'cm.inventory.seeded.v4'

function readUnitsSync(): MeasurementUnit[] {
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEYS.units)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as MeasurementUnit[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readMaterialsSync(): Material[] {
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEYS.materials)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Array<Material & { unit?: string }>
    if (!Array.isArray(parsed)) return []

    return parsed.map((material) => ({
      ...material,
      projectId: material.projectId || 'Obra Interna — Reformas',
      unitCode: material.unitCode || material.unit || 'UN',
      unitLabel:
        material.unitLabel || material.unitCode || material.unit || 'UN',
    }))
  } catch {
    return []
  }
}

function readLogsSync(): ConsumptionLog[] {
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEYS.logs)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Array<ConsumptionLog & { unit?: string }>
    if (!Array.isArray(parsed)) return []

    return parsed.map((log) => ({
      ...log,
      unitCode: log.unitCode || log.unit || 'UN',
      unitLabel: log.unitLabel || log.unitCode || log.unit || 'UN',
      projectId: log.projectId || 'Obra Interna — Reformas',
    }))
  } catch {
    return []
  }
}

function writeUnits(units: MeasurementUnit[]): void {
  localStorage.setItem(INVENTORY_STORAGE_KEYS.units, JSON.stringify(units))
}

function writeMaterials(materials: Material[]): void {
  localStorage.setItem(
    INVENTORY_STORAGE_KEYS.materials,
    JSON.stringify(materials),
  )
}

function writeLogs(logs: ConsumptionLog[]): void {
  localStorage.setItem(INVENTORY_STORAGE_KEYS.logs, JSON.stringify(logs))
}

function getUnitLabel(units: MeasurementUnit[], unitCode: string): string {
  return units.find((unit) => unit.code === unitCode)?.code || unitCode
}

function ensureUnitsForExistingData(): void {
  const units = readUnitsSync()
  const materials = readMaterialsSync()
  const logs = readLogsSync()

  const existingCodes = new Set(units.map((unit) => unit.code))
  const neededCodes = new Set<string>()

  materials.forEach((material) => neededCodes.add(material.unitCode))
  logs.forEach((log) => neededCodes.add(log.unitCode))

  if (!neededCodes.size) return

  const defaults: Record<
    string,
    { name: string; category: MeasurementUnit['category'] }
  > = {
    SC: { name: 'Saco', category: 'Embalagem' },
    KG: { name: 'Quilograma', category: 'Peso' },
    M3: { name: 'Metro cúbico', category: 'Volume' },
    UN: { name: 'Unidade', category: 'Embalagem' },
    VG: { name: 'Viga de concreto', category: 'Outros' },
  }

  const missingUnits = [...neededCodes]
    .filter((code) => !existingCodes.has(code))
    .map((code) => ({
      id: crypto.randomUUID(),
      code,
      name: defaults[code]?.name || code,
      category: defaults[code]?.category || 'Outros',
      createdAt: new Date().toISOString(),
    }))

  if (missingUnits.length) {
    writeUnits([...missingUnits, ...units])
  }
}

function ensureSeedData(): void {
  if (localStorage.getItem(INVENTORY_SEED_MARKER_KEY)) {
    ensureUnitsForExistingData()
    return
  }

  const hasAnyData = [
    localStorage.getItem(INVENTORY_STORAGE_KEYS.units),
    localStorage.getItem(INVENTORY_STORAGE_KEYS.materials),
    localStorage.getItem(INVENTORY_STORAGE_KEYS.logs),
  ].some(Boolean)

  if (hasAnyData) {
    ensureUnitsForExistingData()
    localStorage.setItem(INVENTORY_SEED_MARKER_KEY, 'true')
    return
  }

  const now = new Date().toISOString()
  const units: MeasurementUnit[] = [
    {
      id: crypto.randomUUID(),
      code: 'SC',
      name: 'Saco',
      category: 'Embalagem',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      code: 'UN',
      name: 'Unidade',
      category: 'Embalagem',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      code: 'VG',
      name: 'Viga de concreto',
      category: 'Outros',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      code: 'KG',
      name: 'Quilograma',
      category: 'Peso',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      code: 'M3',
      name: 'Metro cúbico',
      category: 'Volume',
      createdAt: now,
    },

    {
      id: crypto.randomUUID(),
      code: 'LT',
      name: 'Litro',
      category: 'Volume',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      code: 'CX',
      name: 'Caixa',
      category: 'Embalagem',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      code: 'M2',
      name: 'Metro quadrado',
      category: 'Comprimento',
      createdAt: now,
    },
  ]

  const flamboyantCimentoId = crypto.randomUUID()
  const flamboyantBritaId = crypto.randomUUID()
  const flamboyantVergalhaoId = crypto.randomUUID()

  const europaTijoloId = crypto.randomUUID()
  const europaArgamassaId = crypto.randomUUID()
  const europaAreiaId = crypto.randomUUID()

  const moradaVigaId = crypto.randomUUID()
  const moradaCimentoId = crypto.randomUUID()

  const palmeirasPorcelanatoId = crypto.randomUUID()
  const palmeirasTintaId = crypto.randomUUID()

  const internaCaboId = crypto.randomUUID()
  const internaTuboId = crypto.randomUUID()

  const materials: Material[] = [
    {
      id: flamboyantCimentoId,
      name: 'Cimento CP-II',
      projectId: 'Flamboyant II',
      unitCode: 'SC',
      unitLabel: 'SC',
      quantity: 8,
      minQuantityAlert: 20,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: flamboyantBritaId,
      name: 'Brita 1',
      projectId: 'Flamboyant II',
      unitCode: 'M3',
      unitLabel: 'M3',
      quantity: 5,
      minQuantityAlert: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: flamboyantVergalhaoId,
      name: 'Vergalhão CA-50 10mm',
      projectId: 'Flamboyant II',
      unitCode: 'KG',
      unitLabel: 'KG',
      quantity: 120,
      minQuantityAlert: 200,
      createdAt: now,
      updatedAt: now,
    },

    {
      id: europaTijoloId,
      name: 'Tijolo baiano 8 furos',
      projectId: 'Residencial Jardim Europa',
      unitCode: 'UN',
      unitLabel: 'UN',
      quantity: 1500,
      minQuantityAlert: 500,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: europaArgamassaId,
      name: 'Argamassa AC-II',
      projectId: 'Residencial Jardim Europa',
      unitCode: 'SC',
      unitLabel: 'SC',
      quantity: 95,
      minQuantityAlert: 30,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: europaAreiaId,
      name: 'Areia média',
      projectId: 'Residencial Jardim Europa',
      unitCode: 'M3',
      unitLabel: 'M3',
      quantity: 25,
      minQuantityAlert: 8,
      createdAt: now,
      updatedAt: now,
    },

    {
      id: moradaVigaId,
      name: 'Viga pré-moldada 3m',
      projectId: 'Residencial Morada das Flores',
      unitCode: 'VG',
      unitLabel: 'VG',
      quantity: 6,
      minQuantityAlert: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: moradaCimentoId,
      name: 'Cimento CP-II',
      projectId: 'Residencial Morada das Flores',
      unitCode: 'SC',
      unitLabel: 'SC',
      quantity: 14,
      minQuantityAlert: 25,
      createdAt: now,
      updatedAt: now,
    },

    {
      id: palmeirasPorcelanatoId,
      name: 'Porcelanato Polido 60x60',
      projectId: 'Condomínio Alto das Palmeiras',
      unitCode: 'M2',
      unitLabel: 'M2',
      quantity: 45,
      minQuantityAlert: 30,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: palmeirasTintaId,
      name: 'Tinta Acrílica Branca 18L',
      projectId: 'Condomínio Alto das Palmeiras',
      unitCode: 'LT',
      unitLabel: 'LT',
      quantity: 5,
      minQuantityAlert: 10,
      createdAt: now,
      updatedAt: now,
    },

    {
      id: internaCaboId,
      name: 'Cabo Flexível 2.5mm',
      projectId: 'Obra Interna — Reformas',
      unitCode: 'UN',
      unitLabel: 'UN',
      quantity: 2,
      minQuantityAlert: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: internaTuboId,
      name: 'Tubo de Esgoto PVC 100mm',
      projectId: 'Obra Interna — Reformas',
      unitCode: 'UN',
      unitLabel: 'UN',
      quantity: 15,
      minQuantityAlert: 20,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const today = new Date().toISOString().slice(0, 10)

  const logs: ConsumptionLog[] = [
    {
      id: crypto.randomUUID(),
      materialId: flamboyantCimentoId,
      materialName: 'Cimento CP-II',
      quantityUsed: 10,
      unitCode: 'SC',
      unitLabel: 'SC',
      date: today,
      projectId: 'Flamboyant II',
      teamName: 'Pedreiro João',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      materialId: europaTijoloId,
      materialName: 'Tijolo baiano 8 furos',
      quantityUsed: 600,
      unitCode: 'UN',
      unitLabel: 'UN',
      date: today,
      projectId: 'Residencial Jardim Europa',
      teamName: 'Equipe Alvenaria Europa',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      materialId: moradaVigaId,
      materialName: 'Viga pré-moldada 3m',
      quantityUsed: 2,
      unitCode: 'VG',
      unitLabel: 'VG',
      date: today,
      projectId: 'Residencial Morada das Flores',
      teamName: 'Equipe Estrutural Morada',
      createdAt: now,
    },

    {
      id: crypto.randomUUID(),
      materialId: palmeirasPorcelanatoId,
      materialName: 'Porcelanato Polido 60x60',
      quantityUsed: 15,
      unitCode: 'M2',
      unitLabel: 'M2',
      date: today,
      projectId: 'Condomínio Alto das Palmeiras',
      teamName: 'Equipe de Acabamento',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      materialId: internaTuboId,
      materialName: 'Tubo de Esgoto PVC 100mm',
      quantityUsed: 4,
      unitCode: 'UN',
      unitLabel: 'UN',
      date: today,
      projectId: 'Obra Interna — Reformas',
      teamName: 'Encanador Marcos',
      createdAt: now,
    },
  ]

  writeUnits(units)
  writeMaterials(materials)
  writeLogs(logs)
  localStorage.setItem(INVENTORY_SEED_MARKER_KEY, 'true')
}

export function getMeasurementUnits(): Promise<MeasurementUnit[]> {
  ensureSeedData()
  return Promise.resolve(readUnitsSync())
}

export function registerMeasurementUnit(
  input: RegisterMeasurementUnitInput,
): Promise<MeasurementUnit> {
  ensureSeedData()
  const units = readUnitsSync()
  const code = input.code.trim().toUpperCase()

  if (!code || !input.name.trim()) {
    throw new Error('Informe código e nome da unidade.')
  }

  if (units.some((unit) => unit.code === code)) {
    throw new Error('Já existe unidade com este código.')
  }

  const nextUnit: MeasurementUnit = {
    id: crypto.randomUUID(),
    code,
    name: input.name.trim(),
    category: input.category,
    createdAt: new Date().toISOString(),
  }

  writeUnits([nextUnit, ...units])
  return Promise.resolve(nextUnit)
}

export function updateMeasurementUnit(
  unitId: string,
  input: UpdateMeasurementUnitInput,
): Promise<MeasurementUnit> {
  ensureSeedData()
  const units = readUnitsSync()
  const current = units.find((unit) => unit.id === unitId)
  if (!current) throw new Error('Unidade não encontrada.')

  const code = input.code.trim().toUpperCase()
  if (units.some((unit) => unit.id !== unitId && unit.code === code)) {
    throw new Error('Já existe outra unidade com este código.')
  }

  const updated: MeasurementUnit = {
    ...current,
    code,
    name: input.name.trim(),
    category: input.category,
  }

  const nextUnits = units.map((unit) => (unit.id === unitId ? updated : unit))
  writeUnits(nextUnits)

  const materials = readMaterialsSync()
  const nextMaterials = materials.map((material) =>
    material.unitCode === current.code
      ? { ...material, unitCode: updated.code, unitLabel: updated.code }
      : material,
  )
  writeMaterials(nextMaterials)

  const logs = readLogsSync()
  const nextLogs = logs.map((log) =>
    log.unitCode === current.code
      ? { ...log, unitCode: updated.code, unitLabel: updated.code }
      : log,
  )
  writeLogs(nextLogs)

  return Promise.resolve(updated)
}

export function deleteMeasurementUnit(unitId: string): Promise<void> {
  ensureSeedData()
  const units = readUnitsSync()
  const target = units.find((unit) => unit.id === unitId)
  if (!target) return Promise.resolve()

  if (
    readMaterialsSync().some((material) => material.unitCode === target.code)
  ) {
    throw new Error(
      'Não é possível excluir: existe material usando essa unidade.',
    )
  }

  writeUnits(units.filter((unit) => unit.id !== unitId))
  return Promise.resolve()
}

export function getMaterials(): Promise<Material[]> {
  ensureSeedData()
  const units = readUnitsSync()
  return Promise.resolve(
    readMaterialsSync().map((material) => ({
      ...material,
      unitLabel: getUnitLabel(units, material.unitCode),
    })),
  )
}

export function registerMaterial(
  input: RegisterMaterialInput,
): Promise<Material> {
  ensureSeedData()
  const units = readUnitsSync()
  const now = new Date().toISOString()

  const nextMaterial: Material = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    projectId: input.projectId,
    unitCode: input.unitCode,
    unitLabel: getUnitLabel(units, input.unitCode),
    quantity: input.quantity,
    minQuantityAlert: input.minQuantityAlert,
    createdAt: now,
    updatedAt: now,
  }

  writeMaterials([nextMaterial, ...readMaterialsSync()])
  return Promise.resolve(nextMaterial)
}

export function updateMaterial(
  materialId: string,
  input: UpdateMaterialInput,
): Promise<Material> {
  ensureSeedData()
  const units = readUnitsSync()
  const materials = readMaterialsSync()
  const current = materials.find((material) => material.id === materialId)
  if (!current) throw new Error('Material não encontrado.')

  const updated: Material = {
    ...current,
    name: input.name.trim(),
    projectId: input.projectId,
    unitCode: input.unitCode,
    unitLabel: getUnitLabel(units, input.unitCode),
    quantity: input.quantity,
    minQuantityAlert: input.minQuantityAlert,
    updatedAt: new Date().toISOString(),
  }

  writeMaterials(
    materials.map((material) =>
      material.id === materialId ? updated : material,
    ),
  )

  return Promise.resolve(updated)
}

export function deleteMaterial(materialId: string): Promise<void> {
  ensureSeedData()
  writeMaterials(
    readMaterialsSync().filter((material) => material.id !== materialId),
  )
  return Promise.resolve()
}

export function getConsumptionLogs(): Promise<ConsumptionLog[]> {
  ensureSeedData()
  return Promise.resolve(readLogsSync())
}

export function logConsumption(
  input: LogConsumptionInput,
): Promise<{ material: Material; log: ConsumptionLog }> {
  ensureSeedData()
  const materials = readMaterialsSync()
  const target = materials.find((material) => material.id === input.materialId)

  if (!target) throw new Error('Material não encontrado para baixa de estoque.')
  if (target.projectId !== input.projectId)
    throw new Error('Material não pertence à obra selecionada.')
  if (input.quantityUsed <= 0)
    throw new Error('A quantidade consumida deve ser maior que zero.')
  if (!input.teamName.trim()) throw new Error('Informe a equipe/responsável.')
  if (target.quantity < input.quantityUsed)
    throw new Error('Estoque insuficiente para a baixa informada.')

  const nextMaterial: Material = {
    ...target,
    quantity: Number((target.quantity - input.quantityUsed).toFixed(2)),
    updatedAt: new Date().toISOString(),
  }

  writeMaterials(
    materials.map((material) =>
      material.id === target.id ? nextMaterial : material,
    ),
  )

  const nextLog: ConsumptionLog = {
    id: crypto.randomUUID(),
    materialId: target.id,
    materialName: target.name,
    quantityUsed: input.quantityUsed,
    unitCode: target.unitCode,
    unitLabel: target.unitLabel,
    date: input.date,
    projectId: input.projectId,
    teamName: input.teamName.trim(),
    createdAt: new Date().toISOString(),
  }

  writeLogs([nextLog, ...readLogsSync()])

  return Promise.resolve({ material: nextMaterial, log: nextLog })
}

export function getLowStockAlerts(): Promise<LowStockAlert[]> {
  ensureSeedData()
  return Promise.resolve(
    readMaterialsSync()
      .filter((material) => material.quantity <= material.minQuantityAlert)
      .map((material) => ({
        materialId: material.id,
        materialName: material.name,
        projectId: material.projectId,
        quantity: material.quantity,
        minQuantityAlert: material.minQuantityAlert,
        unitLabel: material.unitLabel,
      })),
  )
}

export function getProjectShortageSummary(): Promise<ProjectShortageSummary[]> {
  ensureSeedData()
  const alerts = readMaterialsSync().filter(
    (material) => material.quantity <= material.minQuantityAlert,
  )

  const base = PROJECT_CARDS.map((project) => ({
    projectId: project.id,
    shortageItems: 0,
    criticalItems: 0,
  }))

  alerts.forEach((material) => {
    const found = base.find((item) => item.projectId === material.projectId)
    if (!found) return
    found.shortageItems += 1

    const ratio = material.minQuantityAlert
      ? material.quantity / material.minQuantityAlert
      : 0
    if (ratio <= 0.5) {
      found.criticalItems += 1
    }
  })

  return Promise.resolve(base)
}
