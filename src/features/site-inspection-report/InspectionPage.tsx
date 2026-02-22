import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../auth/useAuth'
import {
  clearInspectionInEdition,
  deriveInspectionStatus,
  getInspectionById,
  getInspectionInEditionId,
  isInspectionOpenCorrection,
  upsertInspection,
  type InspectionStatus,
} from '../inspection-history'
import { InspectionForm } from './InspectionForm'
import { PDFPreview } from './PDFPreview'
import type { InspectionForm as InspectionFormType } from './types'
import { CHECKLIST_ESTRUTURAL, CHECKLIST_NAO_ESTRUTURAL } from './constants.ts'

function getDefaultValues(): InspectionFormType {
  return {
    inspectionType: 'estrutural',
    header: {
      title: 'Inspeção 104-B',
      projectName: 'Flamboyant II',
      location: '102B',
      date: new Date().toISOString().split('T')[0],
      inspectorName: 'Rafael Bruno',
    },
    team: [],
    checklist: CHECKLIST_ESTRUTURAL.map((item) => ({
      id: crypto.randomUUID(),
      category: item.category,
      description: item.description,
      acceptanceCriteria: item.acceptanceCriteria,
      sampling: item.sampling,
      inspectionMethod: item.inspectionMethod,
      status: 'na',
      failReason: '',
      failResolution: null,
      correctionPlan: undefined,
      reinspectionDate: undefined,
    })),
    observations: '',
  }
}

