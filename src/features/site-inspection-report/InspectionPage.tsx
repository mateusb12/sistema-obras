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
import {
  CHECKLIST_CONTRAPISO,
  CHECKLIST_ESTRUTURAL,
  CHECKLIST_NAO_ESTRUTURAL,
} from './constants.ts'
import { useToast } from '../toast/Toast.tsx'

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
      reinspectionResult: null,
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
  const toast = useToast()
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
  const [checklistType, setChecklistType] = useState<
    'estrutural' | 'nao_estrutural' | 'contrapiso'
  >('estrutural')
  const [editableItemIds, setEditableItemIds] = useState<Set<string>>(new Set())

  const { register, watch, getValues, setValue, reset } =
    useForm<InspectionFormType>({
      defaultValues: getDefaultValues(),
    })

  const formData = watch()

  useEffect(() => {
    const location = formData.header.location

    if (!location) return

    setValue('header.title', `Inspeção ${location}`)
  }, [formData.header.location])

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

    const isReinspection =
      inspection.status === 'OPEN_CORRECTION' ||
      inspection.status === 'DRAFT_OPEN_CORRECTION'

    setEditingInspectionId(inspection.id)
    setEditingBaseStatus(inspection.status)
    setIsReinspectionMode(isReinspection)
    setChecklistType(inspection.data.inspectionType || 'estrutural')

    let sortedChecklist = inspection.data.checklist || []
    if (isReinspection) {
      const pendingIds = new Set(
        sortedChecklist
          .filter(
            (item) =>
              item.status === 'fail' &&
              item.failResolution === 'needs_correction' &&
              item.reinspectionResult !== 'effective',
          )
          .map((item) => item.id),
      )
      setEditableItemIds(pendingIds)

      const getPriority = (item: any) => {
        if (
          item.status === 'fail' &&
          item.failResolution === 'needs_correction' &&
          item.reinspectionResult !== 'effective'
        )
          return 0
        if (item.status === 'fail') return 1
        if (item.status === 'ok') return 2
        return 3
      }

      sortedChecklist = [...sortedChecklist].sort(
        (a, b) => getPriority(a) - getPriority(b),
      )
    } else {
      setEditableItemIds(new Set())
    }

    reset({
      ...inspection.data,
      checklist: sortedChecklist,
    })

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

    const pendingItems = currentData.checklist.filter(
      (item) =>
        item.status === 'fail' &&
        item.failResolution === 'needs_correction' &&
        item.reinspectionResult !== 'effective',
    )

    if (targetStatus === 'FINISHED') {
      const hasMissingData = pendingItems.some(
        (item) => !item.correctionPlan?.trim() || !item.reinspectionDate,
      )

      if (hasMissingData) {
        toast.error(
          'Atenção: Preencha o plano de correção e a data em todos os itens reprovados.',
        )
        return
      }

      const hasFutureDate = pendingItems.some(
        (item) => item.reinspectionDate && isFutureDate(item.reinspectionDate),
      )

      if (hasFutureDate) {
        toast.error(
          'Bloqueio: Você não pode finalizar uma ficha com data futura de reinspeção.',
        )
        return
      }
    }

    const statusForPersistence: InspectionStatus =
      targetStatus === 'DRAFT' ? editingBaseStatus : 'FINISHED'

    const saved = upsertInspection({
      id: editingInspectionId || undefined,
      form: currentData,
      status: statusForPersistence,
      createdBy: user?.name || 'Usuário não identificado',
    })

    const newStatus = deriveInspectionStatus(currentData, statusForPersistence)
    const isNowFinished = newStatus === 'FINISHED'

    if (targetStatus === 'DRAFT') {
      toast.success('Rascunho atualizado com sucesso!')
    } else if (isNowFinished) {
      toast.success('Sucesso! A inspeção foi totalmente concluída e arquivada.')

      reset(getDefaultValues())
      setEditingInspectionId(null)
      setEditingBaseStatus('DRAFT')
      setIsReinspectionMode(false)
      clearInspectionInEdition()
    } else {
      toast.info(
        'Dados salvos! A ficha continua como "Aguardando Reinspeção" pois ainda há itens com falha.',
      )
    }

    if (!isNowFinished) {
      setEditingInspectionId(saved.id)
      setEditingBaseStatus(newStatus)
      setIsReinspectionMode(
        newStatus === 'OPEN_CORRECTION' ||
          newStatus === 'DRAFT_OPEN_CORRECTION',
      )
    }
  }

  const loadChecklist = (type: string) => {
    const base =
      type === 'estrutural'
        ? CHECKLIST_ESTRUTURAL
        : type === 'nao_estrutural'
          ? CHECKLIST_NAO_ESTRUTURAL
          : CHECKLIST_CONTRAPISO

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
        reinspectionResult: null,
      })),
    )
  }

  const handleChecklistTypeChange = (
    type: 'estrutural' | 'nao_estrutural' | 'contrapiso',
  ) => {
    setChecklistType(type)
    setValue('inspectionType', type)
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
          editableItemIds={editableItemIds}
        />
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
