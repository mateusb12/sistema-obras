import { WARNING_WINDOW_DAYS } from './constants'
import type {
  ComplianceSummary,
  ComplianceStatus,
  DocumentRecord,
  Employee,
  EmployeeBase,
  EmployeeComplianceRow,
  EmployeeDocument,
  EmployeeTraining,
  EmployeeVaccine,
  TrainingRecord,
  TrainingStatusGroup,
  VaccineRecord,
} from './types'

const PERSONNEL_SEED_MARKER_KEY = 'cm.personnel.seeded.v2'

const STORAGE_KEYS = {
  employees: 'cm.personnelCompliance.employees.v2',
  documents: 'cm.personnelCompliance.documents.v2',
  trainings: 'cm.personnelCompliance.trainings.v2',
  vaccines: 'cm.personnelCompliance.vaccines.v2',
} as const

const REQUIRED_VACCINES = ['Tétano', 'Hepatite B', 'Febre Amarela'] as const

function addDays(baseDate: Date, days: number): string {
  const next = new Date(baseDate)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

function readArraySync<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeArraySync<T>(key: string, values: T[]): void {
  localStorage.setItem(key, JSON.stringify(values))
}

function evaluateDateStatus(date?: string): ComplianceStatus {
  if (!date) return 'expired'

  const now = new Date()
  const dueDate = new Date(date)
  const diffMs = dueDate.getTime() - now.getTime()
  const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (remainingDays < 0) return 'expired'
  if (remainingDays <= WARNING_WINDOW_DAYS) return 'warning'
  return 'regular'
}

function toEmployeeDocument(record: DocumentRecord): EmployeeDocument {
  return {
    id: record.id,
    type: record.docType,
    issueDate: record.issueDate,
    expiryDate: record.expirationDate,
  }
}

function toEmployeeTraining(record: TrainingRecord): EmployeeTraining {
  return {
    id: record.id,
    code: record.trainingName,
    title: record.trainingName,
    completionDate: record.dateCompleted,
    expiryDate: record.validUntil,
  }
}

function toEmployeeVaccine(record: VaccineRecord): EmployeeVaccine {
  return {
    id: record.id,
    name: record.vaccineName,
    applicationDate: record.dateAdministered,
    expiryDate: record.nextDueDate,
    isRequired: true,
  }
}

function hydrateEmployees(
  employees: EmployeeBase[],
  documents: DocumentRecord[],
  trainings: TrainingRecord[],
  vaccines: VaccineRecord[],
): Employee[] {
  return employees.map((employee) => ({
    ...employee,
    documents: documents
      .filter((record) => record.employeeId === employee.id)
      .map(toEmployeeDocument),
    trainings: trainings
      .filter((record) => record.employeeId === employee.id)
      .map(toEmployeeTraining),
    vaccines: vaccines
      .filter((record) => record.employeeId === employee.id)
      .map(toEmployeeVaccine),
  }))
}

export async function ensureSeedData(): Promise<void> {
  if (localStorage.getItem(PERSONNEL_SEED_MARKER_KEY)) {
    return
  }

  const hasAnyData = [
    localStorage.getItem(STORAGE_KEYS.employees),
    localStorage.getItem(STORAGE_KEYS.documents),
    localStorage.getItem(STORAGE_KEYS.trainings),
    localStorage.getItem(STORAGE_KEYS.vaccines),
  ].some(Boolean)

  if (hasAnyData) {
    localStorage.setItem(PERSONNEL_SEED_MARKER_KEY, 'true')
    return
  }

  const now = new Date()

  const employees: EmployeeBase[] = [
    {
      id: crypto.randomUUID(),
      fullName: 'Marina Alves',
      role: 'Engenheiro Civil',
      projectId: 'Residencial Flamboyant',
      hiredAt: addDays(now, -500),
    },
    {
      id: crypto.randomUUID(),
      fullName: 'João Carlos Mendes',
      role: 'Pedreiro',
      projectId: 'Residencial Flamboyant',
      hiredAt: addDays(now, -380),
    },
    {
      id: crypto.randomUUID(),
      fullName: 'Paulo Henrique Silva',
      role: 'Servente',
      projectId: 'Condomínio Europa',
      hiredAt: addDays(now, -250),
    },
    {
      id: crypto.randomUUID(),
      fullName: 'Luciana Santos Rocha',
      role: 'Carpinteiro',
      projectId: 'Condomínio Europa',
      hiredAt: addDays(now, -320),
    },
    {
      id: crypto.randomUUID(),
      fullName: 'Renata Gomes Costa',
      role: 'Técnico de Segurança',
      projectId: 'Morada das Palmeiras',
      hiredAt: addDays(now, -710),
    },
    {
      id: crypto.randomUUID(),
      fullName: 'Eduardo Martins',
      role: 'Eletricista',
      projectId: 'Morada das Palmeiras',
      hiredAt: addDays(now, -450),
    },
  ]

  const [marina, joao, paulo, luciana, renata, eduardo] = employees

  const documents: DocumentRecord[] = [
    {
      id: crypto.randomUUID(),
      employeeId: marina.id,
      docType: 'ASO',
      issueDate: addDays(now, -120),
      expirationDate: addDays(now, 220),
    },
    {
      id: crypto.randomUUID(),
      employeeId: marina.id,
      docType: 'Ficha de EPI',
      issueDate: addDays(now, -90),
      expirationDate: addDays(now, 275),
    },
    {
      id: crypto.randomUUID(),
      employeeId: joao.id,
      docType: 'ASO',
      issueDate: addDays(now, -140),
      expirationDate: addDays(now, 120),
    },
    {
      id: crypto.randomUUID(),
      employeeId: joao.id,
      docType: 'Ficha de EPI',
      issueDate: addDays(now, -170),
      expirationDate: addDays(now, 95),
    },
    {
      id: crypto.randomUUID(),
      employeeId: paulo.id,
      docType: 'ASO',
      issueDate: addDays(now, -355),
      expirationDate: addDays(now, 10),
    },
    {
      id: crypto.randomUUID(),
      employeeId: paulo.id,
      docType: 'Ficha de EPI',
      issueDate: addDays(now, -50),
      expirationDate: addDays(now, 150),
    },
    {
      id: crypto.randomUUID(),
      employeeId: luciana.id,
      docType: 'ASO',
      issueDate: addDays(now, -40),
      expirationDate: addDays(now, 330),
    },
    {
      id: crypto.randomUUID(),
      employeeId: renata.id,
      docType: 'ASO',
      issueDate: addDays(now, -100),
      expirationDate: addDays(now, 265),
    },
    {
      id: crypto.randomUUID(),
      employeeId: eduardo.id,
      docType: 'ASO',
      issueDate: addDays(now, -150),
      expirationDate: addDays(now, 180),
    },
  ]

  const trainings: TrainingRecord[] = [
    {
      id: crypto.randomUUID(),
      employeeId: marina.id,
      trainingName: 'NR-18',
      dateCompleted: addDays(now, -80),
      validUntil: addDays(now, 285),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: marina.id,
      trainingName: 'NR-35',
      dateCompleted: addDays(now, -60),
      validUntil: addDays(now, 150),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: joao.id,
      trainingName: 'NR-35',
      dateCompleted: addDays(now, -370),
      validUntil: addDays(now, -5),
      status: 'expired',
    },
    {
      id: crypto.randomUUID(),
      employeeId: joao.id,
      trainingName: 'NR-18',
      dateCompleted: addDays(now, -70),
      validUntil: addDays(now, 270),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: paulo.id,
      trainingName: 'NR-18',
      dateCompleted: addDays(now, -110),
      validUntil: addDays(now, 255),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: paulo.id,
      trainingName: 'NR-06',
      dateCompleted: addDays(now, -340),
      validUntil: addDays(now, 20),
      status: 'warning',
    },
    {
      id: crypto.randomUUID(),
      employeeId: luciana.id,
      trainingName: 'NR-18',
      dateCompleted: addDays(now, -100),
      validUntil: addDays(now, 260),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: luciana.id,
      trainingName: 'NR-35',
      dateCompleted: addDays(now, -280),
      validUntil: addDays(now, 14),
      status: 'warning',
    },
    {
      id: crypto.randomUUID(),
      employeeId: renata.id,
      trainingName: 'NR-35',
      dateCompleted: addDays(now, -330),
      validUntil: addDays(now, 30),
      status: 'warning',
    },
    {
      id: crypto.randomUUID(),
      employeeId: renata.id,
      trainingName: 'NR-06',
      dateCompleted: addDays(now, -120),
      validUntil: addDays(now, 245),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: renata.id,
      trainingName: 'NR-18',
      dateCompleted: addDays(now, -160),
      validUntil: addDays(now, 200),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: eduardo.id,
      trainingName: 'NR-10',
      dateCompleted: addDays(now, -340),
      validUntil: addDays(now, 20),
      status: 'warning',
    },
    {
      id: crypto.randomUUID(),
      employeeId: eduardo.id,
      trainingName: 'NR-35',
      dateCompleted: addDays(now, -210),
      validUntil: addDays(now, 120),
      status: 'regular',
    },
    {
      id: crypto.randomUUID(),
      employeeId: eduardo.id,
      trainingName: 'NR-18',
      dateCompleted: addDays(now, -390),
      validUntil: addDays(now, -18),
      status: 'expired',
    },
  ]

  const vaccines: VaccineRecord[] = [
    {
      id: crypto.randomUUID(),
      employeeId: marina.id,
      vaccineName: 'Tétano',
      doseInfo: 'Reforço',
      dateAdministered: addDays(now, -300),
      nextDueDate: addDays(now, 430),
    },
    {
      id: crypto.randomUUID(),
      employeeId: marina.id,
      vaccineName: 'Hepatite B',
      doseInfo: '3ª dose',
      dateAdministered: addDays(now, -450),
      nextDueDate: addDays(now, 200),
    },
    {
      id: crypto.randomUUID(),
      employeeId: marina.id,
      vaccineName: 'Febre Amarela',
      doseInfo: 'Dose única',
      dateAdministered: addDays(now, -600),
      nextDueDate: addDays(now, 500),
    },
    {
      id: crypto.randomUUID(),
      employeeId: joao.id,
      vaccineName: 'Tétano',
      doseInfo: 'Reforço',
      dateAdministered: addDays(now, -200),
      nextDueDate: addDays(now, 330),
    },
    {
      id: crypto.randomUUID(),
      employeeId: joao.id,
      vaccineName: 'Hepatite B',
      doseInfo: '2ª dose',
      dateAdministered: addDays(now, -220),
      nextDueDate: addDays(now, 40),
    },
    {
      id: crypto.randomUUID(),
      employeeId: joao.id,
      vaccineName: 'Febre Amarela',
      doseInfo: 'Dose única',
      dateAdministered: addDays(now, -740),
      nextDueDate: addDays(now, -10),
    },
    {
      id: crypto.randomUUID(),
      employeeId: paulo.id,
      vaccineName: 'Tétano',
      doseInfo: 'Reforço',
      dateAdministered: addDays(now, -130),
      nextDueDate: addDays(now, 500),
    },
    {
      id: crypto.randomUUID(),
      employeeId: paulo.id,
      vaccineName: 'Hepatite B',
      doseInfo: '3ª dose',
      dateAdministered: addDays(now, -200),
      nextDueDate: addDays(now, 80),
    },
    {
      id: crypto.randomUUID(),
      employeeId: paulo.id,
      vaccineName: 'Febre Amarela',
      doseInfo: 'Dose única',
      dateAdministered: addDays(now, -800),
      nextDueDate: addDays(now, 35),
    },
    {
      id: crypto.randomUUID(),
      employeeId: luciana.id,
      vaccineName: 'Tétano',
      doseInfo: 'Sem registro',
    },
    {
      id: crypto.randomUUID(),
      employeeId: luciana.id,
      vaccineName: 'Hepatite B',
      doseInfo: '3ª dose',
      dateAdministered: addDays(now, -160),
      nextDueDate: addDays(now, 210),
    },
    {
      id: crypto.randomUUID(),
      employeeId: luciana.id,
      vaccineName: 'Febre Amarela',
      doseInfo: 'Dose única',
      dateAdministered: addDays(now, -350),
      nextDueDate: addDays(now, 120),
    },
    {
      id: crypto.randomUUID(),
      employeeId: renata.id,
      vaccineName: 'Tétano',
      doseInfo: 'Reforço',
      dateAdministered: addDays(now, -550),
      nextDueDate: addDays(now, 95),
    },
    {
      id: crypto.randomUUID(),
      employeeId: renata.id,
      vaccineName: 'Hepatite B',
      doseInfo: '3ª dose',
      dateAdministered: addDays(now, -620),
      nextDueDate: addDays(now, 300),
    },
    {
      id: crypto.randomUUID(),
      employeeId: renata.id,
      vaccineName: 'Febre Amarela',
      doseInfo: 'Dose única',
      dateAdministered: addDays(now, -1200),
      nextDueDate: addDays(now, -20),
    },
    {
      id: crypto.randomUUID(),
      employeeId: eduardo.id,
      vaccineName: 'Tétano',
      doseInfo: 'Reforço',
      dateAdministered: addDays(now, -330),
      nextDueDate: addDays(now, 30),
    },
    {
      id: crypto.randomUUID(),
      employeeId: eduardo.id,
      vaccineName: 'Hepatite B',
      doseInfo: '3ª dose',
      dateAdministered: addDays(now, -390),
      nextDueDate: addDays(now, 170),
    },
    {
      id: crypto.randomUUID(),
      employeeId: eduardo.id,
      vaccineName: 'Febre Amarela',
      doseInfo: 'Dose única',
      dateAdministered: addDays(now, -700),
      nextDueDate: addDays(now, 20),
    },
  ]

  writeArraySync(STORAGE_KEYS.employees, employees)
  writeArraySync(STORAGE_KEYS.documents, documents)
  writeArraySync(STORAGE_KEYS.trainings, trainings)
  writeArraySync(STORAGE_KEYS.vaccines, vaccines)
  localStorage.setItem(PERSONNEL_SEED_MARKER_KEY, 'true')
}

async function getEmployeesBase(): Promise<EmployeeBase[]> {
  await ensureSeedData()
  return readArraySync<EmployeeBase>(STORAGE_KEYS.employees)
}

async function getDocuments(): Promise<DocumentRecord[]> {
  await ensureSeedData()
  return readArraySync<DocumentRecord>(STORAGE_KEYS.documents)
}

export async function getAllTrainingRecords(): Promise<TrainingRecord[]> {
  await ensureSeedData()
  return readArraySync<TrainingRecord>(STORAGE_KEYS.trainings).map(
    (record) => ({
      ...record,
      status: evaluateDateStatus(record.validUntil),
    }),
  )
}

export async function getAllVaccineRecords(): Promise<VaccineRecord[]> {
  await ensureSeedData()
  return readArraySync<VaccineRecord>(STORAGE_KEYS.vaccines)
}

export async function getEmployees(): Promise<Employee[]> {
  const [employees, documents, trainings, vaccines] = await Promise.all([
    getEmployeesBase(),
    getDocuments(),
    getAllTrainingRecords(),
    getAllVaccineRecords(),
  ])

  return hydrateEmployees(employees, documents, trainings, vaccines)
}

export async function getEmployeeById(
  id: string,
): Promise<Employee | undefined> {
  const employees = await getEmployees()
  return employees.find((employee) => employee.id === id)
}

export async function getEmployeeTrainings(
  employeeId: string,
): Promise<TrainingRecord[]> {
  const records = await getAllTrainingRecords()
  return records.filter((record) => record.employeeId === employeeId)
}

export async function getEmployeeVaccines(
  employeeId: string,
): Promise<VaccineRecord[]> {
  const records = await getAllVaccineRecords()
  return records.filter((record) => record.employeeId === employeeId)
}

export async function getEmployeeDocuments(
  employeeId: string,
): Promise<DocumentRecord[]> {
  const records = await getDocuments()
  return records.filter((record) => record.employeeId === employeeId)
}

export async function createEmployee(input: Employee): Promise<Employee> {
  const employees = await getEmployeesBase()

  const createdEmployee: EmployeeBase = {
    id: input.id || crypto.randomUUID(),
    fullName: input.fullName,
    role: input.role,
    projectId: input.projectId,
    hiredAt: input.hiredAt,
  }

  writeArraySync(STORAGE_KEYS.employees, [...employees, createdEmployee])

  const createdDocuments: DocumentRecord[] = input.documents.map(
    (document) => ({
      id: document.id || crypto.randomUUID(),
      employeeId: createdEmployee.id,
      docType: document.type,
      issueDate: document.issueDate,
      expirationDate: document.expiryDate,
    }),
  )

  const createdTrainings: TrainingRecord[] = input.trainings.map(
    (training) => ({
      id: training.id || crypto.randomUUID(),
      employeeId: createdEmployee.id,
      trainingName: training.code,
      dateCompleted: training.completionDate,
      validUntil: training.expiryDate,
      status: evaluateDateStatus(training.expiryDate),
    }),
  )

  const createdVaccines: VaccineRecord[] = input.vaccines.map((vaccine) => ({
    id: vaccine.id || crypto.randomUUID(),
    employeeId: createdEmployee.id,
    vaccineName: vaccine.name,
    doseInfo: 'Registro manual',
    dateAdministered: vaccine.applicationDate,
    nextDueDate: vaccine.expiryDate,
  }))

  writeArraySync(STORAGE_KEYS.documents, [
    ...(await getDocuments()),
    ...createdDocuments,
  ])
  writeArraySync(STORAGE_KEYS.trainings, [
    ...(await getAllTrainingRecords()),
    ...createdTrainings,
  ])
  writeArraySync(STORAGE_KEYS.vaccines, [
    ...(await getAllVaccineRecords()),
    ...createdVaccines,
  ])

  const fullEmployee = await getEmployeeById(createdEmployee.id)
  return fullEmployee as Employee
}

export async function updateEmployee(
  id: string,
  input: Partial<Employee>,
): Promise<Employee | null> {
  const employees = await getEmployeesBase()
  const current = employees.find((employee) => employee.id === id)

  if (!current) {
    return null
  }

  const updated: EmployeeBase = {
    ...current,
    fullName: input.fullName ?? current.fullName,
    role: input.role ?? current.role,
    projectId: input.projectId ?? current.projectId,
    hiredAt: input.hiredAt ?? current.hiredAt,
    id,
  }

  writeArraySync(
    STORAGE_KEYS.employees,
    employees.map((employee) => (employee.id === id ? updated : employee)),
  )

  const fullEmployee = await getEmployeeById(id)
  return fullEmployee ?? null
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await getEmployeesBase()
  const filteredEmployees = employees.filter((employee) => employee.id !== id)

  if (filteredEmployees.length === employees.length) {
    return false
  }

  writeArraySync(STORAGE_KEYS.employees, filteredEmployees)
  writeArraySync(
    STORAGE_KEYS.documents,
    (await getDocuments()).filter((record) => record.employeeId !== id),
  )
  writeArraySync(
    STORAGE_KEYS.trainings,
    (await getAllTrainingRecords()).filter(
      (record) => record.employeeId !== id,
    ),
  )
  writeArraySync(
    STORAGE_KEYS.vaccines,
    (await getAllVaccineRecords()).filter((record) => record.employeeId !== id),
  )

  return true
}

export async function registerVaccine(
  input: Omit<VaccineRecord, 'id'>,
): Promise<VaccineRecord> {
  const records = await getAllVaccineRecords()
  const created: VaccineRecord = { ...input, id: crypto.randomUUID() }
  writeArraySync(STORAGE_KEYS.vaccines, [...records, created])
  return created
}

export async function registerTraining(
  input: Omit<TrainingRecord, 'id' | 'status'>,
): Promise<TrainingRecord> {
  const records = await getAllTrainingRecords()
  const created: TrainingRecord = {
    ...input,
    id: crypto.randomUUID(),
    status: evaluateDateStatus(input.validUntil),
  }

  writeArraySync(STORAGE_KEYS.trainings, [...records, created])
  return created
}

export async function registerDocument(
  input: Omit<DocumentRecord, 'id'>,
): Promise<DocumentRecord> {
  const records = await getDocuments()
  const created: DocumentRecord = { ...input, id: crypto.randomUUID() }
  writeArraySync(STORAGE_KEYS.documents, [...records, created])
  return created
}

export async function getAllTrainingsStatus(): Promise<TrainingStatusGroup[]> {
  const records = await getAllTrainingRecords()
  const byName = new Map<string, TrainingStatusGroup>()

  records.forEach((record) => {
    const group = byName.get(record.trainingName) || {
      trainingName: record.trainingName,
      regular: [],
      warning: [],
      expired: [],
    }

    const status = evaluateDateStatus(record.validUntil)
    if (status === 'regular') group.regular.push({ ...record, status })
    if (status === 'warning') group.warning.push({ ...record, status })
    if (status === 'expired') group.expired.push({ ...record, status })

    byName.set(record.trainingName, group)
  })

  return [...byName.values()].sort((a, b) =>
    a.trainingName.localeCompare(b.trainingName),
  )
}

export async function getEmployeeComplianceRow(
  employee: Employee,
): Promise<EmployeeComplianceRow> {
  const expiredItems: string[] = []
  const warningItems: string[] = []

  employee.documents.forEach((document) => {
    const status = evaluateDateStatus(document.expiryDate)
    if (status === 'expired')
      expiredItems.push(`Documento ${document.type} vencido`)
    if (status === 'warning')
      warningItems.push(`Documento ${document.type} vence em breve`)
  })

  employee.trainings.forEach((training) => {
    const status = evaluateDateStatus(training.expiryDate)
    if (status === 'expired') {
      expiredItems.push(`Treinamento ${training.code} vencido`)
    }
    if (status === 'warning') {
      warningItems.push(`Treinamento ${training.code} vence em breve`)
    }
  })

  const vaccineByName = new Map(
    employee.vaccines.map((record) => [record.name, record]),
  )

  REQUIRED_VACCINES.forEach((vaccineName) => {
    const vaccine = vaccineByName.get(vaccineName)
    if (!vaccine) {
      expiredItems.push(`Vacina ${vaccineName} sem registro`)
      return
    }

    const status = evaluateDateStatus(vaccine.expiryDate)
    if (!vaccine.applicationDate || status === 'expired') {
      expiredItems.push(`Vacina ${vaccineName} pendente/vencida`)
      return
    }

    if (status === 'warning') {
      warningItems.push(`Vacina ${vaccineName} vence em breve`)
    }
  })

  const status: ComplianceStatus = expiredItems.length
    ? 'expired'
    : warningItems.length
      ? 'warning'
      : 'regular'

  return {
    employee,
    status,
    expiredItems,
    warningItems,
  }
}

export async function getComplianceRows(): Promise<EmployeeComplianceRow[]> {
  const employees = await getEmployees()
  return Promise.all(
    employees.map((employee) => getEmployeeComplianceRow(employee)),
  )
}

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  const rows = await getComplianceRows()

  return {
    totalEmployees: rows.length,
    criticalPending: rows.filter((row) => row.status === 'expired').length,
    upcomingDue: rows.filter((row) => row.status === 'warning').length,
  }
}

export async function getCriticalAlerts(): Promise<EmployeeComplianceRow[]> {
  const rows = await getComplianceRows()
  return rows.filter((row) => row.status === 'expired')
}

export async function getUpcomingAlerts(): Promise<EmployeeComplianceRow[]> {
  const rows = await getComplianceRows()
  return rows.filter((row) => row.status === 'warning')
}