function isFutureDate(value: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${value}T00:00:00`)
  return target.getTime() > today.getTime()
}

export function InspectionPage() {
  const { user } = useAuth()
  const [saveMessage, setSaveMessage] = useState('')
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error'>(
    'success',
  )
  const [editingInspectionId, setEditingInspectionId] = useState<string | null>(
    null,
  )
  const [editingBaseStatus, setEditingBaseStatus] =
    useState<InspectionStatus>('DRAFT')
  const [isReinspectionMode, setIsReinspectionMode] = useState(false)
  const [checklistType, setChecklistType] = useState('estrutural')

  const { register, watch, getValues, setValue, reset } =
    useForm<InspectionFormType>({
      defaultValues: getDefaultValues(),
    })

  const formData = watch()

  useEffect(() => {
    const inspectionId = getInspectionInEditionId()
    if (!inspectionId) return

    const inspection = getInspectionById(inspectionId)
    if (!inspection) {
      clearInspectionInEdition()
      return
    }

    if (
      inspection.status !== 'DRAFT' &&
      inspection.status !== 'DRAFT_OPEN_CORRECTION' &&
      inspection.status !== 'OPEN_CORRECTION'
    ) {
      clearInspectionInEdition()
      return
    }

    setEditingInspectionId(inspection.id)
    setEditingBaseStatus(inspection.status)
    setIsReinspectionMode(
      inspection.status === 'OPEN_CORRECTION' ||
        inspection.status === 'DRAFT_OPEN_CORRECTION',
    )
    setChecklistType(inspection.data.inspectionType || 'estrutural')
    reset(inspection.data)
    clearInspectionInEdition()
  }, [reset])

  const handleTeamChange = (team: InspectionFormType['team']) =>
    setValue('team', team)
  const handleChecklistChange = (checklist: InspectionFormType['checklist']) =>
    setValue('checklist', checklist)
  const handleProjectChange = (projectName: string) =>
    setValue('header.projectName', projectName)

  const persistInspection = (targetStatus: 'DRAFT' | 'FINISHED') => {
    const currentData = getValues()

    const currentPendingItems = currentData.checklist.filter(
      (item) =>
        item.status === 'fail' && item.failResolution === 'needs_correction',
    )

    const currentHasInvalidCorrectionData = currentPendingItems.some(
      (item) => !item.correctionPlan?.trim() || !item.reinspectionDate,
    )

    const currentHasFutureReinspectionDate = currentPendingItems.some(
      (item) => item.reinspectionDate && isFutureDate(item.reinspectionDate),
    )

    if (targetStatus === 'FINISHED' && currentHasInvalidCorrectionData) {
      setSaveMessageType('error')
      setSaveMessage(
        'Preencha plano de correção e data de reinspeção em todos os itens pendentes.',
      )
      window.setTimeout(() => setSaveMessage(''), 3500)
      return
    }

    if (
      targetStatus === 'FINISHED' &&
      isInspectionOpenCorrection(currentData) &&
      currentHasFutureReinspectionDate
    ) {
      setSaveMessageType('error')
      setSaveMessage(
        'A ficha só pode ser finalizada após a data de reinspeção dos itens pendentes.',
      )
      window.setTimeout(() => setSaveMessage(''), 4000)
      return
    }

    const statusForPersistence: InspectionStatus =
      targetStatus === 'DRAFT' ? editingBaseStatus : 'FINISHED'

    const saved = upsertInspection({
      id: editingInspectionId || undefined,
      form: currentData,
      status: statusForPersistence,
      createdBy: user?.name || 'Usuário não identificado',
    })

    const resolvedStatus = deriveInspectionStatus(
      currentData,
      statusForPersistence,
    )

    setEditingInspectionId(saved.id)
    setEditingBaseStatus(resolvedStatus)
    setIsReinspectionMode(
      resolvedStatus === 'OPEN_CORRECTION' ||
        resolvedStatus === 'DRAFT_OPEN_CORRECTION',
    )

    setSaveMessageType('success')
    setSaveMessage(
      targetStatus === 'DRAFT'
        ? 'Rascunho salvo com sucesso!'
        : resolvedStatus === 'OPEN_CORRECTION'
          ? 'Inspeção marcada como não-conforme (pendente de reinspeção).'
          : 'Inspeção finalizada com sucesso!',
    )

    if (resolvedStatus === 'FINISHED') {
      reset(getDefaultValues())
      setChecklistType('estrutural')
      setEditingInspectionId(null)
      setEditingBaseStatus('DRAFT')
      setIsReinspectionMode(false)
      clearInspectionInEdition()
    }

    window.setTimeout(() => setSaveMessage(''), 3000)
  }

  const loadChecklist = (type: string) => {
    const base =
      type === 'estrutural' ? CHECKLIST_ESTRUTURAL : CHECKLIST_NAO_ESTRUTURAL

    setValue(
      'checklist',
      base.map((item) => ({
        id: crypto.randomUUID(),
        category: item.category,
        description: item.description,
        acceptanceCriteria: item.acceptanceCriteria,
        sampling: item.sampling,
        inspectionMethod: item.inspectionMethod,
        status: 'na',
        failReason: '',
        failResolution: null,
        correctionPlan: undefined,
        reinspectionDate: undefined,
      })),
    )
  }

  const handleChecklistTypeChange = (type: string) => {
    setChecklistType(type)
    setValue('inspectionType', type as 'estrutural' | 'nao_estrutural')
    loadChecklist(type)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:h-[calc(100dvh-5.5rem)] lg:overflow-hidden">
      <div className="min-h-0 overflow-y-auto pr-4">
        <InspectionForm
          register={register}
          team={formData.team}
          onTeamChange={handleTeamChange}
          checklist={formData.checklist}
          onChecklistChange={handleChecklistChange}
          selectedProject={formData.header.projectName}
          onProjectChange={handleProjectChange}
          onSaveDraft={() => persistInspection('DRAFT')}
          onFinish={() => persistInspection('FINISHED')}
          isEditing={Boolean(editingInspectionId)}
          selectedChecklistType={checklistType}
          onChecklistTypeChange={handleChecklistTypeChange}
          isReinspectionMode={isReinspectionMode}
        />
        {saveMessage && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              saveMessageType === 'error'
                ? 'border border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300'
                : 'border border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
            }`}
          >
            {saveMessage}
          </p>
        )}
      </div>

      <div className="mt-6 block min-h-0 overflow-y-auto overflow-x-auto lg:mt-0">
        <div className="mx-auto min-w-[600px]">
          <PDFPreview
            data={formData}
            status={deriveInspectionStatus(formData, editingBaseStatus)}
          />
        </div>
      </div>
    </div>
  )
}
