import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { navigateTo, APP_ROUTES } from '../../routes/router'
import {
  COMPLIANCE_STATUS_BADGES,
  COMPLIANCE_STATUS_LABELS,
  NR_TRAINING_OPTIONS,
} from './constants'
import {
  PERSONNEL_COMPLIANCE_UPDATED_EVENT,
  deleteDocument,
  deleteTraining,
  deleteVaccine,
  getComplianceStatusByDate,
  getEmployeeById,
  getEmployeeDocuments,
  getEmployeeTrainings,
  getEmployeeVaccines,
  registerDocument,
  registerTraining,
  registerVaccine,
  updateDocument,
  updateTraining,
  updateVaccine,
} from './complianceService'
import type {
  DocumentRecord,
  Employee,
  TrainingRecord,
  VaccineRecord,
} from './types'

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white'

type Section = 'documents' | 'trainings' | 'vaccines'

export function EmployeeDetails({ employeeId }: { employeeId: string }) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [trainings, setTrainings] = useState<TrainingRecord[]>([])
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([])
  const [activeSection, setActiveSection] = useState<Section>('documents')
  const [feedback, setFeedback] = useState('')

  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(
    null,
  )
  const [editingTraining, setEditingTraining] = useState<TrainingRecord | null>(
    null,
  )
  const [editingVaccine, setEditingVaccine] = useState<VaccineRecord | null>(
    null,
  )

  const [docForm, setDocForm] = useState<{
    docType: string
    issueDate: string
    expirationDate: string
  }>({ docType: 'ASO', issueDate: '', expirationDate: '' })
  const [trainingForm, setTrainingForm] = useState<{
    trainingName: string
    dateCompleted: string
    validUntil: string
  }>({
    trainingName: NR_TRAINING_OPTIONS[0],
    dateCompleted: '',
    validUntil: '',
  })
  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: 'Tétano',
    doseInfo: 'Registro manual',
    dateAdministered: '',
    nextDueDate: '',
  })

  const [openModal, setOpenModal] = useState<Section | null>(null)

  const load = useCallback(async () => {
    const [emp, docs, trs, vacs] = await Promise.all([
      getEmployeeById(employeeId),
      getEmployeeDocuments(employeeId),
      getEmployeeTrainings(employeeId),
      getEmployeeVaccines(employeeId),
    ])

    if (!emp) {
      setEmployee(null)
      return
    }

    setEmployee(emp)
    setDocuments(docs)
    setTrainings(trs)
    setVaccines(vacs)
  }, [employeeId])

  useEffect(() => {
    const reload = () => {
      void load()
    }

    const timer = window.setTimeout(reload, 0)
    window.addEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, reload)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, reload)
    }
  }, [employeeId, load])

  if (!employee) {
    return (
      <section className="space-y-4">
        <button
          type="button"
          className="text-sm text-blue-600"
          onClick={() => navigateTo(APP_ROUTES.PERSONNEL_LIST)}
        >
          Voltar
        </button>
        <p className="rounded-md border border-yellow-400/60 bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
          Funcionário não encontrado.
        </p>
      </section>
    )
  }

  const clearModals = () => {
    setOpenModal(null)
    setEditingDocument(null)
    setEditingTraining(null)
    setEditingVaccine(null)
  }

  const saveDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!docForm.docType || !docForm.issueDate || !docForm.expirationDate)
      return

    if (editingDocument) {
      await updateDocument(editingDocument.id, docForm)
      setFeedback('Documento atualizado com sucesso.')
    } else {
      await registerDocument({ ...docForm, employeeId })
      setFeedback('Documento registrado com sucesso.')
    }
    clearModals()
    await load()
  }

  const saveTraining = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !trainingForm.trainingName ||
      !trainingForm.dateCompleted ||
      !trainingForm.validUntil
    )
      return

    if (editingTraining) {
      await updateTraining(editingTraining.id, trainingForm)
      setFeedback('Treinamento atualizado com sucesso.')
    } else {
      await registerTraining({ ...trainingForm, employeeId })
      setFeedback('Treinamento registrado com sucesso.')
    }
    clearModals()
    await load()
  }

  const saveVaccine = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!vaccineForm.vaccineName) return

    if (editingVaccine) {
      await updateVaccine(editingVaccine.id, vaccineForm)
      setFeedback('Vacina atualizada com sucesso.')
    } else {
      await registerVaccine({ ...vaccineForm, employeeId })
      setFeedback('Vacina registrada com sucesso.')
    }
    clearModals()
    await load()
  }

  return (
    <section className="space-y-6">
      <button
        type="button"
        className="text-sm text-blue-600"
        onClick={() => navigateTo(APP_ROUTES.PERSONNEL_LIST)}
      >
        ← Voltar para lista
      </button>

      <header className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {employee.fullName}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {employee.role} • {employee.projectId}
        </p>
      </header>

      {feedback && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-700/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          {feedback}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('documents')}
          className={`rounded-md px-3 py-2 text-sm ${activeSection === 'documents' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          Documentos
        </button>
        <button
          onClick={() => setActiveSection('trainings')}
          className={`rounded-md px-3 py-2 text-sm ${activeSection === 'trainings' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          Treinamentos
        </button>
        <button
          onClick={() => setActiveSection('vaccines')}
          className={`rounded-md px-3 py-2 text-sm ${activeSection === 'vaccines' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          Vacinas
        </button>
      </div>

      {activeSection === 'documents' && (
        <article className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white"
            onClick={() => setOpenModal('documents')}
          >
            <Plus size={14} />
            Adicionar Documento
          </button>
          {documents.map((doc) => {
            const status = getComplianceStatusByDate(doc.expirationDate)
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {doc.docType}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Validade:{' '}
                    {new Date(doc.expirationDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${COMPLIANCE_STATUS_BADGES[status]}`}
                  >
                    {COMPLIANCE_STATUS_LABELS[status]}
                  </span>
                  <button
                    className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setEditingDocument(doc)
                      setDocForm({
                        docType: doc.docType,
                        issueDate: doc.issueDate.slice(0, 10),
                        expirationDate: doc.expirationDate.slice(0, 10),
                      })
                      setOpenModal('documents')
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="rounded-md border border-red-300 p-1.5 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      await deleteDocument(doc.id)
                      setFeedback('Documento removido.')
                      await load()
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </article>
      )}

      {activeSection === 'trainings' && (
        <article className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white"
            onClick={() => setOpenModal('trainings')}
          >
            <Plus size={14} />
            Adicionar Treinamento
          </button>
          {trainings.map((training) => {
            const status = getComplianceStatusByDate(training.validUntil)
            return (
              <div
                key={training.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {training.trainingName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Validade:{' '}
                    {new Date(training.validUntil).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${COMPLIANCE_STATUS_BADGES[status]}`}
                  >
                    {COMPLIANCE_STATUS_LABELS[status]}
                  </span>
                  <button
                    className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setEditingTraining(training)
                      setTrainingForm({
                        trainingName: training.trainingName,
                        dateCompleted: training.dateCompleted.slice(0, 10),
                        validUntil: training.validUntil.slice(0, 10),
                      })
                      setOpenModal('trainings')
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="rounded-md border border-red-300 p-1.5 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      await deleteTraining(training.id)
                      setFeedback('Treinamento removido.')
                      await load()
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </article>
      )}

      {activeSection === 'vaccines' && (
        <article className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white"
            onClick={() => setOpenModal('vaccines')}
          >
            <Plus size={14} />
            Adicionar Vacina
          </button>
          {vaccines.map((vaccine) => {
            const status = getComplianceStatusByDate(vaccine.nextDueDate)
            return (
              <div
                key={vaccine.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {vaccine.vaccineName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Validade:{' '}
                    {vaccine.nextDueDate
                      ? new Date(vaccine.nextDueDate).toLocaleDateString(
                          'pt-BR',
                        )
                      : 'Não informada'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${COMPLIANCE_STATUS_BADGES[status]}`}
                  >
                    {COMPLIANCE_STATUS_LABELS[status]}
                  </span>
                  <button
                    className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setEditingVaccine(vaccine)
                      setVaccineForm({
                        vaccineName: vaccine.vaccineName,
                        doseInfo: vaccine.doseInfo,
                        dateAdministered:
                          vaccine.dateAdministered?.slice(0, 10) || '',
                        nextDueDate: vaccine.nextDueDate?.slice(0, 10) || '',
                      })
                      setOpenModal('vaccines')
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="rounded-md border border-red-300 p-1.5 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      await deleteVaccine(vaccine.id)
                      setFeedback('Vacina removida.')
                      await load()
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </article>
      )}

      {openModal === 'documents' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={saveDocument}
            className="w-full max-w-lg space-y-3 rounded-xl bg-white p-6 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingDocument ? 'Editar documento' : 'Novo documento'}
            </h3>
            <input
              className={INPUT_CLASS}
              value={docForm.docType}
              onChange={(e) =>
                setDocForm((p) => ({ ...p, docType: e.target.value }))
              }
              placeholder="Tipo"
            />
            <input
              type="date"
              className={INPUT_CLASS}
              value={docForm.issueDate}
              onChange={(e) =>
                setDocForm((p) => ({ ...p, issueDate: e.target.value }))
              }
            />
            <input
              type="date"
              className={INPUT_CLASS}
              value={docForm.expirationDate}
              onChange={(e) =>
                setDocForm((p) => ({ ...p, expirationDate: e.target.value }))
              }
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={clearModals}
                className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-2 text-white"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {openModal === 'trainings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={saveTraining}
            className="w-full max-w-lg space-y-3 rounded-xl bg-white p-6 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingTraining ? 'Editar treinamento' : 'Novo treinamento'}
            </h3>
            <select
              className={INPUT_CLASS}
              value={trainingForm.trainingName}
              onChange={(e) =>
                setTrainingForm((p) => ({ ...p, trainingName: e.target.value }))
              }
            >
              {NR_TRAINING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="date"
              className={INPUT_CLASS}
              value={trainingForm.dateCompleted}
              onChange={(e) =>
                setTrainingForm((p) => ({
                  ...p,
                  dateCompleted: e.target.value,
                }))
              }
            />
            <input
              type="date"
              className={INPUT_CLASS}
              value={trainingForm.validUntil}
              onChange={(e) =>
                setTrainingForm((p) => ({ ...p, validUntil: e.target.value }))
              }
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={clearModals}
                className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-2 text-white"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {openModal === 'vaccines' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={saveVaccine}
            className="w-full max-w-lg space-y-3 rounded-xl bg-white p-6 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingVaccine ? 'Editar vacina' : 'Nova vacina'}
            </h3>
            <input
              className={INPUT_CLASS}
              value={vaccineForm.vaccineName}
              onChange={(e) =>
                setVaccineForm((p) => ({ ...p, vaccineName: e.target.value }))
              }
              placeholder="Nome da vacina"
            />
            <input
              className={INPUT_CLASS}
              value={vaccineForm.doseInfo}
              onChange={(e) =>
                setVaccineForm((p) => ({ ...p, doseInfo: e.target.value }))
              }
              placeholder="Dose"
            />
            <input
              type="date"
              className={INPUT_CLASS}
              value={vaccineForm.dateAdministered}
              onChange={(e) =>
                setVaccineForm((p) => ({
                  ...p,
                  dateAdministered: e.target.value,
                }))
              }
            />
            <input
              type="date"
              className={INPUT_CLASS}
              value={vaccineForm.nextDueDate}
              onChange={(e) =>
                setVaccineForm((p) => ({ ...p, nextDueDate: e.target.value }))
              }
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={clearModals}
                className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-2 text-white"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
