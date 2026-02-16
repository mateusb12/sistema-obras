import { Eye, Paperclip, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { navigateTo, APP_ROUTES } from '../../routes/router'
import {
  COMPLIANCE_STATUS_BADGES,
  COMPLIANCE_STATUS_LABELS,
  NR_TRAINING_OPTIONS,
} from './constants'
import {
  PERSONNEL_COMPLIANCE_UPDATED_EVENT,
  convertFileToBase64,
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
import { DocumentModal } from './components/DocumentModal'
import type {
  Attachment,
  DocumentRecord,
  Employee,
  TrainingRecord,
  VaccineRecord,
  ValidationStatus,
} from './types'

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white'

const VALIDATION_BADGES: Record<ValidationStatus, string> = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  approved:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

type Section = 'documents' | 'trainings' | 'vaccines'

type EvidenceForm = {
  validationStatus: ValidationStatus
  validationFeedback: string
  file: File | null
  attachment?: Attachment
}

const emptyEvidenceForm: EvidenceForm = {
  validationStatus: 'pending',
  validationFeedback: '',
  file: null,
  attachment: undefined,
}

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

  const [docForm, setDocForm] = useState({
    docType: 'ASO',
    issueDate: '',
    expirationDate: '',
    ...emptyEvidenceForm,
  })
  const [trainingForm, setTrainingForm] = useState({
    trainingName: NR_TRAINING_OPTIONS[0] as string,
    dateCompleted: '',
    validUntil: '',
    ...emptyEvidenceForm,
  })
  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: 'Tétano',
    doseInfo: 'Registro manual',
    dateAdministered: '',
    nextDueDate: '',
    ...emptyEvidenceForm,
  })

  const [openModal, setOpenModal] = useState<Section | null>(null)
  const [viewerAttachment, setViewerAttachment] = useState<Attachment | null>(
    null,
  )
  const [viewerTitle, setViewerTitle] = useState('')

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
    setDocForm({
      docType: 'ASO',
      issueDate: '',
      expirationDate: '',
      ...emptyEvidenceForm,
    })
    setTrainingForm({
      trainingName: NR_TRAINING_OPTIONS[0] as string,
      dateCompleted: '',
      validUntil: '',
      ...emptyEvidenceForm,
    })
    setVaccineForm({
      vaccineName: 'Tétano',
      doseInfo: 'Registro manual',
      dateAdministered: '',
      nextDueDate: '',
      ...emptyEvidenceForm,
    })
  }

  const buildAttachment = async (file: File | null, current?: Attachment) => {
    if (!file) return current
    const base64 = await convertFileToBase64(file)
    return {
      fileName: file.name,
      fileType: file.type,
      base64,
      size: file.size,
    }
  }

  const saveDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!docForm.docType || !docForm.issueDate || !docForm.expirationDate)
      return

    try {
      const attachment = await buildAttachment(docForm.file, docForm.attachment)
      const payload = {
        employeeId,
        docType: docForm.docType,
        issueDate: docForm.issueDate,
        expirationDate: docForm.expirationDate,
        attachment,
        validationStatus: docForm.validationStatus,
        validationFeedback:
          docForm.validationStatus === 'rejected'
            ? docForm.validationFeedback || undefined
            : undefined,
      }

      if (editingDocument) {
        await updateDocument(editingDocument.id, payload)
        setFeedback('Documento atualizado com sucesso.')
      } else {
        await registerDocument(payload)
        setFeedback('Documento registrado com sucesso.')
      }

      clearModals()
      await load()
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o documento.',
      )
    }
  }

  const saveTraining = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !trainingForm.trainingName ||
      !trainingForm.dateCompleted ||
      !trainingForm.validUntil
    )
      return

    try {
      const attachment = await buildAttachment(
        trainingForm.file,
        trainingForm.attachment,
      )
      const payload = {
        employeeId,
        trainingName: trainingForm.trainingName,
        dateCompleted: trainingForm.dateCompleted,
        validUntil: trainingForm.validUntil,
        attachment,
        validationStatus: trainingForm.validationStatus,
        validationFeedback:
          trainingForm.validationStatus === 'rejected'
            ? trainingForm.validationFeedback || undefined
            : undefined,
      }

      if (editingTraining) {
        await updateTraining(editingTraining.id, payload)
        setFeedback('Treinamento atualizado com sucesso.')
      } else {
        await registerTraining(payload)
        setFeedback('Treinamento registrado com sucesso.')
      }

      clearModals()
      await load()
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o treinamento.',
      )
    }
  }

  const saveVaccine = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!vaccineForm.vaccineName) return

    try {
      const attachment = await buildAttachment(
        vaccineForm.file,
        vaccineForm.attachment,
      )
      const payload = {
        employeeId,
        vaccineName: vaccineForm.vaccineName,
        doseInfo: vaccineForm.doseInfo,
        dateAdministered: vaccineForm.dateAdministered || undefined,
        nextDueDate: vaccineForm.nextDueDate || undefined,
        attachment,
        validationStatus: vaccineForm.validationStatus,
        validationFeedback:
          vaccineForm.validationStatus === 'rejected'
            ? vaccineForm.validationFeedback || undefined
            : undefined,
      }

      if (editingVaccine) {
        await updateVaccine(editingVaccine.id, payload)
        setFeedback('Vacina atualizada com sucesso.')
      } else {
        await registerVaccine(payload)
        setFeedback('Vacina registrada com sucesso.')
      }

      clearModals()
      await load()
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a vacina.',
      )
    }
  }

  const openViewer = (attachment: Attachment, title: string) => {
    setViewerAttachment(attachment)
    setViewerTitle(title)
  }

  const FileMeta = ({ attachment }: { attachment?: Attachment }) =>
    attachment ? (
      <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
        <Paperclip size={12} />
        {attachment.fileName}
      </div>
    ) : null

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
        <p className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-200">
          {feedback}
        </p>
      )}

      <nav className="flex flex-wrap gap-2">
        {(
          [
            ['documents', 'Documentos'],
            ['trainings', 'Treinamentos'],
            ['vaccines', 'Vacinas'],
          ] as const
        ).map(([section, label]) => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              activeSection === section
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeSection === 'documents' && (
        <article className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white"
            onClick={() => setOpenModal('documents')}
          >
            <Plus size={14} />
            Adicionar Documento
          </button>
          {documents.map((document) => {
            const status = getComplianceStatusByDate(document.expirationDate)
            return (
              <div
                key={document.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {document.docType}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vence em:{' '}
                    {new Date(document.expirationDate).toLocaleDateString(
                      'pt-BR',
                    )}
                  </p>
                  <FileMeta attachment={document.attachment} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${COMPLIANCE_STATUS_BADGES[status]}`}
                  >
                    {COMPLIANCE_STATUS_LABELS[status]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${VALIDATION_BADGES[document.validationStatus]}`}
                  >
                    {VALIDATION_LABELS[document.validationStatus]}
                  </span>
                  {document.attachment && (
                    <button
                      className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() =>
                        openViewer(
                          document.attachment as Attachment,
                          `Documento - ${document.docType}`,
                        )
                      }
                      title="Visualizar evidência"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setEditingDocument(document)
                      setDocForm({
                        docType: document.docType,
                        issueDate: document.issueDate.slice(0, 10),
                        expirationDate: document.expirationDate.slice(0, 10),
                        validationStatus: document.validationStatus,
                        validationFeedback: document.validationFeedback || '',
                        file: null,
                        attachment: document.attachment,
                      })
                      setOpenModal('documents')
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="rounded-md border border-red-300 p-1.5 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      await deleteDocument(document.id)
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
                  <FileMeta attachment={training.attachment} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${COMPLIANCE_STATUS_BADGES[status]}`}
                  >
                    {COMPLIANCE_STATUS_LABELS[status]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${VALIDATION_BADGES[training.validationStatus]}`}
                  >
                    {VALIDATION_LABELS[training.validationStatus]}
                  </span>
                  {training.attachment && (
                    <button
                      className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() =>
                        openViewer(
                          training.attachment as Attachment,
                          `Treinamento - ${training.trainingName}`,
                        )
                      }
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setEditingTraining(training)
                      setTrainingForm({
                        trainingName: training.trainingName,
                        dateCompleted: training.dateCompleted.slice(0, 10),
                        validUntil: training.validUntil.slice(0, 10),
                        validationStatus: training.validationStatus,
                        validationFeedback: training.validationFeedback || '',
                        file: null,
                        attachment: training.attachment,
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
                  <FileMeta attachment={vaccine.attachment} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${COMPLIANCE_STATUS_BADGES[status]}`}
                  >
                    {COMPLIANCE_STATUS_LABELS[status]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${VALIDATION_BADGES[vaccine.validationStatus]}`}
                  >
                    {VALIDATION_LABELS[vaccine.validationStatus]}
                  </span>
                  {vaccine.attachment && (
                    <button
                      className="rounded-md border border-gray-300 p-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() =>
                        openViewer(
                          vaccine.attachment as Attachment,
                          `Vacina - ${vaccine.vaccineName}`,
                        )
                      }
                    >
                      <Eye size={14} />
                    </button>
                  )}
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
                        validationStatus: vaccine.validationStatus,
                        validationFeedback: vaccine.validationFeedback || '',
                        file: null,
                        attachment: vaccine.attachment,
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

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={
              openModal === 'documents'
                ? saveDocument
                : openModal === 'trainings'
                  ? saveTraining
                  : saveVaccine
            }
            className="w-full max-w-lg space-y-3 rounded-xl bg-white p-6 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {openModal === 'documents'
                ? editingDocument
                  ? 'Editar documento'
                  : 'Novo documento'
                : openModal === 'trainings'
                  ? editingTraining
                    ? 'Editar treinamento'
                    : 'Novo treinamento'
                  : editingVaccine
                    ? 'Editar vacina'
                    : 'Nova vacina'}
            </h3>

            {openModal === 'documents' && (
              <>
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
                    setDocForm((p) => ({
                      ...p,
                      expirationDate: e.target.value,
                    }))
                  }
                />
              </>
            )}

            {openModal === 'trainings' && (
              <>
                <select
                  className={INPUT_CLASS}
                  value={trainingForm.trainingName}
                  onChange={(e) =>
                    setTrainingForm((p) => ({
                      ...p,
                      trainingName: e.target.value,
                    }))
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
                    setTrainingForm((p) => ({
                      ...p,
                      validUntil: e.target.value,
                    }))
                  }
                />
              </>
            )}

            {openModal === 'vaccines' && (
              <>
                <input
                  className={INPUT_CLASS}
                  value={vaccineForm.vaccineName}
                  onChange={(e) =>
                    setVaccineForm((p) => ({
                      ...p,
                      vaccineName: e.target.value,
                    }))
                  }
                  placeholder="Nome da vacina"
                />
                <input
                  className={INPUT_CLASS}
                  value={vaccineForm.doseInfo}
                  onChange={(e) =>
                    setVaccineForm((p) => ({ ...p, doseInfo: e.target.value }))
                  }
                  placeholder="Informação da dose"
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
                    setVaccineForm((p) => ({
                      ...p,
                      nextDueDate: e.target.value,
                    }))
                  }
                />
              </>
            )}

            <label className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <span className="block">Evidência (.pdf, .jpg, .png)</span>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null
                    if (openModal === 'documents')
                      setDocForm((p) => ({ ...p, file }))
                    if (openModal === 'trainings')
                      setTrainingForm((p) => ({ ...p, file }))
                    if (openModal === 'vaccines')
                      setVaccineForm((p) => ({ ...p, file }))
                  }}
                />
                <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-300">
                  <UploadCloud size={16} />
                  Selecionar arquivo
                </div>
              </div>
            </label>

            {(openModal === 'documents'
              ? docForm.file || docForm.attachment
              : openModal === 'trainings'
                ? trainingForm.file || trainingForm.attachment
                : vaccineForm.file || vaccineForm.attachment) && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                {openModal === 'documents'
                  ? docForm.file?.name || docForm.attachment?.fileName
                  : openModal === 'trainings'
                    ? trainingForm.file?.name ||
                      trainingForm.attachment?.fileName
                    : vaccineForm.file?.name ||
                      vaccineForm.attachment?.fileName}
              </div>
            )}

            <select
              className={INPUT_CLASS}
              value={
                openModal === 'documents'
                  ? docForm.validationStatus
                  : openModal === 'trainings'
                    ? trainingForm.validationStatus
                    : vaccineForm.validationStatus
              }
              onChange={(e) => {
                const value = e.target.value as ValidationStatus
                if (openModal === 'documents')
                  setDocForm((p) => ({ ...p, validationStatus: value }))
                if (openModal === 'trainings')
                  setTrainingForm((p) => ({ ...p, validationStatus: value }))
                if (openModal === 'vaccines')
                  setVaccineForm((p) => ({ ...p, validationStatus: value }))
              }}
            >
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </select>

            {((openModal === 'documents' &&
              docForm.validationStatus === 'rejected') ||
              (openModal === 'trainings' &&
                trainingForm.validationStatus === 'rejected') ||
              (openModal === 'vaccines' &&
                vaccineForm.validationStatus === 'rejected')) && (
              <textarea
                className={INPUT_CLASS}
                placeholder="Feedback da rejeição"
                value={
                  openModal === 'documents'
                    ? docForm.validationFeedback
                    : openModal === 'trainings'
                      ? trainingForm.validationFeedback
                      : vaccineForm.validationFeedback
                }
                onChange={(e) => {
                  if (openModal === 'documents')
                    setDocForm((p) => ({
                      ...p,
                      validationFeedback: e.target.value,
                    }))
                  if (openModal === 'trainings')
                    setTrainingForm((p) => ({
                      ...p,
                      validationFeedback: e.target.value,
                    }))
                  if (openModal === 'vaccines')
                    setVaccineForm((p) => ({
                      ...p,
                      validationFeedback: e.target.value,
                    }))
                }}
              />
            )}

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

      <DocumentModal
        attachment={viewerAttachment}
        title={viewerTitle}
        onClose={() => setViewerAttachment(null)}
      />
    </section>
  )
}
